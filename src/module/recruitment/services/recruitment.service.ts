import { RecruitmentRepository } from "../repo/recruitment.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class RecruitmentService {
  static async getRequisitions(organizationId?: string) {
    let jobs = await RecruitmentRepository.findRequisitions(organizationId);

    if (jobs.length === 0 && organizationId) {
      await prisma.jobRequisition.createMany({
        data: [
          { title: "Senior React Developer", department: "Engineering", status: "Open", applicantsCount: 18, organizationId },
          { title: "Lead UX UI Designer", department: "Design", status: "Open", applicantsCount: 9, organizationId },
          { title: "HR Generalist Manager", department: "Human Resources", status: "Filled", applicantsCount: 24, organizationId },
        ],
      });
      jobs = await RecruitmentRepository.findRequisitions(organizationId);
    }

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      status: job.status,
      applicants: job.applicantsCount,
    }));
  }

  static async createRequisition(data: { title: string; department: string }, organizationId?: string) {
    return RecruitmentRepository.createRequisition({
      ...data,
      organizationId: organizationId || null,
    });
  }

  static async getCandidates(organizationId?: string) {
    let candidates = await RecruitmentRepository.findCandidates(organizationId);

    if (candidates.length === 0 && organizationId) {
      await prisma.candidate.createMany({
        data: [
          { name: "Rishi Kumar", role: "Senior React Developer", experience: "5 Years", email: "rishi@gmail.com", stage: "Applied", organizationId },
          { name: "Pooja Hegde", role: "Lead UX UI Designer", experience: "8 Years", email: "pooja@design.io", stage: "Interview", organizationId },
          { name: "Amit Shah", role: "Senior React Developer", experience: "4 Years", email: "amit.shah@dev.net", stage: "Offer", organizationId },
          { name: "Karan Johar", role: "HR Generalist Manager", experience: "6 Years", email: "karan@hrms.co", stage: "Onboarding", organizationId },
        ],
      });
      candidates = await RecruitmentRepository.findCandidates(organizationId);
    }

    return candidates.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      experience: c.experience,
      email: c.email,
      stage: c.stage,
      bgvChecked: c.bgvChecked,
      contractSigned: c.contractSigned,
      hardwareAssigned: c.hardwareAssigned,
    }));
  }

  static async advanceCandidate(id: string, stage: string) {
    const candidate = await RecruitmentRepository.findCandidateById(id);
    if (!candidate) {
      throw new ErrorResponse("Candidate not found", statusCode.Not_Found);
    }
    return RecruitmentRepository.updateCandidateStage(id, stage);
  }

  static async updateCandidateChecklist(
    id: string,
    data: { bgvChecked?: boolean; contractSigned?: boolean; hardwareAssigned?: boolean }
  ) {
    const candidate = await RecruitmentRepository.findCandidateById(id);
    if (!candidate) {
      throw new ErrorResponse("Candidate not found", statusCode.Not_Found);
    }
    return RecruitmentRepository.updateCandidateChecklist(id, data);
  }

  static async rejectCandidate(id: string) {
    const candidate = await RecruitmentRepository.findCandidateById(id);
    if (!candidate) {
      throw new ErrorResponse("Candidate not found", statusCode.Not_Found);
    }
    return RecruitmentRepository.deleteCandidate(id);
  }
}
