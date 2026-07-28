import { DocumentRepository } from "../repo/document.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class DocumentService {
  static async getDocuments(filters: { employeeId?: string; category?: string; organizationId?: string }) {
    let docs = await DocumentRepository.findDocuments(filters);

    if (docs.length === 0 && filters.employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: filters.employeeId },
      });
      if (employee) {
        const orgId = filters.organizationId || employee.organizationId || null;

        await DocumentRepository.createDocument({
          employeeId: employee.id,
          organizationId: orgId,
          name: "Aadhaar Card Copy.pdf",
          category: "Identity",
          uploadedOn: "2026-01-15",
          expiresOn: null,
          status: "Active",
        });
        await DocumentRepository.createDocument({
          employeeId: employee.id,
          organizationId: orgId,
          name: "PAN Card Copy.pdf",
          category: "Identity",
          uploadedOn: "2026-01-15",
          expiresOn: null,
          status: "Active",
        });
        await DocumentRepository.createDocument({
          employeeId: employee.id,
          organizationId: orgId,
          name: "Passport Scan.pdf",
          category: "Identity",
          uploadedOn: "2026-01-16",
          expiresOn: "2026-07-28",
          status: "Expiring Soon",
        });
        await DocumentRepository.createDocument({
          employeeId: employee.id,
          organizationId: orgId,
          name: "Offer Letter Signed.pdf",
          category: "Contract",
          uploadedOn: "2026-01-10",
          expiresOn: null,
          status: "Active",
        });

        docs = await DocumentRepository.findDocuments(filters);
      }
    }

    return docs.map((d) => ({
      id: d.id,
      employeeId: d.employeeId,
      organizationId: d.organizationId,
      name: d.name,
      category: d.category,
      uploadedOn: d.uploadedOn,
      expiresOn: d.expiresOn,
      status: d.status,
    }));
  }

  static async uploadDocument(
    data: {
      employeeId: string;
      name: string;
      category: string;
      expiresOn?: string | null;
    },
    organizationId?: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }

    const docOrgId = organizationId || employee.organizationId || null;

    let status = "Active";
    if (data.expiresOn) {
      const expDate = new Date(data.expiresOn);
      const diffTime = expDate.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        status = "Expired";
      } else if (diffDays < 30) {
        status = "Expiring Soon";
      }
    }

    return DocumentRepository.createDocument({
      ...data,
      organizationId: docOrgId,
      uploadedOn: new Date().toISOString().substring(0, 10),
      status,
    });
  }

  static async deleteDocument(id: string, organizationId?: string) {
    const doc = await DocumentRepository.findDocumentById(id);
    if (!doc) {
      throw new ErrorResponse("Document not found", statusCode.Not_Found);
    }

    if (organizationId && doc.organizationId && doc.organizationId !== organizationId) {
      throw new ErrorResponse("You do not have permission to delete documents belonging to another organization", statusCode.Forbidden);
    }

    return DocumentRepository.deleteDocument(id);
  }
}
