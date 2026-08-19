import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),

  gender: z
    .string()
    .min(1, "Gender is required"),

  email: z
    .string()
    .email("Invalid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const googleLoginSchema = z.object({
  idToken: z
    .string()
    .min(1, "Google ID token is required"),
});