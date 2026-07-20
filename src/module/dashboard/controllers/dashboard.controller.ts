import type { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const data = await DashboardService.getDashboardData();
  return SuccessResponse(
    res,
    "Dashboard statistics retrieved successfully",
    data,
    statusCode.OK
  );
});

export const logUserAction = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { user, action, module, details } = req.body;
  if (!user || !action || !module || !details) {
    return res.status(400).json({ error: "Missing required logging payload parameters." });
  }

  const log = await DashboardService.logAction(user, action, module, details);
  return SuccessResponse(
    res,
    "Action logged successfully",
    log,
    statusCode.Created
  );
});
