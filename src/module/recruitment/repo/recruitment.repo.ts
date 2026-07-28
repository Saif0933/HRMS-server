import { prisma } from "../../../db/prisma.ts";

export class RecruitmentRepository {
  static async findRequisitions(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;

    return prisma.jobRequisition.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async createRequisition(data: { title: string; department: string; organizationId?: string | null }) {
    return prisma.jobRequisition.create({
      data,
    });
  }

  static async incrementRequisitionApplicants(id: string) {
    return prisma.jobRequisition.update({
      where: { id },
      data: {
        applicantsCount: {
          increment: 1,
        },
      },
    });
  }

  static async findCandidates(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;

    return prisma.candidate.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
  }

  static async findCandidateById(id: string) {
    return prisma.candidate.findUnique({
      where: { id },
    });
  }

  static async createCandidate(data: {
    name: string;
    role: string;
    experience: string;
    email: string;
    stage?: string;
    organizationId?: string | null;
  }) {
    return prisma.candidate.create({
      data,
    });
  }

  static async updateCandidateStage(id: string, stage: string) {
    return prisma.candidate.update({
      where: { id },
      data: { stage },
    });
  }

  static async updateCandidateChecklist(
    id: string,
    data: { bgvChecked?: boolean; contractSigned?: boolean; hardwareAssigned?: boolean }
  ) {
    return prisma.candidate.update({
      where: { id },
      data,
    });
  }

  static async deleteCandidate(id: string) {
    return prisma.candidate.delete({
      where: { id },
    });
  }
}
