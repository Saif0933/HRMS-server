import { statusCode } from "../../../types/types.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { SubscriptionRepository } from "../repo/subscription.repo.ts";
import type {
  CreateSubscriptionPlanInput,
  SubscribePlanInput,
  UpdateSubscriptionPlanInput,
} from "../validators/subscription.validator.ts";

export class SubscriptionService {
  /**
   * List all active subscription plans
   */
  static async getPlans() {
    return SubscriptionRepository.findAllPlans();
  }

  /**
   * Get single subscription plan details
   */
  static async getPlanDetails(idOrCode: string) {
    const plan = await SubscriptionRepository.findPlanByIdOrCode(idOrCode);
    if (!plan) {
      throw new ErrorResponse("Subscription plan not found", statusCode.Not_Found);
    }
    return plan;
  }

  /**
   * Get current active subscription for an organization
   */
  static async getCurrentSubscription(organizationId: string) {
    const sub = await SubscriptionRepository.findActiveSubscriptionByOrgId(organizationId);
    if (!sub) {
      // Default fallback plan (Basic) if none subscribed yet
      const defaultPlan = await SubscriptionRepository.findPlanByIdOrCode("basic");
      return {
        isSubscribed: false,
        organizationId,
        currentPlan: defaultPlan,
        status: "FREE_TRIAL",
        billingCycle: "ANNUAL",
        startDate: null,
        endDate: null,
      };
    }

    return {
      isSubscribed: true,
      subscriptionId: sub.id,
      organizationId: sub.organizationId,
      currentPlan: sub.plan,
      status: sub.status,
      billingCycle: sub.billingCycle,
      pricePaid: sub.pricePaid,
      startDate: sub.startDate,
      endDate: sub.endDate,
      autoRenew: sub.autoRenew,
      paymentStatus: sub.paymentStatus,
    };
  }

  /**
   * Subscribe or upgrade to a subscription plan
   */
  static async subscribeOrUpgrade(userOrgId: string, data: SubscribePlanInput) {
    const targetOrgId = data.organizationId || userOrgId;
    if (!targetOrgId) {
      throw new ErrorResponse("Organization context is required for subscription", statusCode.Bad_Request);
    }

    const plan = await SubscriptionRepository.findPlanByIdOrCode(data.planId);
    if (!plan) {
      throw new ErrorResponse("Target subscription plan does not exist", statusCode.Not_Found);
    }

    const subscription = await SubscriptionRepository.createOrganizationSubscription({
      organizationId: targetOrgId,
      planId: plan.id,
      billingCycle: data.billingCycle || "ANNUAL",
      pricePaid: plan.price,
      paymentStatus: "PAID",
    });

    return {
      message: `Successfully subscribed to ${plan.name} plan.`,
      subscription,
    };
  }

  /**
   * Get feature comparison table matrix
   */
  static async getComparisonTable() {
    return SubscriptionRepository.findComparisonRows();
  }

  /**
   * Create a new subscription plan (Admin)
   */
  static async createPlan(data: CreateSubscriptionPlanInput) {
    const existing = await SubscriptionRepository.findPlanByIdOrCode(data.code);
    if (existing) {
      throw new ErrorResponse(`Plan code '${data.code}' already exists`, statusCode.Bad_Request);
    }
    return SubscriptionRepository.createPlan(data);
  }

  /**
   * Update an existing subscription plan (Admin)
   */
  static async updatePlan(id: string, data: UpdateSubscriptionPlanInput) {
    const existing = await SubscriptionRepository.findPlanByIdOrCode(id);
    if (!existing) {
      throw new ErrorResponse("Subscription plan not found", statusCode.Not_Found);
    }
    return SubscriptionRepository.updatePlan(existing.id, data);
  }

  /**
   * Delete a subscription plan (Admin)
   */
  static async deletePlan(id: string) {
    const existing = await SubscriptionRepository.findPlanByIdOrCode(id);
    if (!existing) {
      throw new ErrorResponse("Subscription plan not found", statusCode.Not_Found);
    }
    return SubscriptionRepository.deletePlan(existing.id);
  }
}
