import { Router } from "express";
import {
  sendOtp,
  verifyOtp,
  register,
  login,
  getProfile,
} from "../controllers/auth.controller.ts";
import { protect } from "../../../middlewares/auth.middleware.ts";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);

export default router;
