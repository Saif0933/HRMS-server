import { z } from "zod";

export const getOrCreateCycleSchema = z.object({
  month: z.string({ message: "Month is required" }),
  year: z.number({ message: "Year is required" }).int().min(2000).max(2100),
});

export const updateCycleStatusSchema = z.object({
  status: z.enum(["PENDING_ATTENDANCE_LOCK", "PROCESSING_SALARIES", "DISBURSED"], {
    message: "Invalid payroll cycle status",
  }),
});

export const bulkRevisionSchema = z.object({
  incrementPercentage: z.number({ message: "Increment percentage must be a number" }).positive(),
  departmentId: z.string().optional().nullable(),
});

export const toggleHoldSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  reason: z.string().optional().nullable(),
});

export const applyLoanSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  principal: z.number({ message: "Principal amount must be positive" }).positive(),
  emi: z.number({ message: "EMI must be positive" }).positive(),
  purpose: z.string().optional().nullable(),
});

export const saveTaxDeclarationSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  financialYear: z.string({ message: "Financial year is required" }),
  sec80C: z.number().nonnegative().optional().default(0),
  sec80D: z.number().nonnegative().optional().default(0),
  declaredHra: z.number().nonnegative().optional().default(0),
});
