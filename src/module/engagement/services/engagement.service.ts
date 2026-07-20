import { EngagementRepository } from "../repo/engagement.repo.ts";
import { ErrorResponse } from "../../../utils/response.util.ts";
import { statusCode } from "../../../types/types.ts";
import { prisma } from "../../../db/prisma.ts";

export class EngagementService {
  // Feed Announcements
  static async getPosts(employeeId?: string) {
    let posts = await EngagementRepository.findPosts(employeeId);

    // Auto-seed default posts if empty
    if (posts.length === 0) {
      // Find an employee to assign as seed author
      const employee = await prisma.employee.findFirst();
      const authorName = employee ? employee.name : "Aarav Sharma";
      const authorRole = employee ? (employee.designation || "HR Lead") : "HR Director";
      const authorId = employee ? employee.id : "seed_emp_id";

      const post1 = await EngagementRepository.createPost({
        authorName,
        authorRole,
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
        content: "Welcome Neha Patel as our new Senior Frontend Engineering Manager! Let's congratulate Neha on her promotion and exciting journey ahead.",
      });

      const post2 = await EngagementRepository.createPost({
        authorName: "System Administrator",
        authorRole: "Corporate Operations",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
        content: "Announcing the WFH Hybrid Policy Review 2026. Please share your feedback in the Surveys tab to help shape our future guidelines.",
      });

      // Add seed comments
      await EngagementRepository.addComment({
        postId: post1.id,
        userName: "Rishi Kumar",
        text: "Congratulations Neha! Truly well-deserved promotion.",
      });

      await EngagementRepository.addComment({
        postId: post1.id,
        userName: "Pooja Hegde",
        text: "Excited to work under your leadership, Neha!",
      });

      await EngagementRepository.addComment({
        postId: post2.id,
        userName: "Rohan Das",
        text: "Done, submitted my response. Thanks for keeping it anonymous!",
      });

      posts = await EngagementRepository.findPosts(employeeId);
    }

    return posts;
  }

  static async createPost(data: { authorName: string; authorRole: string; authorAvatar?: string | null; content: string; image?: string | null }) {
    return EngagementRepository.createPost(data);
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

  static async getMoodDistribution() {
    return EngagementRepository.getMoodDistribution();
  }

  // Surveys
  static async getSurveys(employeeId?: string) {
    let surveys = await EngagementRepository.findSurveys(employeeId);

    // Auto-seed default hybrid pulse survey if database is empty
    if (surveys.length === 0) {
      const closesAt = new Date();
      closesAt.setDate(closesAt.getDate() + 2); // Closes in 2 days

      await EngagementRepository.createSurvey({
        title: "WFH Hybrid Policy Review 2026",
        question: "How satisfied are you with our current 3-day work from office mandate?",
        closesAt,
      });

      surveys = await EngagementRepository.findSurveys(employeeId);
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
