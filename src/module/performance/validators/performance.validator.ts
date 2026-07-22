import { z } from "zod";

export const createGoalSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  title: z.string({ message: "Goal title is required" }).min(1),
  weight: z.string({ message: "Weightage is required" }).min(1),
  kra: z.string({ message: "KRA focus area is required" }).min(1),
});

export const updateGoalProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
  status: z.enum(["In Progress", "Completed"]).optional(),
});

export const createFeedbackSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  reviewer: z.string({ message: "Reviewer name is required" }).min(1),
  relation: z.enum(["Manager", "Peer", "Direct Report"], {
    message: "Invalid reviewer relationship type",
  }),
  rating: z.number().min(1).max(5),
  text: z.string({ message: "Feedback content is required" }).min(1),
});

export const saveAppraisalSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  rating: z.number().int().min(1).max(5),
  cycle: z.string({ message: "Appraisal cycle is required" }).min(1),
});

export const createMonthlyRatingSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  month: z.string({ message: "Evaluation month is required" }),
  rating: z.coerce.number().min(1).max(5),
  status: z.string().optional().nullable(),
  tasks: z.string().optional().nullable(),
  quality: z.string().optional().nullable(),
  teamwork: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  givenBy: z.string().optional().nullable(),
});
