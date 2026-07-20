import { z } from "zod";

export const createTicketSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  subject: z.string({ message: "Subject is required" }).min(1),
  description: z.string({ message: "Description is required" }).min(1),
  category: z.enum(["IT", "HR", "Facilities", "Finance"], {
    message: "Category must be IT, HR, Facilities, or Finance",
  }),
  priority: z.enum(["High", "Medium", "Low"], {
    message: "Priority must be High, Medium, or Low",
  }),
});
