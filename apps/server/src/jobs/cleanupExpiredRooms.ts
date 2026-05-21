import { db } from "../db";
import { rooms } from "@spectre/shared/schemas";
import { lt } from "drizzle-orm";

export async function cleanupExpiredRooms() {
  const now = new Date();

  await db
    .delete(rooms)
    .where(lt(rooms.expireAt, now));
}
