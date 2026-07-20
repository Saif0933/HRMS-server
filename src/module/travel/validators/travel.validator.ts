import { z } from "zod";

export const applyClaimSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  type: z.enum(["Travel", "Mileage", "Food", "Accommodation", "Other"], {
    message: "Invalid claim category type",
  }),
  amount: z.number({ message: "Amount must be a number" }).positive({ message: "Amount must be greater than zero" }),
  date: z.string({ message: "Expense date is required" }).min(1),
  reason: z.string({ message: "Reason / justification is required" }).min(1),
  receiptUrl: z.string().optional().nullable(),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"], {
    message: "Status must be Approved or Rejected",
  }),
});
