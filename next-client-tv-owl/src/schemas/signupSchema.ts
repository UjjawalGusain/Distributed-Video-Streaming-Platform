import * as z from "zod";

export const googleUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  image: z.url().optional(),
  provider: z.literal("google"),
  providerId: z.string(), 
  isPremium: z.boolean().default(false),
  about: z.string().optional(),
});