import * as z from "zod";

export const roomSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(15),
  roomInput: z.string().min(3, "Required (min 3 chars)"),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
