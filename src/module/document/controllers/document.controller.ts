import type { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/document.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { uploadDocumentSchema } from "../validators/document.validator.ts";

export const getDocuments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = req.query.employeeId as string | undefined;
  const category = req.query.category as string | undefined;

  const docs = await DocumentService.getDocuments({ employeeId, category });

  return SuccessResponse(
    res,
    "Documents retrieved successfully",
    docs,
    statusCode.OK
  );
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = uploadDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const doc = await DocumentService.uploadDocument(parsed.data);

  return SuccessResponse(
    res,
    "Document uploaded successfully",
    doc,
    statusCode.Created
  );
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  await DocumentService.deleteDocument(id);

  return SuccessResponse(
    res,
    "Document deleted successfully",
    null,
    statusCode.OK
  );
});
