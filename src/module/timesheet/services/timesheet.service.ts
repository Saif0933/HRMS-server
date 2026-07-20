import { TimesheetRepository } from "../repo/timesheet.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class TimesheetService {
  static async getTimesheets(filters: { employeeId?: string; status?: string }) {
    let timesheets = await TimesheetRepository.findTimesheets(filters);

    // Auto-seed default timesheets if empty
    if (timesheets.length === 0) {
      const employee = await prisma.employee.findFirst();
      if (employee) {
        await TimesheetRepository.createTimesheet({
          employeeId: employee.id,
          project: "Vite Migration Upgrade",
          task: "Developing core routing components",
          monHours: 8,
          tueHours: 8,
          wedHours: 8,
          thuHours: 8,
          friHours: 8,
          totalHours: 40,
          week: "Week 26 (Jun 22 - Jun 28)",
        });

        timesheets = await TimesheetRepository.findTimesheets(filters);
      }
    }

    return timesheets.map((ts) => ({
      id: ts.id,
      employeeId: ts.employeeId,
      employeeName: ts.employee.name,
      project: ts.project,
      task: ts.task,
      monHours: ts.monHours,
      tueHours: ts.tueHours,
      wedHours: ts.wedHours,
      thuHours: ts.thuHours,
      friHours: ts.friHours,
      hours: ts.totalHours,
      week: ts.week,
      status: ts.status,
    }));
  }

  static async submitTimesheet(data: {
    employeeId: string;
    project: string;
    task: string;
    monHours: number;
    tueHours: number;
    wedHours: number;
    thuHours: number;
    friHours: number;
    week: string;
  }) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    const totalHours =
      data.monHours + data.tueHours + data.wedHours + data.thuHours + data.friHours;

    return TimesheetRepository.createTimesheet({
      ...data,
      totalHours,
    });
  }

  static async updateTimesheetStatus(id: string, status: string) {
    const timesheet = await TimesheetRepository.findTimesheetById(id);
    if (!timesheet) {
      throw new ErrorResponse("Timesheet entry not found", statusCode.Not_Found);
    }
    return TimesheetRepository.updateTimesheetStatus(id, status);
  }
}
