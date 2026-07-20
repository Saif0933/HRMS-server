import { prisma } from "../../../db/prisma.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import {
  OrganizationRepository,
  MembershipRepository,
} from "../repo/organization.repo.ts";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMembershipInput,
} from "../validators/organization.validator.ts";

// ─── Organization Service ────────────────────────────────────────────────────
export class OrganizationService {
  /**
   * Create a new organization.
   * Throws 409 if the name already exists.
   */
  static async create(data: CreateOrganizationInput) {
    const existing = await OrganizationRepository.findByName(data.name);
    if (existing) {
      throw new ErrorResponse(
        `An organization named "${data.name}" already exists`,
        statusCode.Conflict
      );
    }
    return OrganizationRepository.create(data);
  }

  /**
   * Paginated list of all organizations.
   */
  static async list(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [organizations, total] = await OrganizationRepository.findMany({ skip, take: limit });
    return {
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single organization by ID.
   * Throws 404 if not found.
   */
  static async getById(id: string) {
    const org = await OrganizationRepository.findById(id);
    if (!org) {
      throw new ErrorResponse("Organization not found", statusCode.Not_Found);
    }
    return org;
  }

  /**
   * Update an organization's details.
   * Throws 404 if not found.
   */
  static async update(id: string, data: UpdateOrganizationInput) {
    await OrganizationService.getById(id); // 404 guard
    return OrganizationRepository.update(id, data);
  }

  /**
   * Delete an organization (memberships cascade automatically via FK).
   * Throws 404 if not found.
   */
  static async delete(id: string) {
    await OrganizationService.getById(id); // 404 guard
    return OrganizationRepository.delete(id);
  }
}

// ─── Membership Service ──────────────────────────────────────────────────────
export class MembershipService {
  /**
   * Add a user to an organization.
   * - Validates org, user, and optional roleId existence.
   * - Throws 409 if user is already a member.
   */
  static async addMember(orgId: string, data: AddMemberInput) {
    // Verify organization exists
    const org = await OrganizationRepository.findById(orgId);
    if (!org) {
      throw new ErrorResponse("Organization not found", statusCode.Not_Found);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new ErrorResponse("User not found", statusCode.Not_Found);
    }

    // Verify roleId exists if provided
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new ErrorResponse(
          `Role with id "${data.roleId}" not found`,
          statusCode.Not_Found
        );
      }
    }

    // Duplicate membership guard
    const existing = await MembershipRepository.findByCompositeKey(data.userId, orgId);
    if (existing) {
      throw new ErrorResponse(
        "User is already a member of this organization",
        statusCode.Conflict
      );
    }

    return MembershipRepository.create({
      userId: data.userId,
      organizationId: orgId,
      roleId: data.roleId ?? null,
      status: "ACTIVE",
    });
  }

  /**
   * Remove a user from an organization.
   * Throws 404 if membership does not exist.
   */
  static async removeMember(orgId: string, userId: string) {
    const membership = await MembershipRepository.findByCompositeKey(userId, orgId);
    if (!membership) {
      throw new ErrorResponse("Membership not found", statusCode.Not_Found);
    }
    return MembershipRepository.delete(userId, orgId);
  }

  /**
   * Update a membership's org-level role or status.
   * - Validates membership existence.
   * - Validates new roleId if provided.
   */
  static async updateMembership(
    orgId: string,
    userId: string,
    data: UpdateMembershipInput
  ) {
    const membership = await MembershipRepository.findByCompositeKey(userId, orgId);
    if (!membership) {
      throw new ErrorResponse("Membership not found", statusCode.Not_Found);
    }

    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new ErrorResponse(
          `Role with id "${data.roleId}" not found`,
          statusCode.Not_Found
        );
      }
    }

    return MembershipRepository.update(userId, orgId, data);
  }

  /**
   * List all members of an organization.
   * Optionally filter by status query param.
   * Throws 404 if org does not exist.
   */
  static async listMembers(orgId: string, statusFilter?: string) {
    const org = await OrganizationRepository.findById(orgId);
    if (!org) {
      throw new ErrorResponse("Organization not found", statusCode.Not_Found);
    }

    const members = await MembershipRepository.findByOrganization(orgId, {
      status: statusFilter,
    });

    return { organization: org, members };
  }

  /**
   * List all organizations a user belongs to (with their org-level role).
   */
  static async listMyOrganizations(userId: string) {
    const memberships = await MembershipRepository.findByUser(userId);

    return memberships.map((m: any) => ({
      ...m.organizations,
      memberRole: m.role,   // full Role object: { id, name, description }
      status: m.status,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Get a single membership with full relations.
   * Throws 404 if not found.
   */
  static async getMembership(orgId: string, userId: string) {
    const membership = await MembershipRepository.findByCompositeKeyWithRelations(userId, orgId);
    if (!membership) {
      throw new ErrorResponse("Membership not found", statusCode.Not_Found);
    }
    return membership;
  }
}
