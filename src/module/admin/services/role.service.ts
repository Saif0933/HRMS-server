import { prisma } from "../../../db/prisma.ts";
import { statusCode } from "../../../types/types.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { RoleRepository } from "../repo/role.repo.ts";

export class RoleService {
  // Permission Services
  static async createPermission(data: { name: string; description?: string; module?: string }) {
    const existingPermission = await RoleRepository.findPermissionByName(data.name);
    if (existingPermission) {
      throw new ErrorResponse("Permission with this name already exists", statusCode.Conflict);
    }
    return RoleRepository.createPermission(data);
  }

  static async getPermissions() {
    return RoleRepository.findAllPermissions();
  }

  // Role Services
  static async createRole(data: { name: string; description?: string; permissionIds: string[] }) {
    const existingRole = await RoleRepository.findRoleByName(data.name);
    if (existingRole) {
      throw new ErrorResponse("Role with this name already exists", statusCode.Conflict);
    }

    const dbPermissions = await RoleRepository.findPermissionsByIds(data.permissionIds);
    if (dbPermissions.length !== data.permissionIds.length) {
      throw new ErrorResponse("One or more permission IDs are invalid", statusCode.Bad_Request);
    }

    return RoleRepository.createRole(data);
  }

  static async getRoles() {
    return RoleRepository.findAllRoles();
  }

  static async updateRole(
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] }
  ) {
    const role = await RoleRepository.findRoleById(id, false);
    if (!role) {
      throw new ErrorResponse("Role not found", statusCode.Not_Found);
    }

    if (role.isSystem && data.name && data.name !== role.name) {
      throw new ErrorResponse("System roles cannot be renamed", statusCode.Forbidden);
    }

    if (data.name && data.name !== role.name) {
      const existingRole = await RoleRepository.findRoleByName(data.name);
      if (existingRole) {
        throw new ErrorResponse("Role name already in use", statusCode.Conflict);
      }
    }

    if (data.permissionIds) {
      const dbPermissions = await RoleRepository.findPermissionsByIds(data.permissionIds);
      if (dbPermissions.length !== data.permissionIds.length) {
        throw new ErrorResponse("One or more permission IDs are invalid", statusCode.Bad_Request);
      }
    }

    return RoleRepository.updateRole(id, data);
  }

  static async deleteRole(id: string) {
    const role = await RoleRepository.findRoleById(id, false);
    if (!role) {
      throw new ErrorResponse("Role not found", statusCode.Not_Found);
    }

    if (role.isSystem) {
      throw new ErrorResponse("System roles cannot be deleted", statusCode.Forbidden);
    }

    return RoleRepository.deleteRole(id);
  }

  // User Assignment
  static async assignRoleToUser(userId: string, roleId: string | null) {
    let user = await RoleRepository.findUserById(userId);

    // If User is not found, check if there is an Employee matching this identifier (id, email, or phone)
    if (!user) {
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { id: userId },
            { email: userId },
            { phone: userId }
          ]
        }
      });

      if (employee) {
        // Automatically create a User account for the Employee on-the-fly
        user = await prisma.user.create({
          data: {
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            roleId: roleId
          }
        });

        // Link the Employee to the new User account
        await prisma.employee.update({
          where: { id: employee.id },
          data: { userId: user.id }
        });

        return user;
      }

      throw new ErrorResponse("User not found and no matching employee record could be resolved to auto-create user account.", statusCode.Not_Found);
    }

    // If User exists, validate the Role if one is specified
    if (roleId) {
      const role = await RoleRepository.findRoleById(roleId, false);
      if (!role) {
        throw new ErrorResponse("Role not found", statusCode.Not_Found);
      }
    }

    // Ensure the Employee record is correctly linked to this User if they match by email or phone
    const matchingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: user.email || undefined },
          { phone: user.phone || undefined }
        ]
      }
    });
    if (matchingEmployee && matchingEmployee.userId !== user.id) {
      await prisma.employee.update({
        where: { id: matchingEmployee.id },
        data: { userId: user.id }
      });
    }

    return RoleRepository.updateUserRoleId(user.id, roleId);
  }
}
