import type { Request, Response, NextFunction } from "express";
import { PerformanceService } from "../services/performance.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  createGoalSchema,
  updateGoalProgressSchema,
  createFeedbackSchema,
  saveAppraisalSchema,
  createMonthlyRatingSchema,
} from "../validators/performance.validator.ts";

// Goals & KRAs
export const getGoals = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const goals = await PerformanceService.getGoals(employeeId);

  return SuccessResponse(
    res,
    "Performance goals retrieved successfully",
    goals,
    statusCode.OK
  );
});

export const createGoal = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const goal = await PerformanceService.createGoal(parsed.data);

  return SuccessResponse(
    res,
    "Performance goal assigned successfully",
    goal,
    statusCode.Created
  );
});

export const updateGoalProgress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = updateGoalProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const goal = await PerformanceService.updateGoalProgress(id, parsed.data.progress, parsed.data.status);

  return SuccessResponse(
    res,
    "Performance goal progress updated successfully",
    goal,
    statusCode.OK
  );
});

// 360 Feedback
export const getFeedbacks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const feedbacks = await PerformanceService.getFeedbacks(employeeId);

  return SuccessResponse(
    res,
    "Peer and manager feedback reviews retrieved successfully",
    feedbacks,
    statusCode.OK
  );
});

export const createFeedback = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const feedback = await PerformanceService.createFeedback(parsed.data);

  return SuccessResponse(
    res,
    "Feedback review submitted successfully",
    feedback,
    statusCode.Created
  );
});

// Appraisals & Bell Curve
export const saveAppraisal = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = saveAppraisalSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const appraisal = await PerformanceService.saveAppraisal(
    parsed.data.employeeId,
    parsed.data.cycle,
    parsed.data.rating
  );

  return SuccessResponse(
    res,
    "Appraisal rating saved successfully",
    appraisal,
    statusCode.OK
  );
});

export const getBellCurveDistribution = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const cycle = (req.query.cycle as string) || "2026-Q2";
  const distribution = await PerformanceService.getBellCurveDistribution(cycle);

  return SuccessResponse(
    res,
    "Appraisal bell curve distribution retrieved successfully",
    distribution,
    statusCode.OK
  );
});

// Monthly Performance Ratings (Super Admin / Employee Management)
export const getMonthlyRatings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const ratings = await PerformanceService.getMonthlyRatings(employeeId);

  return SuccessResponse(
    res,
    "Monthly performance ratings retrieved successfully",
    ratings,
    statusCode.OK
  );
});

export const createMonthlyRating = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createMonthlyRatingSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const rating = await PerformanceService.createMonthlyRating(parsed.data);

  return SuccessResponse(
    res,
    "Monthly performance rating created successfully",
    rating,
    statusCode.Created
  );
});
