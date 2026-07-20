import { prisma } from "../../../db/prisma.ts";

export class DocumentRepository {
  static async findDocuments(filters: { employeeId?: string; category?: string }) {
    const whereClause: any = {};
    if (filters.employeeId) {
      whereClause.employeeId = filters.employeeId;
    }
    if (filters.category && filters.category !== "All") {
      whereClause.category = filters.category;
    }

    return prisma.vaultDocument.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
  }

  static async createDocument(data: {
    employeeId: string;
    name: string;
    category: string;
    uploadedOn: string;
    expiresOn?: string | null;
    status: string;
  }) {
    return prisma.vaultDocument.create({
      data,
    });
  }

  static async findDocumentById(id: string) {
    return prisma.vaultDocument.findUnique({
      where: { id },
    });
  }

  static async deleteDocument(id: string) {
    return prisma.vaultDocument.delete({
      where: { id },
    });
  }
}
