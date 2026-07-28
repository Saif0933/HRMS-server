import { prisma } from "../../../db/prisma.ts";

export class DashboardRepository {
  static async getEmployeesCount(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return prisma.employee.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        gender: true,
        dob: true,
        joiningDate: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });
  }

  static async getPendingLeaves(organizationId?: string) {
    const where: any = { status: "PENDING" };
    if (organizationId) {
      where.employee = { organizationId };
    }

    return prisma.leaveRequest.findMany({
      where,
      include: {
        employee: true,
        leaveType: true
      }
    });
  }

  static async getPendingClaims(organizationId?: string) {
    const where: any = { status: "Pending" };
    if (organizationId) {
      where.employee = { organizationId };
    }

    return prisma.travelClaim.findMany({
      where,
      include: {
        employee: true
      }
    });
  }

  static async getHolidays(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.OR = [
        { organizationId },
        { organizationId: null }
      ];
    }

    return prisma.holiday.findMany({
      where,
      orderBy: { date: "asc" }
    });
  }

  static async getRecentAuditLogs(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 15
    });
  }

  static async createAuditLog(data: {
    user: string;
    action: string;
    module: string;
    details: string;
    organizationId?: string | null;
  }) {
    return prisma.auditLog.create({
      data
    });
  }
}
