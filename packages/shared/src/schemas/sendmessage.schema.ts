import { z } from "zod";

export const SendMessageSchema = z.object({
  roomId: z.string().uuid(),

  userId: z.string().uuid(),

  senderName: z.string().min(2).max(32).trim(),

  content: z.string().min(1).max(2000),

  clientId: z.string(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
