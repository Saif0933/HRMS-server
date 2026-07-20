import { prisma } from "../../../db/prisma.ts";

export class PerformanceRepository {
  // Goals & KRAs
  static async findGoals(employeeId?: string) {
    return prisma.performanceGoal.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findGoalById(id: string) {
    return prisma.performanceGoal.findUnique({
      where: { id },
    });
  }

  static async createGoal(data: any) {
    return prisma.performanceGoal.create({
      data,
    });
  }

  static async updateGoal(id: string, data: any) {
    return prisma.performanceGoal.update({
      where: { id },
      data,
    });
  }

  // 360 Feedback
  static async findFeedbacks(employeeId?: string) {
    return prisma.performanceFeedback.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: true },
      orderBy: { date: "desc" },
    });
  }

  static async createFeedback(data: any) {
    return prisma.performanceFeedback.create({
      data,
    });
  }

  // Appraisals & Bell Curve
  static async findAppraisals(cycle: string) {
    return prisma.performanceAppraisal.findMany({
      where: { cycle },
      include: { employee: true },
    });
  }

  static async upsertAppraisal(employeeId: string, cycle: string, rating: number) {
    return prisma.performanceAppraisal.upsert({
      where: {
        employeeId_cycle: { employeeId, cycle },
      },
      update: { rating },
      create: {
        employeeId,
        cycle,
        rating,
        status: "COMPLETED",
      },
    });
  }

  static async getRatingFrequencies(cycle: string) {
    const appraisals = await prisma.performanceAppraisal.findMany({
      where: { cycle },
      select: { rating: true },
    });

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    appraisals.forEach((app) => {
      const current = counts[app.rating];
      if (typeof current === "number") {
        counts[app.rating] = current + 1;
      }
    });

    return [
      { rating: "Unsatisfactory (1)", Employees: counts[1] || 0 },
      { rating: "Needs Improvement (2)", Employees: counts[2] || 0 },
      { rating: "Meets Expectations (3)", Employees: counts[3] || 0 },
      { rating: "Exceeds Expectations (4)", Employees: counts[4] || 0 },
      { rating: "Outstanding (5)", Employees: counts[5] || 0 },
    ];
  }
}
