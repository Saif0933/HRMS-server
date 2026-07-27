import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import { getAssets, createAsset, assignAsset } from "../controllers/asset.controller.ts";

const router = Router();

// Protect all asset routes
router.use(protect);

router.get("/", hasPermission("VIEW_ASSET_MANAGEMENT", "VIEW_ASSETS"), getAssets);
router.post("/", hasPermission("UPDATE_ASSET_MANAGEMENT", "CREATE_ASSETS"), createAsset);
router.patch("/:id/assign", hasPermission("UPDATE_ASSET_MANAGEMENT", "UPDATE_ASSETS"), assignAsset);

export default router;
