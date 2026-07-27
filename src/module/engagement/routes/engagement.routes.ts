import { Router } from "express";
import { protect, hasPermission } from "../../../middlewares/auth.middleware.ts";
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
router.get("/posts", hasPermission("VIEW_SOCIAL_FEED", "VIEW_ENGAGEMENT"), getPosts);
router.post("/posts", hasPermission("CREATE_SOCIAL_POST", "CREATE_ENGAGEMENT"), createPost);
router.post("/posts/comment", hasPermission("CREATE_SOCIAL_POST", "CREATE_ENGAGEMENT"), addComment);
router.post("/posts/like", hasPermission("CREATE_SOCIAL_POST", "CREATE_ENGAGEMENT"), toggleLike);
router.post("/posts/react", hasPermission("CREATE_SOCIAL_POST", "CREATE_ENGAGEMENT"), addReaction);

// 2. Mood Routes
router.get("/mood", hasPermission("VIEW_MOOD_ANALYSIS", "VIEW_ENGAGEMENT"), getMoodDistribution);
router.post("/mood", hasPermission("CREATE_SOCIAL_POST", "CREATE_ENGAGEMENT"), submitMood);

// 3. Survey Routes
router.get("/surveys", hasPermission("VIEW_SURVEYS", "VIEW_ENGAGEMENT"), getSurveys);
router.post("/surveys/respond", hasPermission("VIEW_SURVEYS", "CREATE_SURVEYS", "CREATE_ENGAGEMENT"), submitSurveyResponse);

export default router;
