import { PayrollRepository } from "../repo/payroll.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class PayrollService {
  // Get or Create Payroll Cycle
  static async getOrCreateCycle(month: string, year: number) {
    let cycle = await PayrollRepository.findCycle(month, year);
    if (!cycle) {
      cycle = await PayrollRepository.createCycle(month, year);
    }

    const runs = await PayrollRepository.findRunsForCycle(cycle.id);
    const exclusions = await PayrollRepository.findExclusions(cycle.id);

    // Calculate statutory stats for EPF
    let totalEpfWages = 0;
    let totalPfContribution = 0;

    runs.forEach((run) => {
      const isExcluded = exclusions.some((ex) => ex.employeeId === run.employeeId);
      if (!isExcluded) {
        const epfWages = Math.min(run.basic, 15000);
        totalEpfWages += epfWages;
        totalPfContribution += Math.round(epfWages * 0.12);
      }
    });

    return {
      cycle,
      runs,
      exclusions,
      stats: {
        totalEpfWages,
        totalPfContribution,
        compliant: true,
      },
    };
  }

  // Update Cycle Status and Generate Salary Runs
  static async updateCycleStatus(id: string, status: string) {
    const cycle = await prisma.payrollCycle.findUnique({ where: { id } });
    if (!cycle) {
      throw new ErrorResponse("Payroll cycle not found", statusCode.Not_Found);
    }

    // If moving to PROCESSING_SALARIES, compute salary runs for all ACTIVE employees
    if (status === "PROCESSING_SALARIES" && cycle.status === "PENDING_ATTENDANCE_LOCK") {
      // 1. Get all ACTIVE employees
      const employees = await prisma.employee.findMany({
        where: { status: "ACTIVE" },
      });

      // 2. Fetch exclusions
      const exclusions = await PayrollRepository.findExclusions(cycle.id);
      const excludedIds = exclusions.map((ex) => ex.employeeId);

      // 3. Delete any stale runs first
      await PayrollRepository.deleteRunsForCycle(cycle.id);

      // 4. Compute and create run for each employee
      for (const emp of employees) {
        const isExcluded = excludedIds.includes(emp.id);
        
        // Base salary calculations
        const basic = emp.basic || 15000;
        const hra = emp.hra || 6000;
        const allowance = emp.allowance || 4000;

        // PF deduction: 12% of basic (capped at 15000 EPF limit)
        const pf = Math.round(Math.min(basic, 15000) * 0.12);
        
        // Professional tax (PT) standard ₹200
        const pt = 200;

        // Income tax (TDS) estimation: 10% of basic if basic > 30000, else 0
        const tds = basic > 30000 ? Math.round(basic * 0.10) : 0;

        // Deductions sum
        const deductions = pf + pt + tds;

        // Net salary
        const netSalary = (basic + hra + allowance) - deductions;

        await PayrollRepository.createRun({
          employeeId: emp.id,
          cycleId: cycle.id,
          basic,
          hra,
          allowance,
          pf,
          pt,
          tds,
          bonus: 0,
          arrear: 0,
          deductions,
          netSalary,
          status: isExcluded ? "HELD" : "PENDING",
        });
      }
    } else if (status === "DISBURSED") {
      // Mark all runs as PAID unless HELD
      const exclusions = await PayrollRepository.findExclusions(cycle.id);
      const excludedIds = exclusions.map((ex) => ex.employeeId);

      const runs = await PayrollRepository.findRunsForCycle(cycle.id);
      for (const run of runs) {
        const isExcluded = excludedIds.includes(run.employeeId);
        await PayrollRepository.updateRun(run.id, {
          status: isExcluded ? "HELD" : "PAID",
        });
      }
    }

    const updated = await PayrollRepository.updateCycleStatus(id, status);
    return this.getOrCreateCycle(updated.month, updated.year);
  }

  // Calculate Arrears
  static async calculateArrears(cycleId: string) {
    const cycle = await prisma.payrollCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
      throw new ErrorResponse("Payroll cycle not found", statusCode.Not_Found);
    }

    const runs = await PayrollRepository.findRunsForCycle(cycle.id);
    const exclusions = await PayrollRepository.findExclusions(cycle.id);
    const excludedIds = exclusions.map((ex) => ex.employeeId);

    for (const run of runs) {
      if (!excludedIds.includes(run.employeeId)) {
        // Mock arrear: 5% of basic salary
        const arrear = Math.round(run.basic * 0.05);
        const netSalary = (run.basic + run.hra + run.allowance + run.bonus + arrear) - run.deductions;

        await PayrollRepository.updateRun(run.id, {
          arrear,
          netSalary,
        });
      }
    }

    return this.getOrCreateCycle(cycle.month, cycle.year);
  }

  // Bulk salary revisions
  static async applyBulkRevision(incrementPercentage: number, departmentId?: string | null) {
    // 1. Get all employees in the department (or all employees if departmentId is not provided)
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        departmentId: departmentId || undefined,
      },
    });

    if (employees.length === 0) {
      throw new ErrorResponse("No active employees found to revise", statusCode.Not_Found);
    }

    const factor = 1 + incrementPercentage / 100;

    for (const emp of employees) {
      const basic = Math.round((emp.basic || 15000) * factor);
      const hra = Math.round((emp.hra || 6000) * factor);
      const allowance = Math.round((emp.allowance || 4000) * factor);
      const netSalary = (basic + hra + allowance) - (emp.deductions || 3400);

      await prisma.employee.update({
        where: { id: emp.id },
        data: {
          basic,
          hra,
          allowance,
          netSalary,
        },
      });
    }

    return {
      message: `Successfully applied bulk revision of ${incrementPercentage}% to ${employees.length} employees`,
      count: employees.length,
    };
  }

  // Toggle Hold / Stop Payment
  static async toggleStopPayment(employeeId: string, cycleId: string, reason?: string | null) {
    const cycle = await prisma.payrollCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) {
      throw new ErrorResponse("Payroll cycle not found", statusCode.Not_Found);
    }

    const existing = await PayrollRepository.findExclusion(employeeId, cycleId);
    if (existing) {
      await PayrollRepository.deleteExclusion(employeeId, cycleId);
      
      // Update run status back to PENDING if run exists
      const run = await PayrollRepository.findRun(employeeId, cycleId);
      if (run) {
        await PayrollRepository.updateRun(run.id, { status: "PENDING" });
      }
    } else {
      await PayrollRepository.createExclusion(employeeId, cycleId, reason || "Hold by admin request");
      
      // Update run status to HELD if run exists
      const run = await PayrollRepository.findRun(employeeId, cycleId);
      if (run) {
        await PayrollRepository.updateRun(run.id, { status: "HELD" });
      }
    }

    return this.getOrCreateCycle(cycle.month, cycle.year);
  }

  // Apply Loan/Advance
  static async applyLoan(employeeId: string, principal: number, emi: number, purpose?: string | null) {
    // Check if employee exists
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    const loan = await PayrollRepository.createLoan({
      employeeId,
      principal,
      balance: principal,
      emi,
      purpose,
      status: "ACTIVE",
    });

    // Create initial transaction for disbursement
    await PayrollRepository.createLoanTransaction({
      loanId: loan.id,
      amount: principal,
      type: "DISBURSEMENT",
    });

    return loan;
  }

  // Get Loans
  static async getLoans(employeeId?: string) {
    return PayrollRepository.findLoans(employeeId);
  }

  // Save Tax Declaration
  static async saveTaxDeclaration(employeeId: string, financialYear: string, declarationData: any) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    return PayrollRepository.upsertTaxDeclaration(employeeId, financialYear, declarationData);
  }

  // Get Tax Declaration
  static async getTaxDeclaration(employeeId: string, financialYear: string) {
    const declaration = await PayrollRepository.findTaxDeclaration(employeeId, financialYear);
    if (!declaration) {
      return {
        employeeId,
        financialYear,
        sec80C: 0,
        sec80D: 0,
        declaredHra: 0,
      };
    }
    return declaration;
  }
}
