import { z } from "zod";

export const submitTimesheetSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  project: z.string({ message: "Billing Project is required" }).min(1),
  task: z.string({ message: "Activity Task is required" }).min(1),
  monHours: z.number().min(0).max(24),
  tueHours: z.number().min(0).max(24),
  wedHours: z.number().min(0).max(24),
  thuHours: z.number().min(0).max(24),
  friHours: z.number().min(0).max(24),
  week: z.string({ message: "Week range is required" }).min(1),
});

export const updateTimesheetStatusSchema = z.object({
  status: z.enum(["Approved", "Pending", "Rejected"], {
    message: "Status must be Approved, Pending, or Rejected",
  }),
});
