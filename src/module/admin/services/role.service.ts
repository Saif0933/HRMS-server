import { RoleRepository } from "../repo/role.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";

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
    const user = await RoleRepository.findUserById(userId);
    if (!user) {
      throw new ErrorResponse("User not found", statusCode.Not_Found);
    }

    if (roleId) {
      const role = await RoleRepository.findRoleById(roleId, false);
      if (!role) {
        throw new ErrorResponse("Role not found", statusCode.Not_Found);
      }
    }

    return RoleRepository.updateUserRoleId(userId, roleId);
  }
}
