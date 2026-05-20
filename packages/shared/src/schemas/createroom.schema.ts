import z from "zod";

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters long")
    .max(50, "Room name cannot exceed 50 characters")
    .trim(),
});
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
