import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { upload } from "../../../middlewares/upload.middleware.ts";
import { getDocuments, uploadDocument, uploadAvatar, deleteDocument } from "../controllers/document.controller.ts";

const router = Router();

// Protect all document routes
router.use(protect);

router.get("/", getDocuments);
router.post("/upload", uploadDocument);
router.post("/upload-avatar", upload.single("file"), uploadAvatar);
router.delete("/:id", deleteDocument);

export default router;
