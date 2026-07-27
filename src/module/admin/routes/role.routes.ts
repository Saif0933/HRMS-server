import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
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

// Protect all admin routes (User must be logged in)
router.use(protect);

// Role routes
router.get("/roles", hasPermission("VIEW_ROLES_PERMISSIONS", "VIEW_ADMIN"), getRoles);
router.post("/roles", hasPermission("UPDATE_ROLES_PERMISSIONS", "CREATE_ADMIN"), createRole);
router.put("/roles/:id", hasPermission("UPDATE_ROLES_PERMISSIONS", "UPDATE_ADMIN"), updateRole);
router.delete("/roles/:id", hasPermission("UPDATE_ROLES_PERMISSIONS", "DELETE_ADMIN"), deleteRole);

// Permission routes
router.get("/permissions", hasPermission("VIEW_ROLES_PERMISSIONS", "VIEW_ADMIN"), getPermissions);
router.post("/permissions", hasPermission("UPDATE_ROLES_PERMISSIONS", "CREATE_ADMIN"), createPermission);

// User assignment route
router.post("/assign-role", hasPermission("UPDATE_ROLES_PERMISSIONS", "UPDATE_ADMIN"), assignRoleToUser);

export default router;
