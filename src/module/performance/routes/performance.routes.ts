import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  getGoals,
  createGoal,
  updateGoalProgress,
  getFeedbacks,
  createFeedback,
  getBellCurveDistribution,
  saveAppraisal,
} from "../controllers/performance.controller.ts";

const router = Router();

// Protect all performance management routes
router.use(protect);

// 1. KRA & Goals Routes
router.get("/goals", getGoals);
router.post("/goals", restrictTo("SUPER_ADMIN", "HR_ADMIN", "MANAGER"), createGoal);
router.patch("/goals/:id/progress", updateGoalProgress);

// 2. Feedback Routes
router.get("/feedbacks", getFeedbacks);
router.post("/feedbacks", createFeedback);

// 3. Appraisals & Bell Curve Routes
router.get("/bellcurve", getBellCurveDistribution);
router.post("/appraisals", restrictTo("SUPER_ADMIN", "HR_ADMIN", "MANAGER"), saveAppraisal);

export default router;
