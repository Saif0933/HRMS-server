import { AttendanceRepository } from "../repo/attendance.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

const formatPunchTime = (createdAt: Date, timeStr: string) => {
  if (!createdAt) return timeStr;
  const now = new Date();
  const punchDate = new Date(createdAt);
  
  let clockPart = timeStr;
  if (timeStr.includes(",")) {
    clockPart = timeStr.split(",")[1]?.trim() ?? timeStr;
  } else {
    const match = timeStr.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
    if (match) clockPart = match[0];
  }

  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const punchMidnight = new Date(punchDate.getFullYear(), punchDate.getMonth(), punchDate.getDate()).getTime();

  const diffDays = Math.round((nowMidnight - punchMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${clockPart}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${clockPart}`;
  } else if (diffDays > 1 && diffDays < 7) {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${daysOfWeek[punchDate.getDay()]}, ${clockPart}`;
  } else {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = punchDate.getDate().toString().padStart(2, '0');
    const month = monthNames[punchDate.getMonth()];
    return `${day} ${month} ${punchDate.getFullYear()}, ${clockPart}`;
  }
};

export class AttendanceService {
  static async getPunches(employeeId: string) {
    let punches = await AttendanceRepository.findPunchesByEmployee(employeeId);

    if (punches.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.attendancePunch.create({
        data: {
          employeeId,
          time: "Yesterday, 09:34 AM",
          type: "In",
          method: "Biometric Portal",
          lat: 23.357445,
          lng: 85.311484,
          createdAt: yesterday
        }
      });

      await prisma.attendancePunch.create({
        data: {
          employeeId,
          time: "Yesterday, 06:31 PM",
          type: "Out",
          method: "Biometric Portal",
          lat: 23.357445,
          lng: 85.311484,
          createdAt: yesterday
        }
      });

      punches = await AttendanceRepository.findPunchesByEmployee(employeeId);
    }

    return punches.map((p) => ({
      id: p.id,
      time: formatPunchTime(p.createdAt, p.time),
      type: p.type,
      method: p.method,
      lat: p.lat,
      lng: p.lng,
      selfiePreview: p.selfiePreview,
      createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
    }));
  }

  static async createPunch(data: {
    employeeId: string;
    type: string;
    method: string;
    lat: number;
    lng: number;
    selfiePreview?: string | null;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    // Geofencing Check
    const fences = await this.getGeofences();
    const activeFences = fences.filter(f => f.isActive);

    if (activeFences.length > 0) {
      let isWithinAnyFence = false;
      let minDistance = Infinity;

      for (const fence of activeFences) {
        const dist = calculateDistance(data.lat, data.lng, fence.lat, fence.lng);
        if (dist <= fence.radius) {
          isWithinAnyFence = true;
          break;
        }
        if (dist < minDistance) {
          minDistance = dist;
        }
      }

      if (!isWithinAnyFence) {
        const distLabel = minDistance >= 1000 ? `${(minDistance / 1000).toFixed(1)}km` : `${Math.round(minDistance)}m`;
        data.method = `${data.method} (Out of Geofence - ${distLabel})`;
      }
    }

    // Format check time: e.g. "Today, 09:45 AM"
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const timeString = `Today, ${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

    return AttendanceRepository.createPunch({
      ...data,
      time: timeString,
    });
  }

  static async getRegularizations() {
    let regs = await AttendanceRepository.findRegularizations();

    if (regs.length === 0) {
      const employee = await prisma.employee.findFirst();
      const empId = employee?.id || null;

      if (empId) {
        await AttendanceRepository.createRegularization({
          employeeId: empId,
          date: "2026-06-25",
          timeIn: "09:30 AM",
          timeOut: "06:30 PM",
          reason: "Forgot to punch due to client conference",
        });

        regs = await AttendanceRepository.findRegularizations();
      }
    }

    return regs.map((r) => ({
      id: r.id,
      employeeName: r.employee.name,
      employeeId: r.employeeId,
      date: r.date,
      timeIn: r.timeIn,
      timeOut: r.timeOut,
      reason: r.reason,
      status: r.status,
    }));
  }

  static async applyRegularization(data: {
    employeeId: string;
    date: string;
    timeIn: string;
    timeOut: string;
    reason: string;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    // Standardize input times: convert HH:mm to 12-hour AM/PM format for consistency in reports
    const convertTo12Hour = (timeStr: string) => {
      const [h, m] = timeStr.split(":");
      const hours = parseInt(h || "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${h12.toString().padStart(2, "0")}:${m} ${ampm}`;
    };

    const formattedTimeIn = data.timeIn.includes(" ") ? data.timeIn : convertTo12Hour(data.timeIn);
    const formattedTimeOut = data.timeOut.includes(" ") ? data.timeOut : convertTo12Hour(data.timeOut);

    return AttendanceRepository.createRegularization({
      ...data,
      timeIn: formattedTimeIn,
      timeOut: formattedTimeOut,
    });
  }

  static async updateRegularization(id: string, status: string) {
    const req = await AttendanceRepository.findRegularizationById(id);
    if (!req) {
      throw new ErrorResponse("Regularization request not found", statusCode.Not_Found);
    }
    return AttendanceRepository.updateRegularizationStatus(id, status);
  }

  static async getGeofences() {
    let geofences = await AttendanceRepository.findGeofences();
    if (geofences.length === 0) {
      await AttendanceRepository.createGeofence({
        name: "Mumbai HQ (Main Branch)",
        lat: 19.0760,
        lng: 72.8777,
        radius: 100, // 100 meters
        isActive: true,
      });
      geofences = await AttendanceRepository.findGeofences();
    }
    return geofences;
  }

  static async createGeofence(data: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
    isActive?: boolean;
  }) {
    return AttendanceRepository.createGeofence(data);
  }

  static async deleteGeofence(id: string) {
    return AttendanceRepository.deleteGeofence(id);
  }

  static async getRosters(week: string) {
    return AttendanceRepository.findRostersByWeek(week);
  }

  static async saveRosters(week: string, rosters: Array<{
    employeeId: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  }>) {
    const results = [];
    for (const item of rosters) {
      const res = await AttendanceRepository.upsertRoster({
        ...item,
        week,
      });
      results.push(res);
    }
    return results;
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}
