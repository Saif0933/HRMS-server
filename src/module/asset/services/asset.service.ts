import { AssetRepository } from "../repo/asset.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class AssetService {
  static async getAssets(organizationId?: string) {
    let assets = await AssetRepository.findAssets(organizationId);

    if (assets.length === 0 && organizationId) {
      const employee = await prisma.employee.findFirst({
        where: { organizationId }
      });
      const empId = employee?.id || null;
      const orgPrefix = organizationId.slice(-4).toUpperCase();

      await AssetRepository.createAsset({
        name: "MacBook Pro 16\" M3 Max",
        category: "Hardware",
        serial: `C02F5X2LMD-${orgPrefix}`,
        employeeId: empId,
        organizationId,
        status: empId ? "Assigned" : "In Stock",
      });

      await AssetRepository.createAsset({
        name: "iPhone 15 Pro Max 256GB",
        category: "Mobile",
        serial: `D94G5K12MS-${orgPrefix}`,
        employeeId: empId,
        organizationId,
        status: empId ? "Assigned" : "In Stock",
      });

      await AssetRepository.createAsset({
        name: "Dell UltraSharp 27\" Monitor",
        category: "Hardware",
        serial: `DELL27192837-${orgPrefix}`,
        employeeId: null,
        organizationId,
        status: "In Stock",
      });

      await AssetRepository.createAsset({
        name: "Access Keycard G-12",
        category: "Keycard",
        serial: `KC129381-${orgPrefix}`,
        employeeId: empId,
        organizationId,
        status: empId ? "Assigned" : "In Stock",
      });

      assets = await AssetRepository.findAssets(organizationId);
    }

    return assets.map((ast) => ({
      id: ast.id,
      name: ast.name,
      category: ast.category,
      serial: ast.serial,
      assignedTo: ast.employee?.name || null,
      employeeId: ast.employeeId,
      organizationId: ast.organizationId,
      status: ast.status,
    }));
  }

  static async createAsset(
    data: {
      name: string;
      category: string;
      serial: string;
      employeeId?: string | null;
    },
    organizationId?: string
  ) {
    const status = data.employeeId ? "Assigned" : "In Stock";
    return AssetRepository.createAsset({
      ...data,
      organizationId: organizationId || null,
      status,
    });
  }

  static async assignAsset(id: string, employeeId: string | null, organizationId?: string) {
    const asset = await AssetRepository.findAssetById(id);
    if (!asset) {
      throw new ErrorResponse("Asset not found", statusCode.Not_Found);
    }

    if (organizationId && asset.organizationId && asset.organizationId !== organizationId) {
      throw new ErrorResponse("You do not have permission to modify assets belonging to another organization", statusCode.Forbidden);
    }

    const status = employeeId ? "Assigned" : "In Stock";
    return AssetRepository.updateAssetAssignment(id, employeeId, status);
  }
}
