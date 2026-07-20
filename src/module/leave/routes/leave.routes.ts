import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  createLeaveType,
  getLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
  allocateLeave,
  getLeaveAllocations,
  requestLeave,
  getLeaveRequests,
  getLeaveRequestById,
  processLeaveRequest,
  cancelLeaveRequest,
} from "../controllers/leave.controller.ts";

const router = Router();

// Protect all leave management routes
router.use(protect);

// 1. Leave Types Routes
router.get("/types", getLeaveTypes);
router.get("/types/:id", getLeaveTypeById);
router.post("/types", restrictTo("SUPER_ADMIN", "HR_ADMIN"), createLeaveType);
router.put("/types/:id", restrictTo("SUPER_ADMIN", "HR_ADMIN"), updateLeaveType);
router.delete("/types/:id", restrictTo("SUPER_ADMIN", "HR_ADMIN"), deleteLeaveType);

// 2. Leave Allocation Routes
router.get("/allocations", getLeaveAllocations);
router.post("/allocations", restrictTo("SUPER_ADMIN", "HR_ADMIN"), allocateLeave);

// 3. Leave Requests Routes
router.get("/requests", getLeaveRequests);
router.get("/requests/:id", getLeaveRequestById);
router.post("/requests", requestLeave);
router.patch("/requests/:id/process", restrictTo("SUPER_ADMIN", "HR_ADMIN", "MANAGER"), processLeaveRequest);
router.patch("/requests/:id/cancel", cancelLeaveRequest);

export default router;
