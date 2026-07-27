import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import { upload } from "../../../middlewares/upload.middleware.ts";
import { getDocuments, uploadDocument, uploadAvatar, deleteDocument } from "../controllers/document.controller.ts";

const router = Router();

// Protect all document routes
router.use(protect);

router.get("/", hasPermission("VIEW_DOCUMENT_VAULT", "VIEW_DOCUMENTS"), getDocuments);
router.post("/upload", hasPermission("CREATE_DOCUMENT_VAULT", "CREATE_DOCUMENTS"), uploadDocument);
router.post("/upload-avatar", upload.single("file"), uploadAvatar);
router.delete("/:id", hasPermission("DELETE_DOCUMENTS"), deleteDocument);

export default router;
