import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.ts";
import { LetterService } from "../services/letter.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { issueLetterSchema } from "../validators/letter.validator.ts";

export const getIssuedLetters = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const letters = await LetterService.getIssuedLetters(req.user?.organizationId);
  return SuccessResponse(
    res,
    "Issued letters retrieved successfully",
    letters,
    statusCode.OK
  );
});

export const issueLetter = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const parsed = issueLetterSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const letter = await LetterService.issueLetter(parsed.data, req.user?.organizationId);
  return SuccessResponse(
    res,
    "Letter issued successfully",
    letter,
    statusCode.Created
  );
});
