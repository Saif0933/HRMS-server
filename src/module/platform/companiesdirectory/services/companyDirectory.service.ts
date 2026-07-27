import crypto from "crypto";
import { prisma } from "../../../../db/prisma.ts";
import { statusCode } from "../../../../types/types.ts";
import { ErrorResponse } from "../../../../utils/response.util.ts";
import { CompanyDirectoryRepository } from "../repo/companyDirectory.repo.ts";
import type { CompanyClientInput } from "../validators/companyDirectory.validator.ts";

/**
 * Hash password using Node.js native crypto module (SHA256)
 */
const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

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

  /**
   * Full organization onboarding flow:
   * 1. Create Organization record
   * 2. Create PlatformCompany record linked to Organization
   * 3. Create org-scoped SUPER_ADMIN Role with ALL permissions
   * 4. Create User account for the org admin (with provided email/password)
   * 5. Create Membership linking the user to the organization with the SUPER_ADMIN role
   *
   * All steps are wrapped in a single Prisma transaction for atomicity.
   */
  static async createCompany(data: CompanyClientInput) {
    const { adminName, adminEmail, adminPhone, adminPassword, ...companyData } = data;

    // If admin credentials are provided, perform full onboarding
    if (adminEmail && adminPassword) {
      // Check if admin email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      if (existingUser) {
        throw new ErrorResponse(
          `A user with email "${adminEmail}" already exists. Cannot create organization admin.`,
          statusCode.Conflict
        );
      }

      // Check if organization name is already taken
      const existingOrg = await prisma.organization.findUnique({
        where: { name: companyData.name },
      });
      if (existingOrg) {
        throw new ErrorResponse(
          `An organization named "${companyData.name}" already exists.`,
          statusCode.Conflict
        );
      }

      // Fetch ALL permissions to connect to the org's SUPER_ADMIN role
      const allPermissions = await prisma.permission.findMany();

      // Perform the full onboarding in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Create Organization
        const organization = await tx.organization.create({
          data: {
            name: companyData.name,
            email: companyData.contactEmail,
            industry: companyData.industry,
            status: "ACTIVE",
          },
        });

        // Step 2: Create org-scoped SUPER_ADMIN Role with all permissions
        const superAdminRole = await tx.role.create({
          data: {
            name: "SUPER_ADMIN",
            description: `Super Admin role for ${companyData.name} — full access to all modules`,
            isSystem: true,
            organizationId: organization.id,
            permissions: {
              connect: allPermissions.map((p) => ({ id: p.id })),
            },
          },
        });

        // Step 3: Create User account for the org admin
        const hashedPassword = hashPassword(adminPassword);
        const user = await tx.user.create({
          data: {
            name: adminName || companyData.name + " Admin",
            email: adminEmail,
            phone: adminPhone || null,
            password: hashedPassword,
            roleId: superAdminRole.id,
          },
        });

        // Step 4: Create Membership linking user to organization
        await tx.membership.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            roleId: superAdminRole.id,
            status: "ACTIVE",
          },
        });

        // Step 5: Create PlatformCompany record linked to Organization
        const onboardedDate =
          companyData.onboardedDate ||
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

        const platformCompany = await tx.platformCompany.create({
          data: {
            name: companyData.name,
            industry: companyData.industry,
            employeeCount: companyData.employeeCount,
            licenseTier: companyData.licenseTier,
            status: companyData.status,
            contactEmail: companyData.contactEmail,
            onboardedDate,
            organizationId: organization.id,
            iconName: companyData.iconName || "LightningIcon",
            iconColor: companyData.iconColor || "#4f46e5",
            iconBg: companyData.iconBg || "#ede9fe",
          },
        });

        return {
          platformCompany,
          organization,
          adminUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          superAdminRole: {
            id: superAdminRole.id,
            name: superAdminRole.name,
            permissionCount: allPermissions.length,
          },
        };
      });

      console.log(
        `[Onboarding] Organization "${companyData.name}" onboarded successfully. ` +
          `Org ID: ${result.organization.id}, Admin: ${adminEmail}, ` +
          `SUPER_ADMIN Role ID: ${result.superAdminRole.id} (${result.superAdminRole.permissionCount} permissions)`
      );

      return result;
    }

    // Fallback: create PlatformCompany only (legacy/simple mode without admin setup)
    const id = `company-${Date.now()}`;
    return await CompanyDirectoryRepository.createCompany(id, companyData);
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
