import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
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
router.get("/cycle", hasPermission("VIEW_PAYROLL_REPORTS", "VIEW_PAYROLL"), getOrCreateCycle);
router.patch("/cycle/:id/status", hasPermission("UPDATE_SALARY_PROCESSING", "UPDATE_PAYROLL"), updateCycleStatus);
router.post("/cycle/:cycleId/arrears", hasPermission("UPDATE_SALARY_PROCESSING", "UPDATE_PAYROLL"), calculateArrears);

// 2. Hold / Exclusion Route
router.post("/cycle/:cycleId/hold", hasPermission("UPDATE_SALARY_PROCESSING", "UPDATE_PAYROLL"), toggleStopPayment);

// 3. Bulk Revisions Route
router.post("/revision", hasPermission("UPDATE_SALARY_STRUCTURE", "UPDATE_PAYROLL"), applyBulkRevision);

// 4. Loans Routes
router.get("/loans", hasPermission("VIEW_LOANS_ADVANCES", "VIEW_PAYROLL"), getLoans);
router.post("/loans", hasPermission("CREATE_LOANS_ADVANCES", "UPDATE_LOANS_ADVANCES", "CREATE_PAYROLL"), applyLoan);

// 5. Tax Declarations Routes
router.get("/tax-declaration", hasPermission("VIEW_INVESTMENT_DECLARATIONS", "VIEW_PAYROLL"), getTaxDeclaration);
router.post("/tax-declaration", hasPermission("CREATE_INVESTMENT_DECLARATIONS", "UPDATE_INVESTMENT_DECLARATIONS", "CREATE_PAYROLL"), saveTaxDeclaration);

export default router;
