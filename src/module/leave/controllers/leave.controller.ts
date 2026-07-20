import type { Request, Response, NextFunction } from "express";
import { LeaveService } from "../services/leave.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
  allocateLeaveSchema,
  requestLeaveSchema,
  processLeaveRequestSchema,
} from "../validators/leave.validator.ts";

// LeaveType Controller Methods
export const createLeaveType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createLeaveTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const leaveType = await LeaveService.createLeaveType(parsed.data);

  return SuccessResponse(
    res,
    "Leave type created successfully",
    leaveType,
    statusCode.Created
  );
});

export const getLeaveTypes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const activeOnly = req.query.activeOnly === "true";
  const leaveTypes = await LeaveService.getLeaveTypes(activeOnly);

  return SuccessResponse(
    res,
    "Leave types retrieved successfully",
    leaveTypes,
    statusCode.OK
  );
});

export const getLeaveTypeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const leaveType = await LeaveService.getLeaveTypeById(id);

  return SuccessResponse(
    res,
    "Leave type retrieved successfully",
    leaveType,
    statusCode.OK
  );
});

export const updateLeaveType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = updateLeaveTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const updatedType = await LeaveService.updateLeaveType(id, parsed.data);

  return SuccessResponse(
    res,
    "Leave type updated successfully",
    updatedType,
    statusCode.OK
  );
});

export const deleteLeaveType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const deletedOrDeactivated = await LeaveService.deleteLeaveType(id);

  return SuccessResponse(
    res,
    "Leave type deleted/deactivated successfully",
    deletedOrDeactivated,
    statusCode.OK
  );
});

// LeaveAllocation Controller Methods
export const allocateLeave = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = allocateLeaveSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const allocation = await LeaveService.allocateLeave(parsed.data);

  return SuccessResponse(
    res,
    "Leave allocation updated successfully",
    allocation,
    statusCode.OK
  );
});

export const getLeaveAllocations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

  const allocations = await LeaveService.getLeaveAllocations({ employeeId, year });

  return SuccessResponse(
    res,
    "Leave allocations retrieved successfully",
    allocations,
    statusCode.OK
  );
});

// LeaveRequest Controller Methods
export const requestLeave = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = requestLeaveSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const request = await LeaveService.requestLeave(parsed.data);

  return SuccessResponse(
    res,
    "Leave request submitted successfully",
    request,
    statusCode.Created
  );
});

export const getLeaveRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const leaveTypeId = req.query.leaveTypeId as string | undefined;
  const status = req.query.status as any | undefined;

  const requests = await LeaveService.getLeaveRequests({ employeeId, leaveTypeId, status });

  return SuccessResponse(
    res,
    "Leave requests retrieved successfully",
    requests,
    statusCode.OK
  );
});

export const getLeaveRequestById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const request = await LeaveService.getLeaveRequestById(id);

  return SuccessResponse(
    res,
    "Leave request retrieved successfully",
    request,
    statusCode.OK
  );
});

export const processLeaveRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = processLeaveRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  // Get the logged-in user id (approver) from req.user
  const approverId = (req as any).user?.id;

  const updatedRequest = await LeaveService.processLeaveRequest(
    id,
    approverId,
    parsed.data.status,
    parsed.data.rejectionReason
  );

  return SuccessResponse(
    res,
    `Leave request ${parsed.data.status.toLowerCase()} successfully`,
    updatedRequest,
    statusCode.OK
  );
});

export const cancelLeaveRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const userId = (req as any).user?.id;

  const cancelledRequest = await LeaveService.cancelLeaveRequest(id, userId);

  return SuccessResponse(
    res,
    "Leave request cancelled successfully",
    cancelledRequest,
    statusCode.OK
  );
});
