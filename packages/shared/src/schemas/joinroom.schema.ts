import { z } from "zod";

export const JoinRoomSchema = z.object({
  roomId: z.string().uuid("Room ID must be a valid UUID"),
});

export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
