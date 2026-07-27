import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import { getClaims, applyClaim, updateClaimStatus } from "../controllers/travel.controller.ts";

const router = Router();

// Protect all travel/claims routes
router.use(protect);

router.get("/", hasPermission("VIEW_TRAVEL_REQUEST", "VIEW_EXPENSE_REIMBURSEMENT", "VIEW_CLAIMS"), getClaims);
router.post("/apply", hasPermission("CREATE_TRAVEL_REQUEST", "CREATE_EXPENSE_REIMBURSEMENT", "CREATE_CLAIMS"), applyClaim);
router.patch("/:id/status", hasPermission("UPDATE_CLAIM_APPROVAL", "UPDATE_CLAIMS"), updateClaimStatus);

export default router;
