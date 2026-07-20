import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
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

router.get("/jobs", getRequisitions);
router.post("/jobs", createRequisition);
router.get("/candidates", getCandidates);
router.patch("/candidates/:id/stage", advanceCandidate);
router.patch("/candidates/:id/checklist", updateCandidateChecklist);
router.delete("/candidates/:id", rejectCandidate);

export default router;
