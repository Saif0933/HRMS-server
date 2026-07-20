import { z } from "zod";

// Helpers for safe form inputs
const optionalString = z.preprocess((val) => (val === "" ? undefined : val), z.string().optional());
const optionalEmail = z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Invalid email address").optional());

const addressSchema = z.object({
  country: optionalString,
  state: optionalString,
  city: optionalString,
  district: optionalString,
  area: optionalString,
  street: optionalString,
  buildingName: optionalString,
  floor: optionalString,
  landmark: optionalString,
  pincode: optionalString,
  latitude: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),
  longitude: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().optional()),
});

// ─── Organization ──────────────────────────────────────────────
export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  legalName: optionalString,
  code: optionalString,
  logoUrl: optionalString,
  type: z.enum(["PRIVATE", "PUBLIC", "LLP", "PARTNERSHIP"]).optional(),
  industry: optionalString,
  businessCategory: optionalString,
  description: optionalString,
  website: optionalString,
  email: optionalEmail,
  mobileNumber: optionalString,
  landlineNumber: optionalString,
  foundedDate: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return val instanceof Date ? val : undefined;
  }, z.date().optional()),
  pan: optionalString,
  tan: optionalString,
  gst: optionalString,
  cin: optionalString,
  msme: optionalString,
  iec: optionalString,
  registrationNumber: optionalString,
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  address: addressSchema.optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// ─── Membership ────────────────────────────────────────────────
export const addMemberSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  // roleId is a reference to the global Role table (e.g. role_employee, role_manager, etc.)
  roleId: z.string().optional(),
});

export const updateMembershipSchema = z.object({
  roleId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
