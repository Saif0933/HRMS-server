import { prisma } from "../../../db/prisma.ts";

export class TimesheetRepository {
  static async findTimesheets(filters: { employeeId?: string; status?: string }) {
    const whereClause: any = {};
    if (filters.employeeId) {
      whereClause.employeeId = filters.employeeId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }

    return prisma.timesheet.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTimesheet(data: {
    employeeId: string;
    project: string;
    task: string;
    monHours: number;
    tueHours: number;
    wedHours: number;
    thuHours: number;
    friHours: number;
    totalHours: number;
    week: string;
  }) {
    return prisma.timesheet.create({
      data,
    });
  }

  static async findTimesheetById(id: string) {
    return prisma.timesheet.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async updateTimesheetStatus(id: string, status: string) {
    return prisma.timesheet.update({
      where: { id },
      data: { status },
    });
  }
}
