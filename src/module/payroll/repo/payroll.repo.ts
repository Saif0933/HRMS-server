import { prisma } from "../../../db/prisma.ts";

export class PayrollRepository {
  // Payroll Cycle
  static async findCycle(month: string, year: number) {
    return prisma.payrollCycle.findUnique({
      where: {
        month_year: { month, year },
      },
    });
  }

  static async createCycle(month: string, year: number) {
    return prisma.payrollCycle.create({
      data: { month, year, status: "PENDING_ATTENDANCE_LOCK" },
    });
  }

  static async updateCycleStatus(id: string, status: string) {
    return prisma.payrollCycle.update({
      where: { id },
      data: { status },
    });
  }

  // Payroll Runs
  static async findRunsForCycle(cycleId: string) {
    return prisma.payrollRun.findMany({
      where: { cycleId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            designation: true,
            uan: true,
            pan: true,
            bankName: true,
            bankAccount: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { employee: { name: "asc" } },
    });
  }

  static async findRun(employeeId: string, cycleId: string) {
    return prisma.payrollRun.findUnique({
      where: {
        employeeId_cycleId: { employeeId, cycleId },
      },
    });
  }

  static async createRun(data: any) {
    return prisma.payrollRun.create({
      data,
    });
  }

  static async updateRun(id: string, data: any) {
    return prisma.payrollRun.update({
      where: { id },
      data,
    });
  }

  static async deleteRunsForCycle(cycleId: string) {
    return prisma.payrollRun.deleteMany({
      where: { cycleId },
    });
  }

  static async upsertRun(employeeId: string, cycleId: string, data: any) {
    return prisma.payrollRun.upsert({
      where: {
        employeeId_cycleId: { employeeId, cycleId },
      },
      update: data,
      create: {
        employeeId,
        cycleId,
        ...data,
      },
    });
  }

  // Payroll Exclusions / Holds
  static async findExclusions(cycleId: string) {
    return prisma.payrollExclusion.findMany({
      where: { cycleId },
      include: { employee: true },
    });
  }

  static async findExclusion(employeeId: string, cycleId: string) {
    return prisma.payrollExclusion.findUnique({
      where: {
        employeeId_cycleId: { employeeId, cycleId },
      },
    });
  }

  static async createExclusion(employeeId: string, cycleId: string, reason?: string) {
    return prisma.payrollExclusion.create({
      data: { employeeId, cycleId, reason },
    });
  }

  static async deleteExclusion(employeeId: string, cycleId: string) {
    return prisma.payrollExclusion.delete({
      where: {
        employeeId_cycleId: { employeeId, cycleId },
      },
    });
  }

  // Loans
  static async findLoans(employeeId?: string) {
    return prisma.loan.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: {
        employee: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findLoanById(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: { transactions: true },
    });
  }

  static async createLoan(data: any) {
    return prisma.loan.create({
      data,
      include: { employee: true },
    });
  }

  static async updateLoan(id: string, data: any) {
    return prisma.loan.update({
      where: { id },
      data,
    });
  }

  static async createLoanTransaction(data: any) {
    return prisma.loanTransaction.create({
      data,
    });
  }

  // Tax Declarations
  static async findTaxDeclaration(employeeId: string, financialYear: string) {
    return prisma.taxDeclaration.findUnique({
      where: {
        employeeId_financialYear: { employeeId, financialYear },
      },
    });
  }

  static async upsertTaxDeclaration(employeeId: string, financialYear: string, data: any) {
    return prisma.taxDeclaration.upsert({
      where: {
        employeeId_financialYear: { employeeId, financialYear },
      },
      update: data,
      create: {
        employeeId,
        financialYear,
        ...data,
      },
    });
  }
}
