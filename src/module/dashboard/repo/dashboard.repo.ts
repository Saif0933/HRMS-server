import { prisma } from "../../../db/prisma.ts";

export class DashboardRepository {
  static async getEmployeesCount() {
    return prisma.employee.findMany({
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

  static async getPendingLeaves() {
    return prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        employee: true,
        leaveType: true
      }
    });
  }

  static async getPendingClaims() {
    return prisma.travelClaim.findMany({
      where: { status: "Pending" },
      include: {
        employee: true
      }
    });
  }

  static async getHolidays() {
    return prisma.holiday.findMany({
      orderBy: { date: "asc" }
    });
  }

  static async getRecentAuditLogs() {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15
    });
  }

  static async createAuditLog(data: { user: string; action: string; module: string; details: string }) {
    return prisma.auditLog.create({
      data
    });
  }
}
