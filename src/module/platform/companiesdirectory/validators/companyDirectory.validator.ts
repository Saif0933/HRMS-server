import { z } from "zod";

export const companyClientSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  employeeCount: z.number().int().nonnegative().default(0),
  licenseTier: z.enum(["Enterprise", "Pro", "Starter"]).default("Starter"),
  status: z.enum(["Active", "Onboarding", "Suspended"]).default("Active"),
  contactEmail: z.string().email("Invalid contact email address"),
  onboardedDate: z.string().optional(),
  iconName: z.string().optional(),
  iconColor: z.string().optional(),
  iconBg: z.string().optional(),
});

export type CompanyClientInput = z.infer<typeof companyClientSchema>;
