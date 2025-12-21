import { z } from "zod";

export const aiChatSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(500, "Message is too long!"),
  context: z
    .object({
      currentLocation: z.string().optional(),
    })
    .optional(),
});

export type AIChatDTO = z.infer<typeof aiChatSchema>;
