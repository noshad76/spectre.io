import { z } from "zod";

export const RoomIdSchema = z.object({
  roomId: z.string().uuid(),
});
export const GetRoomParamsSchema = RoomIdSchema;

export type GetRoomParams = z.infer<typeof GetRoomParamsSchema>;
