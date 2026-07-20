import type { Request, Response, NextFunction } from "express";
import { PayrollService } from "../services/payroll.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  getOrCreateCycleSchema,
  updateCycleStatusSchema,
  bulkRevisionSchema,
  toggleHoldSchema,
  applyLoanSchema,
  saveTaxDeclarationSchema,
} from "../validators/payroll.validator.ts";

// Cycle Controllers
export const getOrCreateCycle = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const month = req.query.month as string;
  const year = Number(req.query.year);

  const parsed = getOrCreateCycleSchema.safeParse({ month, year });
  if (!parsed.success) {
    return next(parsed.error);
  }

  const data = await PayrollService.getOrCreateCycle(parsed.data.month, parsed.data.year);
  return SuccessResponse(res, "Payroll cycle details retrieved", data, statusCode.OK);
});

export const updateCycleStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const parsed = updateCycleStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const data = await PayrollService.updateCycleStatus(id, parsed.data.status);
  return SuccessResponse(res, "Payroll cycle status updated successfully", data, statusCode.OK);
});

export const calculateArrears = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { cycleId } = req.params;
  if (!cycleId) {
    return next(new Error("Cycle ID is required"));
  }

  const data = await PayrollService.calculateArrears(cycleId);
  return SuccessResponse(res, "Arrears calculated successfully", data, statusCode.OK);
});

// Bulk revision Controller
export const applyBulkRevision = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = bulkRevisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const result = await PayrollService.applyBulkRevision(
    parsed.data.incrementPercentage,
    parsed.data.departmentId
  );
  return SuccessResponse(res, result.message, result, statusCode.OK);
});

// Exclusion / Hold Controller
export const toggleStopPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { cycleId } = req.params;
  const parsed = toggleHoldSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const data = await PayrollService.toggleStopPayment(
    parsed.data.employeeId,
    cycleId,
    parsed.data.reason
  );
  return SuccessResponse(res, "Stop payment status updated", data, statusCode.OK);
});

// Loan Controllers
export const applyLoan = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = applyLoanSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const loan = await PayrollService.applyLoan(
    parsed.data.employeeId,
    parsed.data.principal,
    parsed.data.emi,
    parsed.data.purpose
  );
  return SuccessResponse(res, "Loan application approved successfully", loan, statusCode.Created);
});

export const getLoans = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const loans = await PayrollService.getLoans(employeeId);
  return SuccessResponse(res, "Loans ledger retrieved successfully", loans, statusCode.OK);
});

// Tax Declaration Controllers
export const saveTaxDeclaration = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = saveTaxDeclarationSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const { employeeId, financialYear, ...fields } = parsed.data;
  const declaration = await PayrollService.saveTaxDeclaration(employeeId, financialYear, fields);
  return SuccessResponse(res, "Investment declaration saved successfully", declaration, statusCode.OK);
});

export const getTaxDeclaration = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string;
  const financialYear = req.query.financialYear as string;

  if (!employeeId || !financialYear) {
    return next(new Error("Employee ID and Financial Year are required"));
  }

  const declaration = await PayrollService.getTaxDeclaration(employeeId, financialYear);
  return SuccessResponse(res, "Investment declaration retrieved", declaration, statusCode.OK);
});
