import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.ts";
import { TimesheetService } from "../services/timesheet.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { submitTimesheetSchema, updateTimesheetStatusSchema } from "../validators/timesheet.validator.ts";

export const getTimesheets = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const status = req.query.status as string | undefined;

  const timesheets = await TimesheetService.getTimesheets({
    employeeId,
    status,
    organizationId: req.user?.organizationId,
  });

  return SuccessResponse(
    res,
    "Timesheets retrieved successfully",
    timesheets,
    statusCode.OK
  );
});

export const submitTimesheet = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = submitTimesheetSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const timesheet = await TimesheetService.submitTimesheet(parsed.data, req.user?.organizationId);

  return SuccessResponse(
    res,
    "Timesheet submitted successfully",
    timesheet,
    statusCode.Created
  );
});

export const updateTimesheetStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = updateTimesheetStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const timesheet = await TimesheetService.updateTimesheetStatus(id, parsed.data.status);

  return SuccessResponse(
    res,
    "Timesheet status updated successfully",
    timesheet,
    statusCode.OK
  );
});
