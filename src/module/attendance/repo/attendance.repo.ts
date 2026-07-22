import { prisma } from "../../../db/prisma.ts";

export class AttendanceRepository {
  static async findPunchesByEmployee(employeeId: string) {
    return prisma.attendancePunch.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createPunch(data: {
    employeeId: string;
    time: string;
    type: string;
    method: string;
    lat: number;
    lng: number;
    selfiePreview?: string | null;
  }) {
    return prisma.attendancePunch.create({
      data,
    });
  }

  static async findRegularizations() {
    return prisma.attendanceRegularization.findMany({
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createRegularization(data: {
    employeeId: string;
    date: string;
    timeIn: string;
    timeOut: string;
    reason: string;
  }) {
    return prisma.attendanceRegularization.create({
      data,
    });
  }

  static async findRegularizationById(id: string) {
    return prisma.attendanceRegularization.findUnique({
      where: { id },
    });
  }

  static async updateRegularizationStatus(id: string, status: string) {
    return prisma.attendanceRegularization.update({
      where: { id },
      data: { status },
    });
  }

  static async findGeofences() {
    return prisma.geofenceLocation.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async createGeofence(data: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
    isActive?: boolean;
  }) {
    return prisma.geofenceLocation.create({
      data,
    });
  }

  static async deleteGeofence(id: string) {
    return prisma.geofenceLocation.delete({
      where: { id },
    });
  }

  static async findRostersByWeek(week: string) {
    return (prisma as any).shiftRoster.findMany({
      where: { week },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            designation: true,
          },
        },
      },
    });
  }

  static async upsertRoster(data: {
    employeeId: string;
    week: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  }) {
    return (prisma as any).shiftRoster.upsert({
      where: {
        employeeId_week: {
          employeeId: data.employeeId,
          week: data.week,
        },
      },
      update: {
        mon: data.mon,
        tue: data.tue,
        wed: data.wed,
        thu: data.thu,
        fri: data.fri,
        sat: data.sat,
        sun: data.sun,
      },
      create: data,
    });
  }
}

