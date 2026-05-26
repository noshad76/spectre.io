import { Room, rooms } from "@spectre/shared/schemas";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { redis } from "../db/redis";

export async function createRoom(
  name: string,
  ttlHours: number,
): Promise<Room> {
  const expireAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const [room]: Room[] = await db
    .insert(rooms)
    .values({
      name,
      ttlHours,
      expireAt,
    })
    .returning();
  await redis.zadd("room_expirations", expireAt.getTime(), room.id);

  return room;
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  return room ?? null;
}
export function isRoomExpired(room: Room): boolean {
  return new Date() >= new Date(room.expireAt);
}
