import { z } from "zod";

export const createSubscriptionPlanSchema = z.object({
  code: z.string({ message: "Plan code is required" }).min(1),
  name: z.string({ message: "Plan name is required" }).min(1),
  tagline: z.string().optional(),
  icon: z.string().optional().default("Send"),
  iconBg: z.string().optional(),
  price: z.number({ message: "Price is required" }).min(0),
  billing: z.string().optional().default("Billed annually"),
  btnText: z.string().optional().default("Get Started"),
  btnStyle: z.string().optional(),
  checkColor: z.string().optional(),
  popular: z.boolean().optional().default(false),
  features: z.array(z.string()).default([]),
  maxEmployees: z.number().int().default(25),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  sortOrder: z.number().int().optional().default(0),
});

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

export const subscribePlanSchema = z.object({
  planId: z.string({ message: "Plan ID or code is required" }).min(1),
  billingCycle: z.enum(["ANNUAL", "MONTHLY"]).optional().default("ANNUAL"),
  organizationId: z.string().optional(),
});

export const createComparisonRowSchema = z.object({
  label: z.string({ message: "Comparison label is required" }).min(1),
  basic: z.union([z.string(), z.boolean()]).transform((val) => String(val)),
  pro: z.union([z.string(), z.boolean()]).transform((val) => String(val)),
  ent: z.union([z.string(), z.boolean()]).transform((val) => String(val)),
  sortOrder: z.number().int().optional().default(0),
});

export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>;
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>;
export type SubscribePlanInput = z.infer<typeof subscribePlanSchema>;
export type CreateComparisonRowInput = z.infer<typeof createComparisonRowSchema>;
