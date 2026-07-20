import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getIssuedLetters, issueLetter } from "../controllers/letter.controller.ts";

const router = Router();

// Protect all letter routes
router.use(protect);

router.get("/", getIssuedLetters);
router.post("/issue", issueLetter);

export default router;
