import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.ts";

const router = Router();

// Protect all department routes (user must be authenticated)
router.use(protect);

// Read routes
router.get("/", hasPermission("VIEW_DEPARTMENTS", "VIEW_EMPLOYEES"), getDepartments);
router.get("/:id", hasPermission("VIEW_DEPARTMENTS", "VIEW_EMPLOYEES"), getDepartmentById);

// Write routes
router.post("/", hasPermission("UPDATE_DEPARTMENTS", "CREATE_EMPLOYEES"), createDepartment);
router.put("/:id", hasPermission("UPDATE_DEPARTMENTS", "UPDATE_EMPLOYEES"), updateDepartment);
router.delete("/:id", hasPermission("UPDATE_DEPARTMENTS", "DELETE_EMPLOYEES"), deleteDepartment);

export default router;
