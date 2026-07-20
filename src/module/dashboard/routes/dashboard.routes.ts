import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getDashboardStats, logUserAction } from "../controllers/dashboard.controller.ts";

const router = Router();

// Protect all dashboard routes
router.use(protect);

router.get("/", getDashboardStats);
router.post("/log", logUserAction);

export default router;
