import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  assignRoleToUser,
  createPermission,
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from "../controllers/role.controller.ts";

const router = Router();

// Role permission assign route (public)
router.put("/roles/:id", updateRole);

// Protect all admin routes (User must be logged in)
router.use(protect);

// Restrict all routes under this router to SUPER_ADMIN
router.use(restrictTo("SUPER_ADMIN"));

// Role routes
router.post("/roles", createRole);
router.get("/roles", getRoles);
router.delete("/roles/:id", deleteRole);

// Permission routes
router.post("/permissions", createPermission);
router.get("/permissions", getPermissions);

// User assignment route
router.post("/assign-role", assignRoleToUser);

export default router;
