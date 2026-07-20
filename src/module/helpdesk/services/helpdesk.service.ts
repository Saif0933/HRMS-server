import { HelpDeskRepository } from "../repo/helpdesk.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class HelpDeskService {
  static async getTickets() {
    let tickets = await HelpDeskRepository.findTickets();

    if (tickets.length === 0) {
      const employee = await prisma.employee.findFirst();
      const empId = employee?.id || null;

      if (empId) {
        await HelpDeskRepository.createTicket({
          employeeId: empId,
          subject: "Intranet VPN credentials not authenticating",
          description: "Trying to connect from home broadband, login fails continuously.",
          category: "IT",
          priority: "High",
          slaHoursLeft: 4,
          date: "2026-06-30",
        });

        await HelpDeskRepository.createTicket({
          employeeId: empId,
          subject: "June tax deduction slips missing basic values",
          description: "HR Portal doesn't show standard section 80C deductions in June salary slips.",
          category: "Finance",
          priority: "Medium",
          slaHoursLeft: 12,
          date: "2026-06-29",
        });

        const resolvedTicket = await HelpDeskRepository.createTicket({
          employeeId: empId,
          subject: "New keycard access required for BKC wing",
          description: "Need authorization access to level 3 design wing.",
          category: "Facilities",
          priority: "Low",
          slaHoursLeft: 0,
          date: "2026-06-25",
        });
        await HelpDeskRepository.updateTicketStatus(resolvedTicket.id, "Resolved", 0);

        tickets = await HelpDeskRepository.findTickets();
      }
    }

    return tickets.map((t) => ({
      id: t.id,
      employeeName: t.employee.name,
      employeeId: t.employeeId,
      subject: t.subject,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      slaHoursLeft: t.slaHoursLeft,
      date: t.date,
    }));
  }

  static async createTicket(data: {
    employeeId: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    const slaHoursLeft = data.priority === "High" ? 4 : data.priority === "Medium" ? 12 : 24;
    const date = new Date().toISOString().substring(0, 10);

    return HelpDeskRepository.createTicket({
      ...data,
      slaHoursLeft,
      date,
    });
  }

  static async resolveTicket(id: string) {
    const ticket = await HelpDeskRepository.findTicketById(id);
    if (!ticket) {
      throw new ErrorResponse("Support ticket not found", statusCode.Not_Found);
    }
    return HelpDeskRepository.updateTicketStatus(id, "Resolved", 0);
  }
}
