import { prisma } from "../../../db/prisma.ts";

export class TravelRepository {
  static async findClaims(filters: { employeeId?: string; status?: string }) {
    const whereClause: any = {};
    if (filters.employeeId) {
      whereClause.employeeId = filters.employeeId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }

    return prisma.travelClaim.findMany({
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

  static async createClaim(data: {
    employeeId: string;
    type: string;
    amount: number;
    date: string;
    reason: string;
    receiptUrl?: string | null;
  }) {
    return prisma.travelClaim.create({
      data,
    });
  }

  static async findClaimById(id: string) {
    return prisma.travelClaim.findUnique({
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

  static async updateClaimStatus(id: string, status: string) {
    return prisma.travelClaim.update({
      where: { id },
      data: { status },
    });
  }
}
