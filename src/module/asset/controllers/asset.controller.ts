import type { Request, Response, NextFunction } from "express";
import { AssetService } from "../services/asset.service.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { createAssetSchema, assignAssetSchema } from "../validators/asset.validator.ts";

export const getAssets = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const assets = await AssetService.getAssets();
  return SuccessResponse(
    res,
    "Assets retrieved successfully",
    assets,
    statusCode.OK
  );
});

export const createAsset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createAssetSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const asset = await AssetService.createAsset(parsed.data);
  return SuccessResponse(
    res,
    "Asset registered successfully",
    asset,
    statusCode.Created
  );
});

export const assignAsset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const parsed = assignAssetSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(parsed.error);
  }

  const asset = await AssetService.assignAsset(id, parsed.data.employeeId || null);
  return SuccessResponse(
    res,
    "Asset assignment updated successfully",
    asset,
    statusCode.OK
  );
});
