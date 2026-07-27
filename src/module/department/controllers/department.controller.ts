import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.ts";
import { DepartmentService } from "../services/department.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validators/department.validator.ts";

export const createDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = createDepartmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const department = await DepartmentService.createDepartment(parsed.data, req.user?.organizationId);

  return SuccessResponse(
    res,
    "Department created successfully",
    department,
    statusCode.Created
  );
});

export const getDepartments = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const departments = await DepartmentService.getDepartments(req.user?.organizationId);

  return SuccessResponse(
    res,
    "Departments retrieved successfully",
    departments,
    statusCode.OK
  );
});

export const getDepartmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const department = await DepartmentService.getDepartmentById(id);

  return SuccessResponse(
    res,
    "Department retrieved successfully",
    department,
    statusCode.OK
  );
});

export const updateDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = updateDepartmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const updatedDepartment = await DepartmentService.updateDepartment(id, parsed.data, req.user?.organizationId);

  return SuccessResponse(
    res,
    "Department updated successfully",
    updatedDepartment,
    statusCode.OK
  );
});

export const deleteDepartment = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  await DepartmentService.deleteDepartment(id);

  return SuccessResponse(
    res,
    "Department deleted successfully",
    {},
    statusCode.OK
  );
});
