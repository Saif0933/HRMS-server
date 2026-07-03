import { prisma } from "../../../db/prisma.ts";

export class DepartmentRepository {
  static async create(data: {
    name: string;
    code: string;
    description?: string;
    managerId?: string | null;
    parentId?: string | null;
  }) {
    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        managerId: data.managerId || null,
        parentId: data.parentId || null,
      },
      include: {
        manager: true,
        parent: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
      include: {
        manager: true,
        parent: true,
        children: true,
      },
    });
  }

  static async findByName(name: string) {
    return prisma.department.findUnique({
      where: { name },
    });
  }

  static async findByCode(code: string) {
    return prisma.department.findUnique({
      where: { code },
    });
  }

  static async findAll() {
    return prisma.department.findMany({
      include: {
        manager: true,
        parent: true,
      },
      orderBy: { name: "asc" },
    });
  }

  static async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      managerId?: string | null;
      parentId?: string | null;
    }
  ) {
    return prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        managerId: data.managerId,
        parentId: data.parentId,
      },
      include: {
        manager: true,
        parent: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.department.delete({
      where: { id },
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
// 
