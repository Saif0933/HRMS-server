import { statusCode } from "../../../../types/types.ts";
import { ErrorResponse } from "../../../../utils/response.util.ts";
import { CompanyDirectoryRepository } from "../repo/companyDirectory.repo.ts";
import type { CompanyClientInput } from "../validators/companyDirectory.validator.ts";

export class CompanyDirectoryService {
  static async getCompanies(search?: string, status?: string) {
    return await CompanyDirectoryRepository.findAllCompanies(search, status);
  }

  static async getCompanyById(id: string) {
    const company = await CompanyDirectoryRepository.findCompanyById(id);
    if (!company) {
      throw new ErrorResponse("Company not found", statusCode.Not_Found);
    }
    return company;
  }

  static async createCompany(data: CompanyClientInput) {
    const id = `company-${Date.now()}`;
    return await CompanyDirectoryRepository.createCompany(id, data);
  }

  static async updateCompany(id: string, data: Partial<CompanyClientInput>) {
    const updated = await CompanyDirectoryRepository.updateCompany(id, data);
    if (!updated) {
      throw new ErrorResponse("Company not found", statusCode.Not_Found);
    }
    return updated;
  }

  static async deleteCompany(id: string) {
    const company = await CompanyDirectoryRepository.findCompanyById(id);
    if (!company) {
      throw new ErrorResponse("Company not found", statusCode.Not_Found);
    }
    await CompanyDirectoryRepository.deleteCompany(id);
    return { success: true, message: "Company deleted successfully" };
  }
}
