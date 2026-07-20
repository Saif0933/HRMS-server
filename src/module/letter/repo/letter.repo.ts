import { prisma } from "../../../db/prisma.ts";

export class LetterRepository {
  static async findIssuedLetters() {
    return prisma.issuedLetter.findMany({
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
  }) {
    return prisma.issuedLetter.create({
      data,
    });
  }
}
