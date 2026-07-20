import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getAssets, createAsset, assignAsset } from "../controllers/asset.controller.ts";

const router = Router();

// Protect all asset routes
router.use(protect);

router.get("/", getAssets);
router.post("/", createAsset);
router.patch("/:id/assign", assignAsset);

export default router;
