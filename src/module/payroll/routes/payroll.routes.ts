import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  getOrCreateCycle,
  updateCycleStatus,
  calculateArrears,
  applyBulkRevision,
  toggleStopPayment,
  applyLoan,
  getLoans,
  saveTaxDeclaration,
  getTaxDeclaration,
} from "../controllers/payroll.controller.ts";

const router = Router();

// Protect all routes
router.use(protect);

// 1. Cycle & Runs Routes
router.get("/cycle", getOrCreateCycle);
router.patch("/cycle/:id/status", restrictTo("SUPER_ADMIN", "HR_ADMIN"), updateCycleStatus);
router.post("/cycle/:cycleId/arrears", restrictTo("SUPER_ADMIN", "HR_ADMIN"), calculateArrears);

// 2. Hold / Exclusion Route
router.post("/cycle/:cycleId/hold", restrictTo("SUPER_ADMIN", "HR_ADMIN"), toggleStopPayment);

// 3. Bulk Revisions Route
router.post("/revision", restrictTo("SUPER_ADMIN", "HR_ADMIN"), applyBulkRevision);

// 4. Loans Routes
router.get("/loans", getLoans);
router.post("/loans", restrictTo("SUPER_ADMIN", "HR_ADMIN"), applyLoan);

// 5. Tax Declarations Routes
router.get("/tax-declaration", getTaxDeclaration);
router.post("/tax-declaration", saveTaxDeclaration);

export default router;
