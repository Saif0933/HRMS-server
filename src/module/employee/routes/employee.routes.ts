import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeSalary,
  updateEmployeeSalary,
  getEmployeePersonal,
  updateEmployeePersonal,
} from "../controller/employee.controller.ts";

const router = Router();

// Protect all employee routes (user must be authenticated)
router.use(protect);

// Standard Employee CRUD routes
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", restrictTo("SUPER_ADMIN", "HR_ADMIN"), createEmployee);
router.put("/:id", restrictTo("SUPER_ADMIN", "HR_ADMIN"), updateEmployee);
router.delete("/:id", restrictTo("SUPER_ADMIN", "HR_ADMIN"), deleteEmployee);

// Salary Details routes (viewing uses self-or-admin check; updating restricted to admins in controller)
router.get("/:id/salary", getEmployeeSalary);
router.put("/:id/salary", updateEmployeeSalary);

// Personal Details routes (viewing/updating use self-or-admin checks in controller)
router.get("/:id/personal", getEmployeePersonal);
router.put("/:id/personal", updateEmployeePersonal);

export default router;
