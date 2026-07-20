import type { NextFunction, Response } from "express";
import { asyncHandler } from "../../../middlewares/error.middleware.ts";
import { statusCode } from "../../../types/types.ts";
import { SuccessResponse } from "../../../utils/response.util.ts";
import type { AuthenticatedRequest } from "../../user/controllers/auth.controller.ts";
import { MembershipService } from "../services/organization.service.ts";
import {
  addMemberSchema,
  updateMembershipSchema,
} from "../validators/organization.validator.ts";

/**
 * POST /api/v1/organizations/:orgId/members
 */
export const addMember = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const orgId = req.params.orgId as string;
    const membership = await MembershipService.addMember(orgId, parsed.data);
    return SuccessResponse(res, "Member added successfully", { membership }, statusCode.Created);
  }
);

/**
 * DELETE /api/v1/organizations/:orgId/members/:userId
 */
export const removeMember = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { orgId, userId } = req.params as { orgId: string; userId: string };
    await MembershipService.removeMember(orgId, userId);
    return SuccessResponse(res, "Member removed successfully", {});
  }
);

/**
 * PATCH /api/v1/organizations/:orgId/members/:userId
 */
export const updateMembership = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = updateMembershipSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);

    const { orgId, userId } = req.params as { orgId: string; userId: string };
    const membership = await MembershipService.updateMembership(orgId, userId, parsed.data);
    return SuccessResponse(res, "Membership updated successfully", { membership });
  }
);

/**
 * GET /api/v1/organizations/:orgId/members
 */
export const listMembers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const orgId = req.params.orgId as string;
    const statusFilter = req.query.status as string | undefined;
    const result = await MembershipService.listMembers(orgId, statusFilter);
    return SuccessResponse(res, "Members retrieved", result);
  }
);

/**
 * GET /api/v1/organizations/:orgId/members/:userId
 */
export const getMembership = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { orgId, userId } = req.params as { orgId: string; userId: string };
    const membership = await MembershipService.getMembership(orgId, userId);
    return SuccessResponse(res, "Membership retrieved", { membership });
  }
);

/**
 * GET /api/v1/organizations/me
 */
export const listMyOrganizations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const organizations = await MembershipService.listMyOrganizations(req.user.id);
    return SuccessResponse(res, "Your organizations retrieved", { organizations });
  }
);
