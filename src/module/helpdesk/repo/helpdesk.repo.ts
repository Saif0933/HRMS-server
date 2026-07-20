import { prisma } from "../../../db/prisma.ts";

export class HelpDeskRepository {
  static async findTickets() {
    return prisma.helpTicket.findMany({
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

  static async createTicket(data: {
    employeeId: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    slaHoursLeft: number;
    date: string;
  }) {
    return prisma.helpTicket.create({
      data,
    });
  }

  static async findTicketById(id: string) {
    return prisma.helpTicket.findUnique({
      where: { id },
    });
  }

  static async updateTicketStatus(id: string, status: string, slaHoursLeft: number) {
    return prisma.helpTicket.update({
      where: { id },
      data: {
        status,
        slaHoursLeft,
      },
    });
  }
}
