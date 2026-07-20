import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import { getClaims, applyClaim, updateClaimStatus } from "../controllers/travel.controller.ts";

const router = Router();

// Protect all travel/claims routes
router.use(protect);

router.get("/", getClaims);
router.post("/apply", applyClaim);
router.patch("/:id/status", updateClaimStatus);

export default router;
