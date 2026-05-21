import z from "zod";
import { RoomIdSchema } from "./getroom.schema";

export const JoinRoomSchema = RoomIdSchema.extend({
  userId: z.string().uuid(),
  username: z.string().min(2).max(32).trim(),
  history: z
    .object({
      limit: z.number().min(1).max(100).default(50),
    })
    .optional(),
});

export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
