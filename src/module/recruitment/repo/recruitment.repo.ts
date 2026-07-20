import { prisma } from "../../../db/prisma.ts";

export class RecruitmentRepository {
  static async findRequisitions() {
    return prisma.jobRequisition.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async createRequisition(data: { title: string; department: string }) {
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

  static async findCandidates() {
    return prisma.candidate.findMany({
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
