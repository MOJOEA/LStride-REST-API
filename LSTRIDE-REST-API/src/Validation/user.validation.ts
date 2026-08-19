import { z } from "zod";

export const getProfileSchema = z.object({
  id: z
    .string()
    .min(1, "User ID is required"),
});