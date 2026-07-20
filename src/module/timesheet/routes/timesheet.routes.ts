import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getTimesheets, submitTimesheet, updateTimesheetStatus } from "../controllers/timesheet.controller.ts";

const router = Router();

// Protect all timesheet routes
router.use(protect);

router.get("/", getTimesheets);
router.post("/submit", submitTimesheet);
router.patch("/:id/status", updateTimesheetStatus);

export default router;
