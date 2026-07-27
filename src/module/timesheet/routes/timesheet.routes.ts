import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import { getTimesheets, submitTimesheet, updateTimesheetStatus } from "../controllers/timesheet.controller.ts";

const router = Router();

// Protect all timesheet routes
router.use(protect);

router.get("/", hasPermission("VIEW_TIMESHEET_ENTRY", "VIEW_TIMESHEETS"), getTimesheets);
router.post("/submit", hasPermission("CREATE_TIMESHEET_ENTRY", "CREATE_TIMESHEETS"), submitTimesheet);
router.patch("/:id/status", hasPermission("UPDATE_CLIENTS_PROJECTS", "UPDATE_TIMESHEETS"), updateTimesheetStatus);

export default router;
