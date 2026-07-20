import { DepartmentRepository } from "../repo/department.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";

export class DepartmentService {
  static async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    managerId?: string | null;
    parentId?: string | null;
  }) {
    const existingName = await DepartmentRepository.findByName(data.name);
    if (existingName) {
      throw new ErrorResponse("Department with this name already exists", statusCode.Conflict);
    }

    const existingCode = await DepartmentRepository.findByCode(data.code);
    if (existingCode) {
      throw new ErrorResponse("Department with this code already exists", statusCode.Conflict);
    }

    let resolvedManagerId: string | null = null;
    if (data.managerId) {
      const manager = await DepartmentRepository.findUserById(data.managerId);
      if (!manager) {
        throw new ErrorResponse("Manager user not found", statusCode.Not_Found);
      }
      resolvedManagerId = manager.id;
    }

    if (data.parentId) {
      const parent = await DepartmentRepository.findById(data.parentId);
      if (!parent) {
        throw new ErrorResponse("Parent department not found", statusCode.Not_Found);
      }
    }

    return DepartmentRepository.create({
      ...data,
      managerId: resolvedManagerId
    });
  }

  static async getDepartments() {
    return DepartmentRepository.findAll();
  }

  static async getDepartmentById(id: string) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new ErrorResponse("Department not found", statusCode.Not_Found);
    }
    return department;
  }

  static async updateDepartment(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      managerId?: string | null;
      parentId?: string | null;
    }
  ) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new ErrorResponse("Department not found", statusCode.Not_Found);
    }

    if (data.name && data.name !== department.name) {
      const existingName = await DepartmentRepository.findByName(data.name);
      if (existingName) {
        throw new ErrorResponse("Department name already in use", statusCode.Conflict);
      }
    }

    if (data.code && data.code !== department.code) {
      const existingCode = await DepartmentRepository.findByCode(data.code);
      if (existingCode) {
        throw new ErrorResponse("Department code already in use", statusCode.Conflict);
      }
    }

    let resolvedManagerId: string | null | undefined = data.managerId;
    if (data.managerId) {
      const manager = await DepartmentRepository.findUserById(data.managerId);
      if (!manager) {
        throw new ErrorResponse("Manager user not found", statusCode.Not_Found);
      }
      resolvedManagerId = manager.id;
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw new ErrorResponse("A department cannot be its own parent", statusCode.Bad_Request);
      }
      const parent = await DepartmentRepository.findById(data.parentId);
      if (!parent) {
        throw new ErrorResponse("Parent department not found", statusCode.Not_Found);
      }
    }

    return DepartmentRepository.update(id, {
      ...data,
      managerId: resolvedManagerId
    });
  }

  static async deleteDepartment(id: string) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new ErrorResponse("Department not found", statusCode.Not_Found);
    }

    return DepartmentRepository.delete(id);
  }
}
