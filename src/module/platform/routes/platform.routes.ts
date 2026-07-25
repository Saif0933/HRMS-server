import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getPlatformMe, platformLogin } from "../controllers/platform.controller.ts";
import companyDirectoryRoutes from "../companiesdirectory/routes/companyDirectory.routes.ts";

const router = Router();

router.post("/login", platformLogin);
router.get("/me", protect, getPlatformMe);

// Mount companies directory sub-router
router.use("/", companyDirectoryRoutes);

export default router;
