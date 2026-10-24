import { z } from "zod";

// Pulled into their own module (rather than left inline in route files) so
// they can be unit tested in isolation, and so routes stay focused on
// HTTP concerns instead of validation rules.

export const phoneSchema = z.object({
  phone: z.string().min(8, "Phone number looks too short"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const createLoanSchema = z.object({
  friendName: z.string().min(1, "friendName is required"),
  amount: z.number().positive("amount must be positive"),
  dueDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "dueDate must be a valid date"),
});
