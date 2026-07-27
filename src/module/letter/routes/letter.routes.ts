import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import { getIssuedLetters, issueLetter } from "../controllers/letter.controller.ts";

const router = Router();

// Protect all letter routes
router.use(protect);

router.get("/", hasPermission("VIEW_LETTER_GENERATOR", "VIEW_LETTERS"), getIssuedLetters);
router.post("/issue", hasPermission("CREATE_LETTER_GENERATOR", "CREATE_LETTERS"), issueLetter);

export default router;
