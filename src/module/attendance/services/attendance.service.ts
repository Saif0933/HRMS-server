import { AttendanceRepository } from "../repo/attendance.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class AttendanceService {
  static async getPunches(employeeId: string) {
    let punches = await AttendanceRepository.findPunchesByEmployee(employeeId);

    if (punches.length === 0) {
      // Seed default punches
      await AttendanceRepository.createPunch({
        employeeId,
        time: "Yesterday, 09:34 AM",
        type: "In",
        method: "Biometric Portal",
        lat: 23.357445,
        lng: 85.311484,
      });

      await AttendanceRepository.createPunch({
        employeeId,
        time: "Yesterday, 06:31 PM",
        type: "Out",
        method: "Biometric Portal",
        lat: 23.357445,
        lng: 85.311484,
      });

      punches = await AttendanceRepository.findPunchesByEmployee(employeeId);
    }

    return punches.map((p) => ({
      id: p.id,
      time: p.time,
      type: p.type,
      method: p.method,
      lat: p.lat,
      lng: p.lng,
      selfiePreview: p.selfiePreview,
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
        throw new ErrorResponse(
          `Outside allowed geofenced perimeter. Closest fence is ${Math.round(minDistance)}m away. Punch blocked!`,
          statusCode.Forbidden
        );
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
