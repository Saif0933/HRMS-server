import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
import { getTickets, createTicket, resolveTicket } from "../controllers/helpdesk.controller.ts";

const router = Router();

// Protect all support ticket routes
router.use(protect);

router.get("/", hasPermission("VIEW_HR_HELPDESK_TICKETS", "VIEW_HELPDESK"), getTickets);
router.post("/", hasPermission("CREATE_HR_HELPDESK_TICKET", "CREATE_HELPDESK"), createTicket);
router.patch("/:id/resolve", hasPermission("UPDATE_HR_HELPDESK_TICKET", "UPDATE_HELPDESK"), resolveTicket);

export default router;
