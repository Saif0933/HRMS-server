import type { NextFunction, Response } from "express";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import type { AuthenticatedRequest } from "../../user/controllers/auth.controller.ts";
import { OrganizationService } from "../services/organization.service.ts";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validators/organization.validator.ts";

/**
 * Normalize incoming body data for backward compatibility and flat payload formats (e.g. Postman)
 */
function normalizeOrganizationBody(body: any) {
  const normalized = { ...body };

  // Normalize aliases
  if (normalized.companyType !== undefined && normalized.type === undefined) {
    if (typeof normalized.companyType === "string") {
      const val = normalized.companyType.toUpperCase();
      if (val.startsWith("PRIVATE")) {
        normalized.type = "PRIVATE";
      } else if (val.startsWith("PUBLIC")) {
        normalized.type = "PUBLIC";
      } else if (["LLP", "PARTNERSHIP"].includes(val)) {
        normalized.type = val;
      }
    }
  }
  if (normalized.phone !== undefined && normalized.mobileNumber === undefined) {
    normalized.mobileNumber = normalized.phone;
  }
  if (normalized.gstNumber !== undefined && normalized.gst === undefined) {
    normalized.gst = normalized.gstNumber;
  }
  if (normalized.panNumber !== undefined && normalized.pan === undefined) {
    normalized.pan = normalized.panNumber;
  }
  if (normalized.cinNumber !== undefined && normalized.cin === undefined) {
    normalized.cin = normalized.cinNumber;
  }

  // Normalize flat address fields
  const hasFlatAddress =
    normalized.country !== undefined ||
    normalized.state !== undefined ||
    normalized.city !== undefined ||
    normalized.district !== undefined ||
    normalized.area !== undefined ||
    normalized.street !== undefined ||
    normalized.addressLine1 !== undefined ||
    normalized.buildingName !== undefined ||
    normalized.addressLine2 !== undefined ||
    normalized.floor !== undefined ||
    normalized.landmark !== undefined ||
    normalized.pincode !== undefined ||
    normalized.postalCode !== undefined ||
    normalized.latitude !== undefined ||
    normalized.longitude !== undefined;

  if (normalized.address === undefined && hasFlatAddress) {
    normalized.address = {
      country: normalized.country,
      state: normalized.state,
      city: normalized.city,
      district: normalized.district,
      area: normalized.area,
      street: normalized.street || normalized.addressLine1,
      buildingName: normalized.buildingName || normalized.addressLine2,
      floor: normalized.floor,
      landmark: normalized.landmark,
      pincode: normalized.pincode || normalized.postalCode,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
    };
  }

  return normalized;
}

/**
 * POST /api/v1/organizations
 */
export const createOrganization = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const normalizedBody = normalizeOrganizationBody(req.body);
    const parsed = createOrganizationSchema.safeParse(normalizedBody);
    if (!parsed.success) return next(parsed.error);

    const org = await OrganizationService.create(parsed.data);
    return SuccessResponse(res, "Organization created successfully", { organization: org }, statusCode.Created);
  }
);

/**
 * GET /api/v1/organizations
 */
export const listOrganizations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const result = await OrganizationService.list(page, limit);
    return SuccessResponse(res, "Organizations retrieved", result);
  }
);

/**
 * GET /api/v1/organizations/:id
 */
export const getOrganization = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const org = await OrganizationService.getById(req.params.id as string);
    return SuccessResponse(res, "Organization retrieved", { organization: org });
  }
);

/**
 * PATCH /api/v1/organizations/:id
 */
export const updateOrganization = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const normalizedBody = normalizeOrganizationBody(req.body);
    const parsed = updateOrganizationSchema.safeParse(normalizedBody);
    if (!parsed.success) return next(parsed.error);

    const org = await OrganizationService.update(req.params.id as string, parsed.data);
    return SuccessResponse(res, "Organization updated successfully", { organization: org });
  }
);

/**
 * DELETE /api/v1/organizations/:id
 */
export const deleteOrganization = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    await OrganizationService.delete(req.params.id as string);
    return SuccessResponse(res, "Organization deleted successfully", {});
  }
);
