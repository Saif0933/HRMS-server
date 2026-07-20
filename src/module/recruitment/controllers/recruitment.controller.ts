import type { Request, Response, NextFunction } from "express";
import { RecruitmentService } from "../services/recruitment.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import {
  createRequisitionSchema,
  advanceCandidateSchema,
  updateCandidateChecklistSchema,
} from "../validators/recruitment.validator.ts";

export const getRequisitions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const jobs = await RecruitmentService.getRequisitions();
  return SuccessResponse(
    res,
    "Job requisitions retrieved successfully",
    jobs,
    statusCode.OK
  );
});

export const createRequisition = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createRequisitionSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const job = await RecruitmentService.createRequisition(parsed.data);
  return SuccessResponse(
    res,
    "Job requisition created successfully",
    job,
    statusCode.Created
  );
});

export const getCandidates = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const candidates = await RecruitmentService.getCandidates();
  return SuccessResponse(
    res,
    "Candidates retrieved successfully",
    candidates,
    statusCode.OK
  );
});

export const advanceCandidate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = advanceCandidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const candidate = await RecruitmentService.advanceCandidate(id, parsed.data.stage);
  return SuccessResponse(
    res,
    "Candidate stage advanced successfully",
    candidate,
    statusCode.OK
  );
});

export const updateCandidateChecklist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const parsed = updateCandidateChecklistSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(parsed.error);
    }

    const candidate = await RecruitmentService.updateCandidateChecklist(id, parsed.data);
    return SuccessResponse(
      res,
      "Candidate pre-onboarding checklist updated successfully",
      candidate,
      statusCode.OK
    );
  }
);

export const rejectCandidate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  await RecruitmentService.rejectCandidate(id);
  return SuccessResponse(
    res,
    "Candidate archived / rejected successfully",
    null,
    statusCode.OK
  );
});
