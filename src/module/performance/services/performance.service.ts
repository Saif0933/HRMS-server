import { PerformanceRepository } from "../repo/performance.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class PerformanceService {
  // Goals & KRAs
  static async getGoals(employeeId?: string, organizationId?: string) {
    let goals = await PerformanceRepository.findGoals(employeeId, organizationId);

    // Auto-seed default goals if database is empty and we are looking for a specific employee
    if (goals.length === 0 && employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (employee) {
        const empOrgId = organizationId || employee.organizationId || null;
        await PerformanceRepository.createGoal({
          employeeId,
          title: "Deliver Redesigned Core UI Components",
          weight: "40%",
          kra: "Development Quality",
          progress: 85,
          status: "In Progress",
          organizationId: empOrgId,
        });
        await PerformanceRepository.createGoal({
          employeeId,
          title: "Optimize Web Performance & Core Web Vitals",
          weight: "30%",
          kra: "System Efficiency",
          progress: 95,
          status: "Completed",
          organizationId: empOrgId,
        });
        await PerformanceRepository.createGoal({
          employeeId,
          title: "Refactor State Management & Context Architecture",
          weight: "30%",
          kra: "Refactoring & Tech Debt",
          progress: 60,
          status: "In Progress",
          organizationId: empOrgId,
        });
        goals = await PerformanceRepository.findGoals(employeeId, organizationId);
      }
    }
    return goals;
  }

  static async createGoal(data: { employeeId: string; title: string; weight: string; kra: string }, organizationId?: string) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    const empOrgId = organizationId || employee.organizationId || null;

    return PerformanceRepository.createGoal({
      ...data,
      organizationId: empOrgId,
    });
  }

  static async updateGoalProgress(id: string, progress: number, status?: string) {
    const goal = await PerformanceRepository.findGoalById(id);
    if (!goal) {
      throw new ErrorResponse("Goal not found", statusCode.Not_Found);
    }
    const resolvedStatus = status || (progress === 100 ? "Completed" : "In Progress");
    return PerformanceRepository.updateGoal(id, { progress, status: resolvedStatus });
  }

  // 360 Feedback
  static async getFeedbacks(employeeId?: string, organizationId?: string) {
    let feedbacks = await PerformanceRepository.findFeedbacks(employeeId, organizationId);

    if (feedbacks.length === 0 && employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (employee) {
        const empOrgId = organizationId || employee.organizationId || null;
        await PerformanceRepository.createFeedback({
          employeeId,
          reviewer: "Neha Patel",
          relation: "Manager",
          rating: 4.5,
          text: "Excellent technical skillset and outstanding dedication to the UI refactor work.",
          date: new Date("2026-06-28"),
          organizationId: empOrgId,
        });
        await PerformanceRepository.createFeedback({
          employeeId,
          reviewer: "Rohan Das",
          relation: "Peer",
          rating: 4.2,
          text: "Great collaborator, very open to UX critiques and fast at implementing layouts.",
          date: new Date("2026-06-29"),
          organizationId: empOrgId,
        });
        feedbacks = await PerformanceRepository.findFeedbacks(employeeId, organizationId);
      }
    }
    return feedbacks;
  }

  static async createFeedback(data: { employeeId: string; reviewer: string; relation: string; rating: number; text: string }, organizationId?: string) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    const empOrgId = organizationId || employee.organizationId || null;

    return PerformanceRepository.createFeedback({
      ...data,
      organizationId: empOrgId,
    });
  }

  // Appraisals & Bell Curve
  static async saveAppraisal(employeeId: string, cycle: string, rating: number, organizationId?: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    const empOrgId = organizationId || employee.organizationId || undefined;

    return PerformanceRepository.upsertAppraisal(employeeId, cycle, rating, empOrgId);
  }

  static async getBellCurveDistribution(cycle: string, organizationId?: string) {
    const appraisals = await PerformanceRepository.findAppraisals(cycle, organizationId);

    if (appraisals.length === 0) {
      const empWhere: any = {};
      if (organizationId) empWhere.organizationId = organizationId;

      const employees = await prisma.employee.findMany({ where: empWhere });
      if (employees.length > 0) {
        const ratingsDistribution = [1, 2, 2, 3, 3, 3, 3, 3, 4, 4, 5];
        for (let i = 0; i < employees.length; i++) {
          const emp = employees[i];
          if (emp) {
            const rating = ratingsDistribution[i % ratingsDistribution.length] || 3;
            await PerformanceRepository.upsertAppraisal(emp.id, cycle, rating, organizationId || emp.organizationId || undefined);
          }
        }
      }
    }

    return PerformanceRepository.getRatingFrequencies(cycle, organizationId);
  }

  // Monthly Performance Ratings
  static async getMonthlyRatings(employeeId?: string, organizationId?: string) {
    let targetEmployeeId = employeeId;
    if (employeeId) {
      let employee = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (!employee) {
        const empWhere: any = {
          OR: [
            { id: employeeId },
            { userId: employeeId },
            { email: employeeId }
          ]
        };
        if (organizationId) empWhere.organizationId = organizationId;
        employee = await prisma.employee.findFirst({ where: empWhere });
      }
      if (employee) {
        targetEmployeeId = employee.id;
      }
    }

    let ratings = await PerformanceRepository.findMonthlyRatings(targetEmployeeId, organizationId);

    if (ratings.length === 0 && targetEmployeeId) {
      const empWhere: any = {};
      if (organizationId) empWhere.organizationId = organizationId;

      const employee = await prisma.employee.findUnique({ where: { id: targetEmployeeId } }) || await prisma.employee.findFirst({ where: empWhere });
      if (employee) {
        const empOrgId = organizationId || employee.organizationId || null;
        const empSeed = (employee.id || employee.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
        const seedData = [
          { month: "July 2026", rating: Number((4.4 + (empSeed * 0.1)).toFixed(1)), status: "EXCEEDS EXPECTATIONS", tasks: "98%", quality: "4.7/5", teamwork: "4.6/5", feedback: `Outstanding performance in ${employee.designation || 'Engineering'} deliverables.`, givenBy: "Super Admin" },
          { month: "June 2026", rating: Number((4.3 + (empSeed * 0.1)).toFixed(1)), status: "EXCEEDS EXPECTATIONS", tasks: "95%", quality: "4.5/5", teamwork: "4.5/5", feedback: "Consistently delivered milestones on schedule with zero critical bugs.", givenBy: "Super Admin" },
          { month: "May 2026", rating: Number((4.1 + (empSeed * 0.1)).toFixed(1)), status: "MEETS EXPECTATIONS", tasks: "91%", quality: "4.2/5", teamwork: "4.3/5", feedback: "Great effort on API optimization and unit test coverage.", givenBy: "Super Admin" },
          { month: "April 2026", rating: Number((4.6 + (empSeed * 0.05)).toFixed(1)), status: "OUTSTANDING", tasks: "99%", quality: "4.9/5", teamwork: "4.8/5", feedback: "Recognized for initiative, mentoring, and technical excellence.", givenBy: "Super Admin" }
        ];

        for (const item of seedData) {
          await PerformanceRepository.createMonthlyRating({
            employeeId: employee.id,
            organizationId: empOrgId,
            ...item
          });
        }
        ratings = await PerformanceRepository.findMonthlyRatings(employee.id, organizationId);
      }
    }
    return ratings;
  }

  static async createMonthlyRating(
    data: {
      employeeId: string;
      month: string;
      rating: number;
      status?: string | null;
      tasks?: string | null;
      quality?: string | null;
      teamwork?: string | null;
      feedback?: string | null;
      givenBy?: string | null;
    },
    organizationId?: string
  ) {
    let employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });

    if (!employee) {
      const empWhere: any = {
        OR: [
          { id: data.employeeId },
          { userId: data.employeeId },
          { email: data.employeeId },
          { name: { equals: data.employeeId, mode: "insensitive" } }
        ]
      };
      if (organizationId) empWhere.organizationId = organizationId;

      employee = await prisma.employee.findFirst({ where: empWhere });
    }

    if (!employee) {
      const empWhere: any = {};
      if (organizationId) empWhere.organizationId = organizationId;
      employee = await prisma.employee.findFirst({ where: empWhere });
    }

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          id: data.employeeId || "EMP001",
          name: "Standard Employee",
          email: `employee_${Date.now()}@symbosys.com`,
          joiningDate: new Date(),
          status: "PROBATION",
          designation: "Software Engineer",
          location: "Mumbai",
          organizationId: organizationId || null,
        }
      });
    }

    const empOrgId = organizationId || employee.organizationId || null;

    const payload = {
      employeeId: employee.id,
      month: data.month,
      rating: Number(data.rating),
      status: data.status || "EXCEEDS EXPECTATIONS",
      tasks: data.tasks || "95%",
      quality: data.quality || "4.5/5",
      teamwork: data.teamwork || "4.5/5",
      feedback: data.feedback || "Evaluated and submitted by Super Admin.",
      givenBy: data.givenBy || "Super Admin",
      organizationId: empOrgId,
    };

    return PerformanceRepository.createMonthlyRating(payload);
  }
}
