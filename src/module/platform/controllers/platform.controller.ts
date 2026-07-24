import type { Request, Response, NextFunction } from "express";
import env from "../../../config/env.config.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.util.ts";
import { PlatformService } from "../services/platform.service.ts";
import { platformLoginSchema } from "../validators/platform.validator.ts";

/**
 * @desc    Platform Admin Login via Email and Password
 * @route   POST /api/v1/platform/login
 * @access  Public
 */
export const platformLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = platformLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const result = await PlatformService.login(parsed.data);

  // Set HTTP-only auth cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    secure: env.server.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(
    res,
    "Platform login successful",
    result,
    statusCode.OK
  );
});

/**
 * @desc    Get current Platform Admin profile
 * @route   GET /api/v1/platform/me
 * @access  Private
 */
export const getPlatformMe = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse("Not authorized", statusCode.Unauthorized));
  }

  const admin = await PlatformService.getProfile(req.user.id);

  return SuccessResponse(
    res,
    "Platform profile retrieved",
    { admin },
    statusCode.OK
  );
});
