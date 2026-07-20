import { prisma } from "../../../db/prisma.ts";

export class EngagementRepository {
  // Feed Announcements
  static async findPosts(employeeId?: string) {
    const posts = await prisma.engagementPost.findMany({
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
        likes: true,
        reactions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return posts.map((post) => {
      const likedByMe = employeeId
        ? post.likes.some((l) => l.employeeId === employeeId)
        : false;

      // Group reactions by type for ease of display
      const groupedReactionsMap = new Map<string, number>();
      post.reactions.forEach((r) => {
        groupedReactionsMap.set(r.type, (groupedReactionsMap.get(r.type) || 0) + 1);
      });

      const reactions = [
        { type: "👍", count: groupedReactionsMap.get("👍") || 0 },
        { type: "❤️", count: groupedReactionsMap.get("❤️") || 0 },
      ];

      return {
        id: post.id,
        author: post.authorName,
        authorRole: post.authorRole,
        authorAvatar: post.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop",
        content: post.content,
        image: post.image,
        likes: post.likesCount,
        likedByMe,
        reactions,
        comments: post.comments.map((c) => ({
          id: c.id,
          user: c.userName,
          text: c.text,
          date: c.createdAt.toLocaleString(),
        })),
        date: post.createdAt.toLocaleString(),
      };
    });
  }

  static async createPost(data: any) {
    return prisma.engagementPost.create({
      data,
    });
  }

  static async addComment(data: { postId: string; userName: string; text: string }) {
    return prisma.engagementComment.create({
      data,
    });
  }

  static async toggleLike(postId: string, employeeId: string) {
    const existing = await prisma.engagementPostLike.findUnique({
      where: {
        postId_employeeId: { postId, employeeId },
      },
    });

    if (existing) {
      // Remove like
      await prisma.engagementPostLike.delete({
        where: { id: existing.id },
      });
      // Decrement count
      return prisma.engagementPost.update({
        where: { id: postId },
        data: {
          likesCount: { decrement: 1 },
        },
      });
    } else {
      // Add like
      await prisma.engagementPostLike.create({
        data: { postId, employeeId },
      });
      // Increment count
      return prisma.engagementPost.update({
        where: { id: postId },
        data: {
          likesCount: { increment: 1 },
        },
      });
    }
  }

  static async addReaction(postId: string, employeeId: string, type: string) {
    return prisma.engagementPostReaction.upsert({
      where: {
        postId_employeeId_type: { postId, employeeId, type },
      },
      update: {}, // No action if already reacted
      create: {
        postId,
        employeeId,
        type,
      },
    });
  }

  // Mood Gauge
  static async submitMood(employeeId: string, mood: string, weekKey: string) {
    return prisma.engagementMood.upsert({
      where: {
        employeeId_weekKey: { employeeId, weekKey },
      },
      update: { mood },
      create: {
        employeeId,
        mood,
        weekKey,
      },
    });
  }

  static async getMoodDistribution() {
    const moods = await prisma.engagementMood.findMany({
      select: { mood: true },
    });

    const total = moods.length;
    const counts: Record<string, number> = {
      THRILLED: 0,
      CONTENT: 0,
      NEUTRAL: 0,
      STRESSED: 0,
    };

    moods.forEach((m) => {
      const current = counts[m.mood];
      if (typeof current === "number") {
        counts[m.mood] = current + 1;
      }
    });

    const thrilledPct = total > 0 ? Math.round(((counts.THRILLED || 0) / total) * 100) : 52;
    const contentPct = total > 0 ? Math.round(((counts.CONTENT || 0) / total) * 100) : 32;
    const neutralPct = total > 0 ? Math.round(((counts.NEUTRAL || 0) / total) * 100) : 12;
    const stressedPct = total > 0 ? Math.round(((counts.STRESSED || 0) / total) * 100) : 4;

    return {
      thrilled: thrilledPct,
      content: contentPct,
      neutral: neutralPct,
      stressed: stressedPct,
    };
  }

  // Surveys
  static async findSurveys(employeeId?: string) {
    const surveys = await prisma.corporateSurvey.findMany({
      include: {
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return surveys.map((s) => {
      const responded = employeeId
        ? s.responses.some((r) => r.employeeId === employeeId)
        : false;

      return {
        id: s.id,
        title: s.title,
        question: s.question,
        status: s.status,
        closesAt: s.closesAt,
        responded,
      };
    });
  }

  static async submitSurveyResponse(surveyId: string, employeeId: string, rating: number) {
    return prisma.corporateSurveyResponse.upsert({
      where: {
        surveyId_employeeId: { surveyId, employeeId },
      },
      update: { rating },
      create: {
        surveyId,
        employeeId,
        rating,
      },
    });
  }

  static async createSurvey(data: { title: string; question: string; closesAt: Date }) {
    return prisma.corporateSurvey.create({
      data,
    });
  }
}
