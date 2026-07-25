import { prisma } from "../../../db/prisma.ts";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "../validators/organization.validator.ts";
import crypto from "crypto";

const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// ─── Shared Prisma includes ─────────────────────────────────────────────────
const ROLE_SELECT = { id: true, name: true, description: true } as const;

const MEMBERSHIP_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: { select: ROLE_SELECT }, // system-wide role
    },
  },
  organizations: { select: { id: true, name: true } },
  role: { select: ROLE_SELECT }, // org-level role
} as const;

// ─── Organization Repository ────────────────────────────────────────────────
export class OrganizationRepository {
  // ── Org CRUD ────────────────────────────────────────────────────────────

  static async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { memberships: true } },
        address: true,
      },
    });
  }

  static async findByName(name: string) {
    return prisma.organization.findUnique({
      where: { name },
      include: { address: true },
    });
  }

  static async create(data: CreateOrganizationInput) {
    const { address, password, ...orgData } = data;
    const plainPassword = password || "Admin@123";
    const hashedPassword = hashPassword(plainPassword);

    // 1. Fetch or create SUPER_ADMIN role with all permissions connected
    const allPermissions = await prisma.permission.findMany({ select: { id: true } });

    let superAdminRole = await prisma.role.findFirst({
      where: { name: "SUPER_ADMIN" }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          id: "role_super_admin",
          name: "SUPER_ADMIN",
          description: "Full system control with all permissions",
          isSystem: true,
          permissions: {
            connect: allPermissions.map((p) => ({ id: p.id })),
          },
        },
      });
    } else {
      // Ensure all permissions are connected to SUPER_ADMIN role
      await prisma.role.update({
        where: { id: superAdminRole.id },
        data: {
          permissions: {
            set: allPermissions.map((p) => ({ id: p.id })),
          },
        },
      });
    }

    // 2. Create a separate dedicated Admin User for this organization
    const user = await prisma.user.create({
      data: {
        name: `Admin - ${orgData.name}`,
        phone: orgData.mobileNumber || null,
        email: orgData.email || null,
        password: hashedPassword,
        roleId: superAdminRole.id,
      }
    });
    console.log(`[Onboarding] Created dedicated admin user ${user.id} with SUPER_ADMIN permissions for organization ${orgData.name}`);

    // 3. Create the organization (without userId, linked via membership table instead)
    const organization = await prisma.organization.create({
      data: {
        ...orgData,
        address: address ? { create: address } : undefined,
      } as any,
      include: { address: true },
    });

    // 4. Create a membership record for this user in the organization with SUPER_ADMIN role
    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        status: "ACTIVE",
        roleId: superAdminRole.id,
      } as any
    });


    return organization;
  }

  static async findMany(opts: { skip: number; take: number }) {
    return Promise.all([
      prisma.organization.findMany({
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { memberships: true } },
          address: true,
        },
      }),
      prisma.organization.count(),
    ]);
  }

  static async update(id: string, data: UpdateOrganizationInput) {
    const { address, password, ...orgData } = data;
    return prisma.organization.update({
      where: { id },
      data: {
        ...orgData,
        address: address ? {
          upsert: {
            create: address,
            update: address,
          },
        } : undefined,
      } as any,
      include: { address: true },
    });
  }

  static async delete(id: string) {
    return prisma.organization.delete({ where: { id } });
  }
}

// ─── Membership Repository ───────────────────────────────────────────────────
export class MembershipRepository {
  // ── Single-row lookups ──────────────────────────────────────────────────

  static async findByCompositeKey(userId: string, organizationId: string) {
    return prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } } as any,
    });
  }

  static async findByCompositeKeyWithRelations(userId: string, organizationId: string) {
    return prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } } as any,
      include: MEMBERSHIP_INCLUDE as any,
    });
  }

  // ── List lookups ────────────────────────────────────────────────────────

  static async findByOrganization(
    organizationId: string,
    filters?: { status?: string }
  ) {
    return prisma.membership.findMany({
      where: {
        organizationId,
        ...(filters?.status ? { status: filters.status as any } : {}),
      } as any,
      include: MEMBERSHIP_INCLUDE as any,
      orderBy: { joinedAt: "asc" },
    });
  }

  static async findByUser(userId: string) {
    return prisma.membership.findMany({
      where: { userId },
      include: {
        organizations: true,
        role: { select: ROLE_SELECT },
      } as any,
      orderBy: { joinedAt: "desc" },
    });
  }

  // ── Mutations ───────────────────────────────────────────────────────────

  static async create(data: {
    userId: string;
    organizationId: string;
    roleId?: string | null;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED";
  }) {
    return prisma.membership.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        roleId: data.roleId ?? null,
        status: data.status ?? "ACTIVE",
      } as any,
      include: MEMBERSHIP_INCLUDE as any,
    });
  }

  static async update(
    userId: string,
    organizationId: string,
    data: { roleId?: string | null; status?: string }
  ) {
    return prisma.membership.update({
      where: { userId_organizationId: { userId, organizationId } } as any,
      data: {
        ...(data.roleId !== undefined ? { roleId: data.roleId } : {}),
        ...(data.status ? { status: data.status as any } : {}),
      } as any,
      include: MEMBERSHIP_INCLUDE as any,
    });
  }

  static async delete(userId: string, organizationId: string) {
    return prisma.membership.delete({
      where: { userId_organizationId: { userId, organizationId } } as any,
    });
  }

  // ── Aggregate helpers ───────────────────────────────────────────────────

  static async countByOrganization(organizationId: string) {
    return prisma.membership.count({
      where: { organizationId } as any
    });
  }

  static async countByUser(userId: string) {
    return prisma.membership.count({ where: { userId } });
  }
}
