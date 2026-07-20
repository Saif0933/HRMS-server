import type { Request, Response, NextFunction } from "express";
import { TravelService } from "../services/travel.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { applyClaimSchema, updateClaimStatusSchema } from "../validators/travel.validator.ts";

export const getClaims = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const status = req.query.status as string | undefined;

  const claims = await TravelService.getClaims({ employeeId, status });

  return SuccessResponse(
    res,
    "Travel claims retrieved successfully",
    claims,
    statusCode.OK
  );
});

export const applyClaim = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = applyClaimSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const claim = await TravelService.applyClaim(parsed.data);

  return SuccessResponse(
    res,
    "Travel expense claim submitted successfully",
    claim,
    statusCode.Created
  );
});

export const updateClaimStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = updateClaimStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const claim = await TravelService.updateClaimStatus(id, parsed.data.status);

  return SuccessResponse(
    res,
    "Travel claim status updated successfully",
    claim,
    statusCode.OK
  );
});
