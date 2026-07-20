import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.ts";
import {
  getPosts,
  createPost,
  addComment,
  toggleLike,
  addReaction,
  submitMood,
  getMoodDistribution,
  getSurveys,
  submitSurveyResponse,
} from "../controllers/engagement.controller.ts";

const router = Router();

// Protect all employee engagement routes
router.use(protect);

// 1. Social Feed Routes
router.get("/posts", getPosts);
router.post("/posts", createPost);
router.post("/posts/comment", addComment);
router.post("/posts/like", toggleLike);
router.post("/posts/react", addReaction);

// 2. Mood Routes
router.get("/mood", getMoodDistribution);
router.post("/mood", submitMood);

// 3. Survey Routes
router.get("/surveys", getSurveys);
router.post("/surveys/respond", submitSurveyResponse);

export default router;
