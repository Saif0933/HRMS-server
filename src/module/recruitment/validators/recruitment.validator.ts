import { z } from "zod";

export const createRequisitionSchema = z.object({
  title: z.string({ message: "Job title is required" }).min(1),
  department: z.string({ message: "Department is required" }).min(1),
});

export const advanceCandidateSchema = z.object({
  stage: z.enum(["Applied", "Interview", "Offer", "Onboarding"], {
    message: "Invalid candidate stage",
  }),
});

export const updateCandidateChecklistSchema = z.object({
  bgvChecked: z.boolean().optional(),
  contractSigned: z.boolean().optional(),
  hardwareAssigned: z.boolean().optional(),
});
