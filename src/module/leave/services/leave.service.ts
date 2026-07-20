import { LeaveRepository } from "../repo/leave.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

function calculateDays(start: Date, end: Date, halfDay: boolean) {
  if (halfDay) return 0.5;
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const diffTime = endTime - startTime;
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export class LeaveService {
  // Helper to resolve employeeId from either Employee ID or User UUID
  private static async resolveEmployeeId(id: string): Promise<string | null> {
    let employee = await prisma.employee.findUnique({ where: { id } });
    if (employee) return employee.id;
    
    employee = await prisma.employee.findUnique({ where: { userId: id } });
    if (employee) return employee.id;

    // Check if the id matches a User record that hasn't been linked to an employee yet
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: { role: true }
    });
    if (user) {
      const empCount = await prisma.employee.count();
      const phoneStr = user.phone || "";
      const empId = `EMP${String(empCount + 1).padStart(3, '0')}`;
      const empName = user.name || "Employee " + empId;
      const empEmail = user.email || `${empId.toLowerCase()}@symbosys.com`;

      try {
        const newEmp = await prisma.employee.create({
          data: {
            id: empId,
            name: empName,
            email: empEmail,
            phone: phoneStr || `0000000${empId.replace(/\D/g, '')}`,
            status: "ACTIVE",
            joiningDate: new Date(),
            userId: user.id,
          }
        });
        console.log(`[Leave Service] Dynamically provisioned Employee ${empId} (${empName}) for User ${user.id}`);
        return newEmp.id;
      } catch (err) {
        // Fallback in case of race conditions
        const empRetry = await prisma.employee.findUnique({ where: { userId: user.id } });
        if (empRetry) return empRetry.id;
      }
    }
    
    return null;
  }

  // LeaveType Services
  static async createLeaveType(data: any) {
    const existingName = await LeaveRepository.findTypeByName(data.name);
    if (existingName) {
      throw new ErrorResponse("Leave type name already exists", statusCode.Conflict);
    }

    const existingCode = await LeaveRepository.findTypeByCode(data.code);
    if (existingCode) {
      throw new ErrorResponse("Leave type code already exists", statusCode.Conflict);
    }

    return LeaveRepository.createType(data);
  }

  static async getLeaveTypes(activeOnly = false) {
    const types = await LeaveRepository.findAllTypes(activeOnly);
    if (types.length === 0) {
      const defaults = [
        { name: "Sick Leave", code: "SL", defaultDays: 12, carryForward: false, maxCarryForward: 0, isActive: true },
        { name: "Casual Leave", code: "CL", defaultDays: 12, carryForward: false, maxCarryForward: 0, isActive: true },
        { name: "Earned Leave", code: "EL", defaultDays: 18, carryForward: true, maxCarryForward: 30, isActive: true },
        { name: "Maternity Leave", code: "ML", defaultDays: 90, carryForward: false, maxCarryForward: 0, isActive: true },
        { name: "Leave Without Pay", code: "LWP", defaultDays: 365, carryForward: false, maxCarryForward: 0, isActive: true },
      ];
      for (const item of defaults) {
        try {
          await LeaveRepository.createType(item);
        } catch (err) {
          // ignore unique constraint / race conditions
        }
      }
      return LeaveRepository.findAllTypes(activeOnly);
    }
    return types;
  }


  static async getLeaveTypeById(id: string) {
    const type = await LeaveRepository.findTypeById(id);
    if (!type) {
      throw new ErrorResponse("Leave type not found", statusCode.Not_Found);
    }
    return type;
  }

  static async updateLeaveType(id: string, data: any) {
    const type = await LeaveRepository.findTypeById(id);
    if (!type) {
      throw new ErrorResponse("Leave type not found", statusCode.Not_Found);
    }

    if (data.name && data.name !== type.name) {
      const existingName = await LeaveRepository.findTypeByName(data.name);
      if (existingName) {
        throw new ErrorResponse("Leave type name already exists", statusCode.Conflict);
      }
    }

    if (data.code && data.code !== type.code) {
      const existingCode = await LeaveRepository.findTypeByCode(data.code);
      if (existingCode) {
        throw new ErrorResponse("Leave type code already exists", statusCode.Conflict);
      }
    }

    return LeaveRepository.updateType(id, data);
  }

  static async deleteLeaveType(id: string) {
    const type = await LeaveRepository.findTypeById(id);
    if (!type) {
      throw new ErrorResponse("Leave type not found", statusCode.Not_Found);
    }

    // Check if there are allocations or requests referencing this type
    const allocationsCount = await prisma.leaveAllocation.count({ where: { leaveTypeId: id } });
    const requestsCount = await prisma.leaveRequest.count({ where: { leaveTypeId: id } });

    if (allocationsCount > 0 || requestsCount > 0) {
      // If used, soft-delete it by turning it inactive
      return LeaveRepository.updateType(id, { isActive: false });
    }

    return LeaveRepository.deleteType(id);
  }

  // LeaveAllocation Services
  static async allocateLeave(data: any) {
    // Verify employee exists
    const resolvedId = await LeaveService.resolveEmployeeId(data.employeeId);
    if (!resolvedId) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    data.employeeId = resolvedId;

    // Verify leave type exists
    const type = await LeaveRepository.findTypeById(data.leaveTypeId);
    if (!type) {
      throw new ErrorResponse("Leave type not found", statusCode.Not_Found);
    }

    const existing = await LeaveRepository.findAllocation(data.employeeId, data.leaveTypeId, data.year);
    if (existing) {
      return LeaveRepository.updateAllocation(existing.id, {
        allocated: data.allocated,
        carriedForward: data.carriedForward ?? existing.carriedForward,
      });
    }

    return LeaveRepository.createAllocation(data);
  }

  static async getLeaveAllocations(filters: { employeeId?: string; year?: number }) {
    const year = filters.year || new Date().getFullYear();
    if (filters.employeeId) {
      const resolvedId = await LeaveService.resolveEmployeeId(filters.employeeId);
      if (resolvedId) {
        const existing = await LeaveRepository.findAllAllocations({ employeeId: resolvedId, year });
        const activeTypes = await LeaveRepository.findAllTypes(true);
        const missingTypes = activeTypes.filter(t => !existing.some(a => a.leaveTypeId === t.id));
        if (missingTypes.length > 0) {
          for (const type of missingTypes) {
            try {
              await LeaveRepository.createAllocation({
                employeeId: resolvedId,
                leaveTypeId: type.id,
                year,
                allocated: type.defaultDays,
                carriedForward: 0,
              });
            } catch (err) {
              // Ignore unique constraint or concurrency issues
            }
          }
          return LeaveRepository.findAllAllocations({ employeeId: resolvedId, year });
        }
        return existing;
      }
    }
    return LeaveRepository.findAllAllocations(filters);
  }

  // LeaveRequest Services
  static async requestLeave(data: any) {
    // 1. Verify employee exists
    const resolvedId = await LeaveService.resolveEmployeeId(data.employeeId);
    if (!resolvedId) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    data.employeeId = resolvedId;

    // 2. Verify leave type exists and is active
    if (!data.leaveTypeId || String(data.leaveTypeId).trim() === "") {
      throw new ErrorResponse("Please select a leave category", statusCode.Bad_Request);
    }

    let leaveType = await LeaveRepository.findTypeById(data.leaveTypeId);
    if (!leaveType) {
      // Fallback: try looking up by code (e.g. "SL") or name
      leaveType = await LeaveRepository.findTypeByCode(data.leaveTypeId.toUpperCase());
    }
    if (!leaveType) {
      leaveType = await LeaveRepository.findTypeByName(data.leaveTypeId);
    }

    if (!leaveType || !leaveType.isActive) {
      console.error(`[Leave Request Error] Active leave type not found for input: "${data.leaveTypeId}"`);
      throw new ErrorResponse("Active leave type not found", statusCode.Not_Found);
    }

    // Standardize to database ID
    data.leaveTypeId = leaveType.id;


    // 3. Validate dates
    if (data.startDate > data.endDate) {
      throw new ErrorResponse("Start date cannot be after end date", statusCode.Bad_Request);
    }

    const totalDays = calculateDays(data.startDate, data.endDate, data.halfDay);
    if (totalDays <= 0) {
      throw new ErrorResponse("Total leave duration must be greater than 0", statusCode.Bad_Request);
    }

    const year = data.startDate.getFullYear();

    // 4. Resolve or initialize allocation balance
    let allocation = await LeaveRepository.findAllocation(data.employeeId, data.leaveTypeId, year);
    if (!allocation) {
      // Auto-provision allocation balance with leave type defaults
      allocation = await LeaveRepository.createAllocation({
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        year,
        allocated: leaveType.defaultDays,
        carriedForward: 0,
      });
    }

    // 5. Check overlapping requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: data.employeeId,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new ErrorResponse(
        "There is already a pending or approved leave request overlapping with this date range",
        statusCode.Conflict
      );
    }

    // 6. Check leave balance (unpaid / LWP doesn't enforce balance checks)
    const isUnpaid = leaveType.code.toLowerCase() === "lwp";
    if (!isUnpaid) {
      const remainingBalance = allocation.allocated + allocation.carriedForward - (allocation.used + allocation.pending);
      if (remainingBalance < totalDays) {
        throw new ErrorResponse(
          `Insufficient leave balance. Requested: ${totalDays} days | Available: ${remainingBalance} days`,
          statusCode.Bad_Request
        );
      }
    }

    // 7. Create request & update allocation pending days
    return prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.create({
        data: {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          startDate: data.startDate,
          endDate: data.endDate,
          halfDay: data.halfDay,
          halfDaySession: data.halfDaySession,
          totalDays,
          reason: data.reason,
          attachmentUrl: data.attachmentUrl,
          status: "PENDING",
        },
        include: {
          leaveType: true,
        },
      });

      await tx.leaveAllocation.update({
        where: { id: allocation.id },
        data: {
          pending: { increment: totalDays },
        },
      });

      return request;
    });
  }

  static async getLeaveRequests(filters: { employeeId?: string; leaveTypeId?: string; status?: any }) {
    if (filters.employeeId) {
      const resolvedId = await LeaveService.resolveEmployeeId(filters.employeeId);
      if (resolvedId) {
        filters.employeeId = resolvedId;
      }
    }
    return LeaveRepository.findAllRequests(filters);
  }

  static async getLeaveRequestById(id: string) {
    const request = await LeaveRepository.findRequestById(id);
    if (!request) {
      throw new ErrorResponse("Leave request not found", statusCode.Not_Found);
    }
    return request;
  }

  static async processLeaveRequest(id: string, approverId: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) {
    const request = await LeaveRepository.findRequestById(id);
    if (!request) {
      throw new ErrorResponse("Leave request not found", statusCode.Not_Found);
    }

    if (request.status !== "PENDING") {
      throw new ErrorResponse(`Leave request has already been ${request.status.toLowerCase()}`, statusCode.Bad_Request);
    }

    const year = request.startDate.getFullYear();
    const allocation = await LeaveRepository.findAllocation(request.employeeId, request.leaveTypeId, year);
    if (!allocation) {
      throw new ErrorResponse("Employee leave balance allocation not found", statusCode.Not_Found);
    }

    return prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          approvedById: approverId,
          approvedAt: new Date(),
          rejectionReason: status === "REJECTED" ? rejectionReason : null,
        },
        include: {
          leaveType: true,
          employee: { select: { id: true, name: true, email: true } },
        },
      });

      if (status === "APPROVED") {
        await tx.leaveAllocation.update({
          where: { id: allocation.id },
          data: {
            pending: { decrement: request.totalDays },
            used: { increment: request.totalDays },
          },
        });
      } else {
        await tx.leaveAllocation.update({
          where: { id: allocation.id },
          data: {
            pending: { decrement: request.totalDays },
          },
        });
      }

      return updatedRequest;
    });
  }

  static async cancelLeaveRequest(id: string, userId: string) {
    const request = await LeaveRepository.findRequestById(id);
    if (!request) {
      throw new ErrorResponse("Leave request not found", statusCode.Not_Found);
    }

    if (request.status === "CANCELLED" || request.status === "REJECTED") {
      throw new ErrorResponse(`Request is already ${request.status.toLowerCase()}`, statusCode.Bad_Request);
    }

    // If request was approved and start date has already passed, restrict cancellation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(request.startDate);
    start.setHours(0, 0, 0, 0);

    if (request.status === "APPROVED" && start < today) {
      throw new ErrorResponse("Cannot cancel an approved leave that has already started or passed", statusCode.Bad_Request);
    }

    const year = request.startDate.getFullYear();
    const allocation = await LeaveRepository.findAllocation(request.employeeId, request.leaveTypeId, year);
    if (!allocation) {
      throw new ErrorResponse("Employee leave balance allocation not found", statusCode.Not_Found);
    }

    return prisma.$transaction(async (tx) => {
      const cancelledRequest = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
        include: {
          leaveType: true,
        },
      });

      if (request.status === "PENDING") {
        await tx.leaveAllocation.update({
          where: { id: allocation.id },
          data: {
            pending: { decrement: request.totalDays },
          },
        });
      } else if (request.status === "APPROVED") {
        await tx.leaveAllocation.update({
          where: { id: allocation.id },
          data: {
            used: { decrement: request.totalDays },
          },
        });
      }

      return cancelledRequest;
    });
  }
}
