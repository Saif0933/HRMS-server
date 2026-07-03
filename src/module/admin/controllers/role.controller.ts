import type { Request, Response, NextFunction } from "express";
import { RoleService } from "../services/role.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  createPermissionSchema,
  createRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
} from "../validators/role.validator.ts";

/**
 * @desc    Create a new permission node
 * @route   POST /api/v1/admin/permissions
 * @access  Private (Admin only)
 */
export const createPermission = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createPermissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const permission = await RoleService.createPermission(parsed.data);

  return SuccessResponse(
    res,
    "Permission created successfully",
    permission,
    statusCode.Created
  );
});

/**
 * @desc    Get all permissions
 * @route   GET /api/v1/admin/permissions
 * @access  Private (Admin only)
 */
export const getPermissions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const permissions = await RoleService.getPermissions();

  return SuccessResponse(
    res,
    "Permissions retrieved successfully",
    permissions,
    statusCode.OK
  );
});

/**
 * @desc    Create a new role with associated permissions
 * @route   POST /api/v1/admin/roles
 * @access  Private (Admin only)
 */
export const createRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const role = await RoleService.createRole(parsed.data);

  return SuccessResponse(
    res,
    "Role created successfully",
    role,
    statusCode.Created
  );
});

/**
 * @desc    Get all roles with their permissions
 * @route   GET /api/v1/admin/roles
 * @access  Private (Admin only)
 */
export const getRoles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const roles = await RoleService.getRoles();

  return SuccessResponse(
    res,
    "Roles retrieved successfully",
    roles,
    statusCode.OK
  );
});

/**
 * @desc    Update an existing role's name, description, and permissions
 * @route   PUT /api/v1/admin/roles/:id
 * @access  Private (Admin only)
 */
export const updateRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const updatedRole = await RoleService.updateRole(id, parsed.data);

  return SuccessResponse(
    res,
    "Role updated successfully",
    updatedRole,
    statusCode.OK
  );
});

/**
 * @desc    Delete a role
 * @route   DELETE /api/v1/admin/roles/:id
 * @access  Private (Admin only)
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  await RoleService.deleteRole(id);

  return SuccessResponse(
    res,
    "Role deleted successfully",
    {},
    statusCode.OK
  );
});

/**
 * @desc    Assign a role to a user
 * @route   POST /api/v1/admin/assign-role
 * @access  Private (Admin only)
 */
export const assignRoleToUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = assignRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const { userId, roleId } = parsed.data;
  const updatedUser = await RoleService.assignRoleToUser(userId, roleId || null);

  return SuccessResponse(
    res,
    "Role assigned to user successfully",
    updatedUser,
    statusCode.OK
  );
});
