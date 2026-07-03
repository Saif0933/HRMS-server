import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z
    .string({ message: "Permission name is required" })
    .min(2, "Permission name must be at least 2 characters")
    .max(100, "Permission name must not exceed 100 characters"),
  description: z.string().optional(),
  module: z.string().optional(),
});

export const createRoleSchema = z.object({
  name: z
    .string({ message: "Role name is required" })
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name must not exceed 100 characters"),
  description: z.string().optional(),
  permissionIds: z
    .array(z.string(), { message: "Permissions must be an array of permission IDs" })
    .min(1, "At least one permission must be selected"),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name must not exceed 100 characters")
    .optional(),
  description: z.string().optional(),
  permissionIds: z
    .array(z.string())
    .optional(),
});

export const assignRoleSchema = z.object({
  userId: z.string({ message: "User ID is required" }),
  roleId: z.string().nullable().optional(),
});
