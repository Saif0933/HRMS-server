import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
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
router.get("/types", hasPermission("VIEW_LEAVE_POLICIES", "VIEW_LEAVE"), getLeaveTypes);
router.get("/types/:id", hasPermission("VIEW_LEAVE_POLICIES", "VIEW_LEAVE"), getLeaveTypeById);
router.post("/types", hasPermission("UPDATE_LEAVE_POLICIES", "CREATE_LEAVE"), createLeaveType);
router.put("/types/:id", hasPermission("UPDATE_LEAVE_POLICIES", "UPDATE_LEAVE"), updateLeaveType);
router.delete("/types/:id", hasPermission("UPDATE_LEAVE_POLICIES", "DELETE_LEAVE"), deleteLeaveType);

// 2. Leave Allocation Routes
router.get("/allocations", hasPermission("VIEW_LEAVE_APPLICATION", "VIEW_LEAVE"), getLeaveAllocations);
router.post("/allocations", hasPermission("UPDATE_LEAVE_POLICIES", "CREATE_LEAVE"), allocateLeave);

// 3. Leave Requests Routes
router.get("/requests", hasPermission("VIEW_LEAVE_APPLICATION", "VIEW_LEAVE"), getLeaveRequests);
router.get("/requests/:id", hasPermission("VIEW_LEAVE_APPLICATION", "VIEW_LEAVE"), getLeaveRequestById);
router.post("/requests", hasPermission("CREATE_LEAVE_APPLICATION", "CREATE_LEAVE"), requestLeave);
router.patch("/requests/:id/process", hasPermission("UPDATE_LEAVE_APPROVAL", "UPDATE_LEAVE"), processLeaveRequest);
router.patch("/requests/:id/cancel", cancelLeaveRequest);

export default router;
