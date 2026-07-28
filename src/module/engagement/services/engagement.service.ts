import { EngagementRepository } from "../repo/engagement.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class EngagementService {
  // Feed Announcements
  static async getPosts(employeeId?: string, organizationId?: string) {
    let posts = await EngagementRepository.findPosts(employeeId, organizationId);

    // Auto-seed default posts if empty for this organization
    if (posts.length === 0 && organizationId) {
      const employee = await prisma.employee.findFirst({
        where: { organizationId }
      });
      const authorName = employee ? employee.name : "HR Department";
      const authorRole = employee ? (employee.designation || "HR Lead") : "HR Manager";

      const post1 = await EngagementRepository.createPost({
        authorName,
        authorRole,
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
        content: "Welcome to our company portal! Let's collaborate and achieve great milestones together.",
        organizationId,
      });

      const post2 = await EngagementRepository.createPost({
        authorName: "System Administrator",
        authorRole: "Corporate Operations",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
        content: "Announcing the WFH Hybrid Policy Review 2026. Please share your feedback in the Surveys tab.",
        organizationId,
      });

      await EngagementRepository.addComment({
        postId: post1.id,
        userName: "Team Member",
        text: "Excited to be part of the team!",
      });

      posts = await EngagementRepository.findPosts(employeeId, organizationId);
    }

    return posts;
  }

  static async createPost(
    data: { authorName: string; authorRole: string; authorAvatar?: string | null; content: string; image?: string | null },
    organizationId?: string
  ) {
    return EngagementRepository.createPost({
      ...data,
      organizationId: organizationId || null,
    });
  }

  static async addComment(data: { postId: string; userName: string; text: string }) {
    const post = await prisma.engagementPost.findUnique({ where: { id: data.postId } });
    if (!post) {
      throw new ErrorResponse("Post not found", statusCode.Not_Found);
    }
    return EngagementRepository.addComment(data);
  }

  static async toggleLike(postId: string, employeeId: string) {
    const post = await prisma.engagementPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new ErrorResponse("Post not found", statusCode.Not_Found);
    }
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EngagementRepository.toggleLike(postId, employeeId);
  }

  static async addReaction(postId: string, employeeId: string, type: string) {
    const post = await prisma.engagementPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new ErrorResponse("Post not found", statusCode.Not_Found);
    }
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EngagementRepository.addReaction(postId, employeeId, type);
  }

  // Mood
  static async submitMood(employeeId: string, mood: string, weekKey: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EngagementRepository.submitMood(employeeId, mood, weekKey);
  }

  static async getMoodDistribution(organizationId?: string) {
    return EngagementRepository.getMoodDistribution(organizationId);
  }

  // Surveys
  static async getSurveys(employeeId?: string, organizationId?: string) {
    let surveys = await EngagementRepository.findSurveys(employeeId, organizationId);

    // Auto-seed default hybrid pulse survey if database is empty for this organization
    if (surveys.length === 0 && organizationId) {
      const closesAt = new Date();
      closesAt.setDate(closesAt.getDate() + 7); // Closes in 7 days

      await EngagementRepository.createSurvey({
        title: "WFH Hybrid Policy Review 2026",
        question: "How satisfied are you with our current work environment?",
        closesAt,
        organizationId,
      });

      surveys = await EngagementRepository.findSurveys(employeeId, organizationId);
    }

    return surveys;
  }

  static async submitSurveyResponse(surveyId: string, employeeId: string, rating: number) {
    const survey = await prisma.corporateSurvey.findUnique({ where: { id: surveyId } });
    if (!survey) {
      throw new ErrorResponse("Survey not found", statusCode.Not_Found);
    }
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new ErrorResponse("Employee not found", statusCode.Not_Found);
    }
    return EngagementRepository.submitSurveyResponse(surveyId, employeeId, rating);
  }
}
