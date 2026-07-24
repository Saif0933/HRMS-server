import { Router } from "express";
import { platformLogin, getPlatformMe } from "../controllers/platform.controller.ts";
import { protect } from "../../../middlewares/auth.middleware.ts";

const router = Router();

router.post("/login", platformLogin);
router.get("/me", protect, getPlatformMe);

export default router;
