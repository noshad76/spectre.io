import { Room, rooms } from "@spectre/shared/schemas";
import { db } from "../db";
import { eq } from "drizzle-orm";

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

  return room;
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));

  if (!room) return null;

  if (room.expireAt < new Date()) {
    return null;
  }

  return room;
}
