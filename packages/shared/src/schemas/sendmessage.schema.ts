import z from "zod";

export const SendMessageSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
  sender: z
    .string()
    .min(2, "Sender name must be at least 2 characters long")
    .trim(),
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
