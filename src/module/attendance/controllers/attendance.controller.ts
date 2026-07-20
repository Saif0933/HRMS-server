import type { Request, Response, NextFunction } from "express";
import { AttendanceService } from "../services/attendance.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  createPunchSchema,
  applyRegularizationSchema,
  approveRejectRegularizationSchema,
  createGeofenceSchema,
} from "../validators/attendance.validator.ts";

export const getPunches = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.params.employeeId as string;
  const punches = await AttendanceService.getPunches(employeeId);
  return SuccessResponse(
    res,
    "Punches retrieved successfully",
    punches,
    statusCode.OK
  );
});

export const createPunch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createPunchSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const punch = await AttendanceService.createPunch(parsed.data);
  return SuccessResponse(
    res,
    "Punch recorded successfully",
    punch,
    statusCode.Created
  );
});

export const getRegularizations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const regs = await AttendanceService.getRegularizations();
  return SuccessResponse(
    res,
    "Regularizations retrieved successfully",
    regs,
    statusCode.OK
  );
});

export const applyRegularization = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = applyRegularizationSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const reg = await AttendanceService.applyRegularization(parsed.data);
  return SuccessResponse(
    res,
    "Regularization applied successfully",
    reg,
    statusCode.Created
  );
});

export const updateRegularization = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = approveRejectRegularizationSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const reg = await AttendanceService.updateRegularization(id, parsed.data.status);
  return SuccessResponse(
    res,
    "Regularization status updated successfully",
    reg,
    statusCode.OK
  );
});

export const getGeofences = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const geofences = await AttendanceService.getGeofences();
  return SuccessResponse(
    res,
    "Geofences retrieved successfully",
    geofences,
    statusCode.OK
  );
});

export const createGeofence = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createGeofenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const geofence = await AttendanceService.createGeofence(parsed.data);
  return SuccessResponse(
    res,
    "Geofence location registered successfully",
    geofence,
    statusCode.Created
  );
});

export const deleteGeofence = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  await AttendanceService.deleteGeofence(id);
  return SuccessResponse(
    res,
    "Geofence location deleted successfully",
    null,
    statusCode.OK
  );
});

