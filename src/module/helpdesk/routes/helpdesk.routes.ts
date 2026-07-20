import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import { getTickets, createTicket, resolveTicket } from "../controllers/helpdesk.controller.ts";

const router = Router();

// Protect all support ticket routes
router.use(protect);

router.get("/", getTickets);
router.post("/", createTicket);
router.patch("/:id/resolve", resolveTicket);

export default router;
