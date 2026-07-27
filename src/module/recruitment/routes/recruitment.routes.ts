import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import {
  getRequisitions,
  createRequisition,
  getCandidates,
  advanceCandidate,
  updateCandidateChecklist,
  rejectCandidate,
} from "../controllers/recruitment.controller.ts";

const router = Router();

// Protect all recruitment routes
router.use(protect);

router.get("/jobs", hasPermission("VIEW_JOB_REQUISITIONS", "VIEW_RECRUITMENT"), getRequisitions);
router.post("/jobs", hasPermission("CREATE_JOB_REQUISITIONS", "CREATE_RECRUITMENT"), createRequisition);
router.get("/candidates", hasPermission("VIEW_CANDIDATE_PIPELINE", "VIEW_RECRUITMENT"), getCandidates);
router.patch("/candidates/:id/stage", hasPermission("UPDATE_CANDIDATE_PIPELINE", "UPDATE_RECRUITMENT"), advanceCandidate);
router.patch("/candidates/:id/checklist", hasPermission("UPDATE_PRE_ONBOARDING", "UPDATE_RECRUITMENT"), updateCandidateChecklist);
router.delete("/candidates/:id", hasPermission("UPDATE_CANDIDATE_PIPELINE", "DELETE_RECRUITMENT"), rejectCandidate);

export default router;
