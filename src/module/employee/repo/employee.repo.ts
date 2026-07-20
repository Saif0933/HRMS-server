import { prisma } from "../../../db/prisma.ts";

export class EmployeeRepository {
  static async create(data: any) {
    return prisma.employee.create({
      data,
      include: {
        user: {
          include: { role: true },
        },
        department: true,
        manager: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          include: { role: true },
        },
        department: true,
        manager: true,
        subordinates: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.employee.findUnique({
      where: { email },
      include: {
        user: {
          include: { role: true },
        },
        department: true,
        manager: true,
      },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.employee.findUnique({
      where: { userId },
    });
  }

  static async findAll(filters: {
    departmentId?: string;
    managerId?: string;
    status?: any;
    search?: string;
  }) {
    const whereClause: any = {};

    if (filters.departmentId) {
      whereClause.departmentId = filters.departmentId;
    }

    if (filters.managerId) {
      whereClause.managerId = filters.managerId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { id: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.employee.findMany({
      where: whereClause,
      include: {
        user: {
          include: { role: true },
        },
        department: true,
        manager: true,
      },
      orderBy: { name: "asc" },
    });
  }

  static async update(id: string, data: any) {
    return prisma.employee.update({
      where: { id },
      data,
      include: {
        user: {
          include: { role: true },
        },
        department: true,
        manager: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.employee.delete({
      where: { id },
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findDepartmentById(id: string) {
    return prisma.department.findUnique({
      where: { id },
    });
  }
}
