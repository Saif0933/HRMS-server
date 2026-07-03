import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
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

// Read routes available to all authenticated employees
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Write routes restricted to SUPER_ADMIN or HR_ADMIN
router.post("/", restrictTo("SUPER_ADMIN", "HR_ADMIN"), createDepartment);
router.put("/:id", restrictTo("SUPER_ADMIN", "HR_ADMIN"), updateDepartment);
router.delete("/:id", restrictTo("SUPER_ADMIN", "HR_ADMIN"), deleteDepartment);

export default router;
