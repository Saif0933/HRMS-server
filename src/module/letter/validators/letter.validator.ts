import { z } from "zod";

export const issueLetterSchema = z.object({
  templateType: z.enum(["offer", "warning", "experience"], {
    message: "Template category must be offer, warning, or experience",
  }),
  recipientName: z.string({ message: "Recipient name is required" }).min(1),
  recipientRole: z.string({ message: "Recipient role is required" }).min(1),
  joiningDate: z.string().optional().nullable(),
  salaryCtc: z.string().optional().nullable(),
  warningReason: z.string().optional().nullable(),
});
