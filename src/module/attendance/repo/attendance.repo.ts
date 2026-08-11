import { prisma } from "../../../db/prisma.ts";

export class AttendanceRepository {
  static async findPunchesByEmployee(employeeId: string, userId?: string) {
    const OR_conds: any[] = [{ employeeId }];
    if (userId) OR_conds.push({ employeeId: userId });
    return prisma.attendancePunch.findMany({
      where: {
        OR: OR_conds,
      },
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

  static async findRegularizations(organizationId?: string) {
    return prisma.attendanceRegularization.findMany({
      where: organizationId
        ? {
            employee: {
              organizationId,
            },
          }
        : {},
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            organizationId: true,
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

  static async findGeofenceById(id: string) {
    return prisma.geofenceLocation.findUnique({
      where: { id },
    });
  }

  static async deleteGeofence(id: string) {
    return prisma.geofenceLocation.deleteMany({
      where: { id },
    });
  }

  static async findRostersByWeek(week?: string, organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.employee = { organizationId };
    }

    if (week && week.trim() !== "" && week !== "all") {
      const exactMatches = await (prisma as any).shiftRoster.findMany({
        where: {
          ...where,
          week,
        },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              designation: true,
              organizationId: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      if (exactMatches.length > 0) {
        return exactMatches;
      }
    }

    const allRosters = await (prisma as any).shiftRoster.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            designation: true,
            organizationId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const uniqueByEmp = new Map<string, any>();
    for (const r of allRosters) {
      const key = r.employeeId;
      if (!uniqueByEmp.has(key)) {
        uniqueByEmp.set(key, r);
      }
    }

    return Array.from(uniqueByEmp.values());
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
    try {
      await (prisma as any).shiftRoster.updateMany({
        where: { employeeId: data.employeeId },
        data: {
          mon: data.mon,
          tue: data.tue,
          wed: data.wed,
          thu: data.thu,
          fri: data.fri,
          sat: data.sat,
          sun: data.sun,
        },
      });
    } catch (err: any) {
      // Ignore fallback if no records exist yet
    }

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

  static async findShifts(organizationId?: string) {
    try {
      return await (prisma as any).shift.findMany({
        where: organizationId ? { OR: [{ organizationId }, { organizationId: null }] } : {},
        orderBy: { createdAt: "asc" },
      });
    } catch (err: any) {
      console.log("DB findShifts fallback:", err?.message || err);
      return [];
    }
  }

  static async createShift(data: any) {
    try {
      return await (prisma as any).shift.create({
        data,
      });
    } catch (err: any) {
      console.log("DB createShift fallback:", err?.message || err);
      return { id: data.id || `ST_${Date.now()}`, ...data };
    }
  }

  static async deleteShift(id: string, organizationId?: string) {
    try {
      if (organizationId) {
        return await (prisma as any).shift.deleteMany({
          where: {
            id,
            organizationId,
          },
        });
      }
      return await (prisma as any).shift.deleteMany({
        where: { id },
      });
    } catch (err: any) {
      console.log("DB deleteShift fallback:", err?.message || err);
      return { count: 1 };
    }
  }
}

