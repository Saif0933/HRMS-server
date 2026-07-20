import { z } from "zod";

export const createLeaveTypeSchema = z.object({
  name: z
    .string({ message: "Leave type name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  code: z
    .string({ message: "Leave type code is required" })
    .min(1, "Code is required")
    .max(10, "Code must not exceed 10 characters")
    .toUpperCase(),
  description: z.string().optional(),
  defaultDays: z.number({ message: "Default days must be a number" }).nonnegative(),
  carryForward: z.boolean().optional().default(false),
  maxCarryForward: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateLeaveTypeSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  code: z.string().min(1).max(10).toUpperCase().optional(),
  description: z.string().optional(),
  defaultDays: z.number().nonnegative().optional(),
  carryForward: z.boolean().optional(),
  maxCarryForward: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const allocateLeaveSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  leaveTypeId: z.string({ message: "Leave Type ID is required" }),
  year: z.number({ message: "Year is required" }).int().min(2000).max(2100),
  allocated: z.number({ message: "Allocated days must be a number" }).nonnegative(),
  carriedForward: z.number().optional().default(0),
});

export const requestLeaveSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  leaveTypeId: z.string({ message: "Leave Type ID is required" }).min(1, "Leave Type ID cannot be empty"),
  startDate: z.string({ message: "Start date is required" }).transform((val) => new Date(val)),
  endDate: z.string({ message: "End date is required" }).transform((val) => new Date(val)),
  halfDay: z.boolean().optional().default(false),
  halfDaySession: z.enum(["FIRST_HALF", "SECOND_HALF"]).nullable().optional(),
  reason: z
    .string({ message: "Reason for leave is required" })
    .min(5, "Reason must be at least 5 characters")
    .max(500, "Reason must not exceed 500 characters"),
  attachmentUrl: z.string().url("Invalid attachment URL").optional().nullable(),
});

export const processLeaveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    message: "Status must be either APPROVED or REJECTED",
  }),
  rejectionReason: z.string().optional(),
});
