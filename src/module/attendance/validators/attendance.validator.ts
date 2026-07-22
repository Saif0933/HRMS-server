import { z } from "zod";

export const createPunchSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  type: z.enum(["In", "Out"], { message: "Type must be In or Out" }),
  method: z.string({ message: "Punch verification method is required" }),
  lat: z.number({ message: "Latitude must be a number" }),
  lng: z.number({ message: "Longitude must be a number" }),
  selfiePreview: z.string().optional().nullable(),
});

export const applyRegularizationSchema = z.object({
  employeeId: z.string({ message: "Employee ID is required" }),
  date: z.string({ message: "Date is required" }),
  timeIn: z.string({ message: "Expected Check-In time is required" }),
  timeOut: z.string({ message: "Expected Check-Out time is required" }),
  reason: z.string({ message: "Missed punch reason is required" }).min(1),
});

export const approveRejectRegularizationSchema = z.object({
  status: z.enum(["Approved", "Rejected"], { message: "Status must be Approved or Rejected" }),
});

export const createGeofenceSchema = z.object({
  name: z.string({ message: "Geofence name is required" }).min(1),
  lat: z.number({ message: "Latitude is required" }),
  lng: z.number({ message: "Longitude is required" }),
  radius: z.number({ message: "Radius in meters is required" }).min(1),
  isActive: z.boolean().optional(),
});

export const saveRosterSchema = z.object({
  week: z.string({ message: "Week string is required" }),
  rosters: z.array(
    z.object({
      employeeId: z.string({ message: "Employee ID is required" }),
      mon: z.string().default("General"),
      tue: z.string().default("General"),
      wed: z.string().default("General"),
      thu: z.string().default("General"),
      fri: z.string().default("General"),
      sat: z.string().default("Week Off"),
      sun: z.string().default("Week Off"),
    })
  ),
});

