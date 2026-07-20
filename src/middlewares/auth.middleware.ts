import type { NextFunction, Request, Response } from "express";
import env from "../config/env.config";
import { verifyToken } from "../utils/jwt.util";
import { ErrorResponse } from "../utils/response.util";
import { asyncHandler } from "./error.middleware";
import { prisma } from "../db/prisma.ts";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Log request info for tracing
  console.log(`[Auth Middleware] Incoming Request: ${req.method} ${req.originalUrl}`);

  // 1. Extract token from cookies (either pre-parsed by cookie-parser or parsed manually)
  if (req.cookies && typeof req.cookies.token === "string") {
    token = req.cookies.token;
    console.log("[Auth Middleware] Extracted token from parsed req.cookies.");
  } else if (req.headers.cookie) {
    const rawCookies = req.headers.cookie.split(";");
    for (const rawCookie of rawCookies) {
      const parts = rawCookie.split("=");
      const key = parts[0];
      const val = parts[1];
      if (key && val && key.trim() === "token") {
        token = val.trim();
        console.log("[Auth Middleware] Extracted token manually from req.headers.cookie.");
        break;
      }
    }
  }

  // 2. Fallback to Bearer Authorization header if cookie is missing
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    const firstPart = parts[0];
    const secondPart = parts[1];
    if (parts.length === 2 && firstPart && secondPart && firstPart.toLowerCase() === "bearer") {
      token = secondPart;
      console.log("[Auth Middleware] Extracted token from Authorization header fallback.");
    }
  }

  if (!token) {
    console.warn("[Auth Middleware] No token found in cookies or authorization headers.");
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const jwtSecret = env.jwt.secret || "123456";
    
    // Verify the JWT token signature and expiration
    const decoded = verifyToken(token, jwtSecret);
    console.log("[Auth Middleware] Token verified successfully. Decoded payload:", decoded);

    if (!decoded.phoneNumber) {
      console.warn("[Auth Middleware] Token does not contain a phone number.");
      return next(new ErrorResponse("Not authorized to access this route", 401));
    }

    // Retrieve user directly from the database using prisma
    let user = null;
    if (decoded.id) {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true },
      });
    }

    if (!user && decoded.phoneNumber) {
      user = await prisma.user.findFirst({
        where: { phone: decoded.phoneNumber },
        include: { role: true },
      });
    }

    if (!user) {
      console.warn(`[Auth Middleware] User with ID ${decoded.id || 'N/A'} or phone ${decoded.phoneNumber || 'N/A'} not found in database.`);
      return next(new ErrorResponse("User not found", 404));
    }

    // Attach user to the request context
    req.user = user;
    next();
  } catch (error: any) {
    console.error("JWT Verification failed:", error.message || error);
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

/**
 * Route authorization restriction middleware based on role list
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorResponse("Not authorized to access this route", 401));
    }

    if (!req.user.role || !roles.includes(req.user.role.name)) {
      return next(new ErrorResponse("You do not have permission to perform this action", 403));
    }

    next();
  };
};
