import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  createPlan,
  deletePlan,
  getCurrentSubscription,
  getFeatureComparisons,
  getSubscriptionPlanById,
  getSubscriptionPlans,
  subscribeToPlan,
  updatePlan,
} from "../controllers/subscription.controller.ts";

const router = Router();

// Public / Authenticated read routes
router.get("/plans", getSubscriptionPlans);
router.get("/plans/:id", getSubscriptionPlanById);
router.get("/compare", getFeatureComparisons);

// Protected routes (require user authentication)
router.use(protect);

router.get("/current", getCurrentSubscription);
router.post("/subscribe", subscribeToPlan);

// Admin-only management routes
router.post("/plans", restrictTo("SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN"), createPlan);
router.patch("/plans/:id", restrictTo("SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN"), updatePlan);
router.delete("/plans/:id", restrictTo("SUPER_ADMIN", "ADMIN", "PLATFORM_ADMIN"), deletePlan);

export default router;
