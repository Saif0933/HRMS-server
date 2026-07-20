import { AssetRepository } from "../repo/asset.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class AssetService {
  static async getAssets() {
    let assets = await AssetRepository.findAssets();

    if (assets.length === 0) {
      const employee = await prisma.employee.findFirst();
      const empId = employee?.id || null;

      await AssetRepository.createAsset({
        name: "MacBook Pro 16\" M3 Max",
        category: "Hardware",
        serial: "C02F5X2LMD6M",
        employeeId: empId,
        status: empId ? "Assigned" : "In Stock",
      });

      await AssetRepository.createAsset({
        name: "iPhone 15 Pro Max 256GB",
        category: "Mobile",
        serial: "D94G5K12MS9F",
        employeeId: empId,
        status: empId ? "Assigned" : "In Stock",
      });

      await AssetRepository.createAsset({
        name: "Dell UltraSharp 27\" Monitor",
        category: "Hardware",
        serial: "DELL27192837",
        employeeId: null,
        status: "In Stock",
      });

      await AssetRepository.createAsset({
        name: "Access Keycard G-12",
        category: "Keycard",
        serial: "KC129381",
        employeeId: empId,
        status: empId ? "Assigned" : "In Stock",
      });

      assets = await AssetRepository.findAssets();
    }

    return assets.map((ast) => ({
      id: ast.id,
      name: ast.name,
      category: ast.category,
      serial: ast.serial,
      assignedTo: ast.employee?.name || null,
      employeeId: ast.employeeId,
      status: ast.status,
    }));
  }

  static async createAsset(data: {
    name: string;
    category: string;
    serial: string;
    employeeId?: string | null;
  }) {
    const status = data.employeeId ? "Assigned" : "In Stock";
    return AssetRepository.createAsset({
      ...data,
      status,
    });
  }

  static async assignAsset(id: string, employeeId: string | null) {
    const asset = await AssetRepository.findAssetById(id);
    if (!asset) {
      throw new ErrorResponse("Asset not found", statusCode.Not_Found);
    }

    const status = employeeId ? "Assigned" : "In Stock";
    return AssetRepository.updateAssetAssignment(id, employeeId, status);
  }
}
