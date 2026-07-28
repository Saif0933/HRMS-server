import { prisma } from "../../../db/prisma.ts";

export class AssetRepository {
  static async findAssets(organizationId?: string) {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return prisma.asset.findMany({
      where,
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

  static async createAsset(data: {
    name: string;
    category: string;
    serial: string;
    employeeId?: string | null;
    organizationId?: string | null;
    status: string;
  }) {
    return prisma.asset.create({
      data,
    });
  }

  static async findAssetById(id: string) {
    return prisma.asset.findUnique({
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

  static async updateAssetAssignment(id: string, employeeId: string | null, status: string) {
    return prisma.asset.update({
      where: { id },
      data: {
        employeeId,
        status,
      },
    });
  }
}
