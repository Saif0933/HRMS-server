import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["SUPER_ADMIN", "PLATFORM_ADMIN", "ADMIN"]).optional().default("SUPER_ADMIN"),
  avatar: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Suspended"]).optional().default("Active"),
});

export const loginAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;
