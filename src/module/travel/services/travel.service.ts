import { TravelRepository } from "../repo/travel.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class TravelService {
  static async getClaims(filters: { employeeId?: string; status?: string; organizationId?: string }) {
    let claims = await TravelRepository.findClaims(filters);

    // Auto-seed default claims if empty per organization
    if (claims.length === 0 && filters.organizationId) {
      const employee = await prisma.employee.findFirst({
        where: { organizationId: filters.organizationId },
      }) || await prisma.employee.findFirst();

      if (employee) {
        const claimOrgId = filters.organizationId || employee.organizationId || null;

        await TravelRepository.createClaim({
          employeeId: employee.id,
          type: "Travel",
          amount: 1500,
          date: "2026-07-01",
          reason: "Uber Cab to Client office BKC",
          receiptUrl: "uber_receipt_bkc.pdf",
          organizationId: claimOrgId,
        });

        await TravelRepository.createClaim({
          employeeId: employee.id,
          type: "Food",
          amount: 850,
          date: "2026-07-02",
          reason: "Team client lunch hosting",
          receiptUrl: "lunch_receipt.jpg",
          organizationId: claimOrgId,
        });

        await TravelRepository.createClaim({
          employeeId: employee.id,
          type: "Accommodation",
          amount: 4200,
          date: "2026-06-25",
          reason: "Hotel stay Pune client visit",
          receiptUrl: "pune_hotel.pdf",
          organizationId: claimOrgId,
        });

        claims = await TravelRepository.findClaims(filters);
      }
    }

    return claims.map((c) => ({
      id: c.id,
      employeeId: c.employeeId,
      employeeName: c.employee.name,
      type: c.type,
      amount: c.amount,
      date: c.date,
      reason: c.reason,
      status: c.status,
      receiptUrl: c.receiptUrl || undefined,
    }));
  }

  static async applyClaim(
    data: {
      employeeId: string;
      type: string;
      amount: number;
      date: string;
      reason: string;
      receiptUrl?: string | null;
    },
    organizationId?: string
  ) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    const claimOrgId = organizationId || employee.organizationId || null;

    return TravelRepository.createClaim({
      ...data,
      organizationId: claimOrgId,
    });
  }

  static async updateClaimStatus(id: string, status: string) {
    const claim = await TravelRepository.findClaimById(id);
    if (!claim) {
      throw new ErrorResponse("Expense claim not found", statusCode.Not_Found);
    }
    return TravelRepository.updateClaimStatus(id, status);
  }
}
