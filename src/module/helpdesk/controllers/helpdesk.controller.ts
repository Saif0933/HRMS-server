import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.ts";
import { HelpDeskService } from "../services/helpdesk.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { createTicketSchema } from "../validators/helpdesk.validator.ts";

export const getTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const tickets = await HelpDeskService.getTickets(req.user?.organizationId);
  return SuccessResponse(
    res,
    "Support tickets retrieved successfully",
    tickets,
    statusCode.OK
  );
});

export const createTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = createTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const ticket = await HelpDeskService.createTicket(parsed.data, req.user?.organizationId);
  return SuccessResponse(
    res,
    "Support ticket registered successfully",
    ticket,
    statusCode.Created
  );
});

export const resolveTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const ticket = await HelpDeskService.resolveTicket(id, req.user?.organizationId);
  return SuccessResponse(
    res,
    "Support ticket resolved successfully",
    ticket,
    statusCode.OK
  );
});
