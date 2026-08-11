import type { NextFunction, Request, Response } from "express";
import env from "../../../config/env.config.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.util.ts";
import { AdminUserService } from "../services/admin.service.ts";
import {
  createAdminSchema,
  loginAdminSchema,
} from "../validators/admin.validator.ts";

/**
 * @desc    Create / Register a new Platform Admin User
 * @route   POST /api/v1/admin/auth/create (or /api/v1/admin/auth/register)
 * @access  Public / Platform Super Admin
 */
export const createAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const result = await AdminUserService.createAdmin(parsed.data);

  // Set HTTP-only cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    secure: env.server.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(
    res,
    "Admin account created successfully",
    result,
    statusCode.Created
  );
});

/**
 * @desc    Login Platform Admin User via Email & Password
 * @route   POST /api/v1/admin/auth/login
 * @access  Public
 */
export const loginAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = loginAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const result = await AdminUserService.loginAdmin(parsed.data);

  // Set HTTP-only cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    secure: env.server.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return SuccessResponse(
    res,
    "Admin login successful",
    result,
    statusCode.OK
  );
});

/**
 * @desc    Get Current Logged-in Admin Profile
 * @route   GET /api/v1/admin/auth/me
 * @access  Private (Admin)
 */
export const getAdminProfile = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const adminId = req.user?.id;
  if (!adminId) {
    return next(new ErrorResponse("Unauthorized. Please log in.", statusCode.Unauthorized));
  }

  const profile = await AdminUserService.getAdminProfile(adminId);

  return SuccessResponse(
    res,
    "Admin profile retrieved successfully",
    { admin: profile },
    statusCode.OK
  );
});

/**
 * @desc    Get All Admin Users List
 * @route   GET /api/v1/admin/auth/all
 * @access  Private (Super Admin)
 */
export const getAllAdmins = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const admins = await AdminUserService.getAllAdmins();

  return SuccessResponse(
    res,
    "Admin users list retrieved successfully",
    admins,
    statusCode.OK
  );
});
