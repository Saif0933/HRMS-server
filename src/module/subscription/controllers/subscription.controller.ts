import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { SubscriptionService } from "../services/subscription.service.ts";
import {
  createSubscriptionPlanSchema,
  subscribePlanSchema,
  updateSubscriptionPlanSchema,
} from "../validators/subscription.validator.ts";

/**
 * @desc    Get all available subscription plans
 * @route   GET /api/v1/subscriptions/plans
 * @access  Public / Authenticated
 */
export const getSubscriptionPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const plans = await SubscriptionService.getPlans();
  return SuccessResponse(
    res,
    "Subscription plans fetched successfully",
    plans,
    statusCode.OK
  );
});

/**
 * @desc    Get subscription plan details by ID or code
 * @route   GET /api/v1/subscriptions/plans/:id
 * @access  Public / Authenticated
 */
export const getSubscriptionPlanById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const idOrCode = req.params.id as string;
  const plan = await SubscriptionService.getPlanDetails(idOrCode);
  return SuccessResponse(
    res,
    "Subscription plan details retrieved",
    plan,
    statusCode.OK
  );
});

/**
 * @desc    Get current active subscription of the organization
 * @route   GET /api/v1/subscriptions/current
 * @access  Private
 */
export const getCurrentSubscription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.organizationId || req.query.organizationId as string;
  const subscription = await SubscriptionService.getCurrentSubscription(orgId);
  return SuccessResponse(
    res,
    "Current organization subscription retrieved",
    subscription,
    statusCode.OK
  );
});

/**
 * @desc    Subscribe or upgrade plan for an organization
 * @route   POST /api/v1/subscriptions/subscribe
 * @access  Private
 */
export const subscribeToPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = subscribePlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const userOrgId = req.user?.organizationId;
  const result = await SubscriptionService.subscribeOrUpgrade(userOrgId, parsed.data);
  return SuccessResponse(
    res,
    result.message,
    result.subscription,
    statusCode.OK
  );
});

/**
 * @desc    Get feature comparison table matrix
 * @route   GET /api/v1/subscriptions/compare
 * @access  Public / Authenticated
 */
export const getFeatureComparisons = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const comparisons = await SubscriptionService.getComparisonTable();
  return SuccessResponse(
    res,
    "Plan feature comparisons retrieved successfully",
    comparisons,
    statusCode.OK
  );
});

/**
 * @desc    Create a new subscription plan (Admin)
 * @route   POST /api/v1/subscriptions/plans
 * @access  Private (Admin)
 */
export const createPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = createSubscriptionPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const plan = await SubscriptionService.createPlan(parsed.data);
  return SuccessResponse(
    res,
    "Subscription plan created successfully",
    plan,
    statusCode.Created
  );
});

/**
 * @desc    Update a subscription plan (Admin)
 * @route   PATCH /api/v1/subscriptions/plans/:id
 * @access  Private (Admin)
 */
export const updatePlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = updateSubscriptionPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const plan = await SubscriptionService.updatePlan(id, parsed.data);
  return SuccessResponse(
    res,
    "Subscription plan updated successfully",
    plan,
    statusCode.OK
  );
});

/**
 * @desc    Delete a subscription plan (Admin)
 * @route   DELETE /api/v1/subscriptions/plans/:id
 * @access  Private (Admin)
 */
export const deletePlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const result = await SubscriptionService.deletePlan(id);
  return SuccessResponse(
    res,
    "Subscription plan deleted successfully",
    result,
    statusCode.OK
  );
});
