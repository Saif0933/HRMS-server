import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import {
  createAdmin,
  getAdminProfile,
  getAllAdmins,
  loginAdmin,
} from "../controllers/admin.controller.ts";

const router = Router();

/**
 * @route   POST /api/v1/admin/auth/create
 * @desc    Create / Register a new Platform Admin User
 * @access  Public
 */
router.post("/create", createAdmin);

/**
 * @route   POST /api/v1/admin/auth/register
 * @desc    Alias route for admin account registration
 * @access  Public
 */
router.post("/register", createAdmin);

/**
 * @route   POST /api/v1/admin/auth/login
 * @desc    Login Platform Admin User via Email and Password
 * @access  Public
 */
router.post("/login", loginAdmin);

/**
 * @route   GET /api/v1/admin/auth/me
 * @desc    Get currently logged in admin user profile
 * @access  Private
 */
router.get("/me", protect, getAdminProfile);

/**
 * @route   GET /api/v1/admin/auth/all
 * @desc    Get list of all platform admin users
 * @access  Private
 */
router.get("/all", protect, getAllAdmins);

export default router;
