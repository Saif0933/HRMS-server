import { prisma } from "../../../db/prisma.ts";

export class RoleRepository {
  // Permission Operations
  static async findPermissionByName(name: string) {
    return prisma.permission.findUnique({
      where: { name },
    });
  }

  static async createPermission(data: { name: string; description?: string; module?: string }) {
    return prisma.permission.create({
      data,
    });
  }

  static async findAllPermissions() {
    return prisma.permission.findMany({
      orderBy: { module: "asc" },
    });
  }

  static async findPermissionsByIds(ids: string[]) {
    return prisma.permission.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // Role Operations
  static async findRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  static async findRoleById(id: string, includePermissions = true) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: includePermissions,
      },
    });
  }

  static async createRole(data: { name: string; description?: string; permissionIds: string[] }) {
    const { name, description, permissionIds } = data;
    return prisma.role.create({
      data: {
        name,
        description,
        isSystem: false,
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  static async findAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { name: "asc" },
    });
  }

  static async updateRole(
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] }
  ) {
    const { name, description, permissionIds } = data;
    const updateData: any = {
      name,
      description,
    };

    if (permissionIds) {
      updateData.permissions = {
        set: permissionIds.map((permId) => ({ id: permId })),
      };
    }

    return prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
      },
    });
  }

  static async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id },
    });
  }

  // User Operations
  static async findUserById(id: string) {
    const userById = await prisma.user.findUnique({
      where: { id },
    });
    if (userById) return userById;

    const userByEmail = await prisma.user.findUnique({
      where: { email: id },
    });
    if (userByEmail) return userByEmail;

    const userByPhone = await prisma.user.findUnique({
      where: { phone: id },
    });
    if (userByPhone) return userByPhone;

    const cleanInput = id.replace(/\D/g, "");
    if (cleanInput.length >= 10) {
      const allUsers = await prisma.user.findMany({
        where: {
          phone: { not: null }
        }
      });
      const matchingUser = allUsers.find(u => {
        const cleanPhone = u.phone?.replace(/\D/g, "");
        return cleanPhone === cleanInput || (cleanPhone && cleanPhone.endsWith(cleanInput)) || (cleanInput.endsWith(cleanPhone || ""));
      });
      if (matchingUser) return matchingUser;
    }

    return null;
  }

  static async updateUserRoleId(userId: string, roleId: string | null) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error(`User with identifier '${userId}' not found.`);
    }

    return prisma.user.update({
      where: { id: user.id },
      data: {
        roleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
