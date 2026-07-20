import { Router } from "express";
import { protect, restrictTo } from "../../../middlewares/auth.middleware.ts";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
} from "../controllers/organization.controller.ts";
import {
  addMember,
  getMembership,
  listMembers,
  listMyOrganizations,
  removeMember,
  updateMembership,
} from "../controllers/membership.controller.ts";

const router = Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
// Public onboarding route to create an organization
router.post("/", createOrganization);

// ─── Protected Routes ────────────────────────────────────────────────────────
// All routes below require authentication
router.use(protect);

// GET /api/v1/organizations/me  → must come BEFORE /:id so "me" is not treated as an ID
router.get("/me", listMyOrganizations);

router.get("/", listOrganizations);

router
  .route("/:id")
  .get(getOrganization)
  .patch(restrictTo("SUPER_ADMIN", "HR_ADMIN"), updateOrganization)
  .delete(restrictTo("SUPER_ADMIN"), deleteOrganization);

// ─── Membership Management ──────────────────────────────────────────────────
router
  .route("/:orgId/members")
  .get(listMembers)
  .post(restrictTo("SUPER_ADMIN", "HR_ADMIN"), addMember);

router
  .route("/:orgId/members/:userId")
  .get(getMembership)
  .patch(restrictTo("SUPER_ADMIN", "HR_ADMIN"), updateMembership)
  .delete(restrictTo("SUPER_ADMIN", "HR_ADMIN"), removeMember);

export default router;
