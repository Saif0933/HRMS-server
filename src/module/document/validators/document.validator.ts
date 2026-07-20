import { z } from "zod";

export const uploadDocumentSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  name: z.string({ message: "Document name is required" }).min(1),
  category: z.enum(["Identity", "Contract", "Academic", "Tax"], {
    message: "Category must be Identity, Contract, Academic, or Tax",
  }),
  expiresOn: z.string().optional().nullable(),
});
