import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import env from "../../../config/env.config.ts";
import { prisma } from "../../../db/prisma.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { generateOTP, signToken } from "../../../utils/jwt.util.ts";
import { ErrorResponse, SuccessResponse } from "../../../utils/response.util.ts";
import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../validators/auth.validator.ts";

/**
 * Hash password using Node.js native crypto module (SHA256)
 */
const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

/**
 * Compare plain password with hashed password
 */
const comparePassword = (password: string, hashed: string): boolean => {
  return hashPassword(password) === hashed;
};

/**
 * Utility to set auth cookie on response
 */
const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.server.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

/**
 * @desc    Send OTP to user's phone number
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const sendOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const { phone } = parsed.data;
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

  // Upsert the LoginOtp record (using phone as unique identifier)
  await prisma.loginOtp.upsert({
    where: { phone },
    update: {
      otp,
      expiresAt,
      attempts: 0,
      verified: false,
    },
    create: {
      phone,
      otp,
      expiresAt,
      attempts: 0,
      verified: false,
    },
  });

  // Log OTP in console for development/testing
  console.log(`[OTP Sent] Phone: ${phone} | OTP: ${otp}`);

  return SuccessResponse(
    res,
    "OTP sent successfully",
    { phone, otp: env.server.nodeEnv === "development" ? otp : undefined },
    statusCode.OK
  );
});

/**
 * @desc    Verify OTP and log in / return verification state
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const { phone, otp } = parsed.data;

  // Retrieve OTP record
  const loginOtp = await prisma.loginOtp.findUnique({
    where: { phone },
  });

  if (!loginOtp) {
    return next(new ErrorResponse("OTP record not found", statusCode.Not_Found));
  }

  // Check if expired
  if (new Date() > new Date(loginOtp.expiresAt)) {
    return next(new ErrorResponse("OTP has expired", statusCode.Bad_Request));
  }

  // Check maximum attempts limit (e.g., 5 attempts)
  if (loginOtp.attempts >= 5) {
    return next(new ErrorResponse("Too many incorrect attempts. Please request a new OTP.", statusCode.Too_Many_Requests));
  }

  // Check if OTP matches
  if (loginOtp.otp !== otp) {
    await prisma.loginOtp.update({
      where: { phone },
      data: { attempts: { increment: 1 } },
    });
    return next(new ErrorResponse("Invalid OTP code", statusCode.Bad_Request));
  }

  // Mark OTP as verified and reset attempts
  await prisma.loginOtp.update({
    where: { phone },
    data: {
      verified: true,
      attempts: 0,
    },
  });

  // Check if user exists with this phone number
  let user = await prisma.user.findUnique({
    where: { phone },
    include: { role: true },
  });

  let isNewUser = false;
  if (!user) {
    // Check if this is the first user in the database to auto-assign SUPER_ADMIN
    const userCount = await prisma.user.count();
    let roleId: string | undefined;
    if (userCount === 0) {
      const superAdminRole = await prisma.role.findFirst({
        where: { name: "SUPER_ADMIN" },
      });
      if (superAdminRole) {
        roleId = superAdminRole.id;
      }
    }

    // First time login - auto-create user record
    user = await prisma.user.create({
      data: {
        phone,
        name: "", // Default empty name
        email: null as any,
        roleId,
      },
      include: { role: true },
    });
    isNewUser = true;
  }

  // Sign JWT and login
  const jwtSecret = env.jwt.secret || "123456";
  const token = signToken(
    { id: user.id, phoneNumber: user.phone, email: user.email },
    jwtSecret
  );

  setAuthCookie(res, token);

  return SuccessResponse(
    res,
    isNewUser ? "First-time login successful" : "Login successful",
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name || "EMPLOYEE",
      },
      token,
      isRegistered: true,
    },
    statusCode.OK
  );
});

/**
 * @desc    Register a new user (via email/phone/password)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const { name, email, phone, password } = parsed.data;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    const field = existingUser.email === email ? "Email" : "Phone number";
    return next(new ErrorResponse(`${field} is already registered`, statusCode.Conflict));
  }

  // Check if this is the first user in the database to auto-assign SUPER_ADMIN
  const userCount = await prisma.user.count();
  let roleId: string | undefined;
  if (userCount === 0) {
    const superAdminRole = await prisma.role.findFirst({
      where: { name: "SUPER_ADMIN" },
    });
    if (superAdminRole) {
      roleId = superAdminRole.id;
    }
  }

  // Create new user with hashed password
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashPassword(password),
      roleId,
    },
    include: { role: true },
  });

  // Sign JWT token
  const jwtSecret = env.jwt.secret || "123456";
  const token = signToken(
    { id: newUser.id, phoneNumber: newUser.phone, email: newUser.email },
    jwtSecret
  );

  setAuthCookie(res, token);

  return SuccessResponse(
    res,
    "User registered successfully",
    {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role?.name || "EMPLOYEE",
      },
      token,
    },
    statusCode.Created
  );
});

/**
 * @desc    Log in with email or phone and password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const { email, phone, password } = parsed.data;

  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : {},
        phone ? { phone } : {},
      ],
    },
    include: { role: true },
  });

  if (!user || !user.password) {
    return next(new ErrorResponse("Invalid credentials", statusCode.Unauthorized));
  }

  // Verify password match
  if (!comparePassword(password, user.password)) {
    return next(new ErrorResponse("Invalid credentials", statusCode.Unauthorized));
  }

  // Sign JWT token
  const jwtSecret = env.jwt.secret || "123456";
  const token = signToken(
    { id: user.id, phoneNumber: user.phone, email: user.email },
    jwtSecret
  );

  setAuthCookie(res, token);

  return SuccessResponse(
    res,
    "Login successful",
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name || "EMPLOYEE",
      },
      token,
    },
    statusCode.OK
  );
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private (Requires authentication middleware)
 */
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse("Not authorized to access this route", statusCode.Unauthorized));
  }

  return SuccessResponse(
    res,
    "Profile retrieved successfully",
    { user: req.user },
    statusCode.OK
  );
});
