import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getDocuments, uploadDocument, deleteDocument } from "../controllers/document.controller.ts";

const router = Router();

// Protect all document routes
router.use(protect);

router.get("/", getDocuments);
router.post("/upload", uploadDocument);
router.delete("/:id", deleteDocument);

export default router;
