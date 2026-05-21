import z from "zod";

export const CreateRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters long")
    .max(50, "Room name cannot exceed 50 characters")
    .trim(),
  ttlHours: z
    .number()
    .int()
    .min(1, "Minimum TTL is 1 hour")
    .max(24, "Maximum TTL is 24 hours"),
});
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
