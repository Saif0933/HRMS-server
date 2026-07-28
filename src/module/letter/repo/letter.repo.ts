import { prisma } from "../../../db/prisma.ts";

export class LetterRepository {
  static async findIssuedLetters(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return prisma.issuedLetter.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async createIssuedLetter(data: {
    templateType: string;
    recipientName: string;
    recipientRole: string;
    joiningDate?: string | null;
    salaryCtc?: string | null;
    warningReason?: string | null;
    organizationId?: string | null;
  }) {
    return prisma.issuedLetter.create({
      data,
    });
  }
}
