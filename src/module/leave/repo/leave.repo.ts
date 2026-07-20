import { prisma } from "../../../db/prisma.ts";

export class LeaveRepository {
  // LeaveType Operations
  static async findTypeById(id: string) {
    return prisma.leaveType.findUnique({
      where: { id },
    });
  }

  static async findTypeByName(name: string) {
    return prisma.leaveType.findUnique({
      where: { name },
    });
  }

  static async findTypeByCode(code: string) {
    return prisma.leaveType.findUnique({
      where: { code },
    });
  }

  static async createType(data: any) {
    return prisma.leaveType.create({
      data,
    });
  }

  static async findAllTypes(activeOnly = false) {
    return prisma.leaveType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
    });
  }

  static async updateType(id: string, data: any) {
    return prisma.leaveType.update({
      where: { id },
      data,
    });
  }

  static async deleteType(id: string) {
    return prisma.leaveType.delete({
      where: { id },
    });
  }

  // LeaveAllocation Operations
  static async findAllocation(employeeId: string, leaveTypeId: string, year: number) {
    return prisma.leaveAllocation.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year,
        },
      },
      include: {
        leaveType: true,
      },
    });
  }

  static async createAllocation(data: any) {
    return prisma.leaveAllocation.create({
      data,
      include: {
        leaveType: true,
      },
    });
  }

  static async updateAllocation(id: string, data: any) {
    return prisma.leaveAllocation.update({
      where: { id },
      data,
      include: {
        leaveType: true,
      },
    });
  }

  static async findAllAllocations(filters: { employeeId?: string; year?: number }) {
    return prisma.leaveAllocation.findMany({
      where: {
        employeeId: filters.employeeId,
        year: filters.year,
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { year: "desc" },
    });
  }

  // LeaveRequest Operations
  static async findRequestById(id: string) {
    return prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async createRequest(data: any) {
    return prisma.leaveRequest.create({
      data,
      include: {
        leaveType: true,
      },
    });
  }

  static async updateRequest(id: string, data: any) {
    return prisma.leaveRequest.update({
      where: { id },
      data,
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async findAllRequests(filters: {
    employeeId?: string;
    leaveTypeId?: string;
    status?: any;
  }) {
    const whereClause: any = {};
    if (filters.employeeId) whereClause.employeeId = filters.employeeId;
    if (filters.leaveTypeId) whereClause.leaveTypeId = filters.leaveTypeId;
    if (filters.status) whereClause.status = filters.status;

    return prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { appliedDate: "desc" },
    });
  }
}
