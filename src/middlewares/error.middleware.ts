import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { statusCode } from "../types/types.js";
import type { ErrorResponse } from "../utils/response.util.js";
import { zodError } from "../utils/utils.js";

export const errorMiddleware = (
  err: ErrorResponse, 
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // ENV.mode === "development" && console.error(err);
  console.log(err, "err")
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") err.message = "Invalid ID";
  if ("code" in err && (err as any).code === "P2025") {
    err.message = "Item not found";
  }
  if ("code" in err && (err as any).code === "P2003") {
    err.statusCode = statusCode.Bad_Request;
    err.message = "Foreign key constraint error: associated employee record not found";
  }
  if ("code" in err && (err as any).code === "P2002") {
    const target = (err as any).meta?.target;
    err.statusCode = statusCode.Conflict;
    err.message = target 
      ? `A record with this ${Array.isArray(target) ? target.join(', ') : target} already exists` 
      : "Conflict: Department name or code already exists";
  }

   // ✅ Handle Zod error
  if (err instanceof ZodError) {
    const errors = zodError(err);

    // get first zod error message
    const firstErrorMessage =
      err.issues.length > 0 ? err?.issues?.[0]?.message : "Validation Error";

    return res.status(statusCode.Bad_Request).json({
      success: false,
      message: firstErrorMessage,
      errors,
    });
  }

  // Final Error Response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
    errorDetails: err
  });
};


export default errorMiddleware;


type AsyncHandlerFunction<TReq extends Request> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  <TReq extends Request>(fn: AsyncHandlerFunction<TReq>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };



