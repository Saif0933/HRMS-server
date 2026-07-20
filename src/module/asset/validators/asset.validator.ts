import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string({ message: "Asset name is required" }).min(1),
  category: z.enum(["Hardware", "Mobile", "Keycard", "Other"], {
    message: "Category must be Hardware, Mobile, Keycard, or Other",
  }),
  serial: z.string({ message: "Serial number is required" }).min(1),
  employeeId: z.string().optional().nullable(),
});

export const assignAssetSchema = z.object({
  employeeId: z.string().optional().nullable(),
});
