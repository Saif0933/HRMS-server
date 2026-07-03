import { z } from "zod";

export const sendOtpSchema = z.object({
  phone: z
    .string({ message: "Phone number is required" })
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string({ message: "Phone number is required" })
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  otp: z
    .string({ message: "OTP is required" })
    .length(4, "OTP must be exactly 4 digits"),
});

export const registerSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
  phone: z
    .string({ message: "Phone number is required" })
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"],
});
