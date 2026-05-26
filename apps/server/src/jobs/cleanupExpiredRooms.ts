import { redis } from "../db/redis";
import { db } from "../db";
import { rooms } from "@spectre/shared/schemas";
import { inArray } from "drizzle-orm";
import { io } from "../index";

export async function cleanupExpiredRooms() {
  const now = Date.now();

  const expiredRoomIds = await redis.zrangebyscore("room_expirations", 0, now);

  if (expiredRoomIds.length > 0) {
    for (const roomId of expiredRoomIds) {
      io.to(roomId).emit("room_closed", { roomId, reason: "EXPIRED" });
      io.in(roomId).disconnectSockets();
    }

    await db.delete(rooms).where(inArray(rooms.id, expiredRoomIds));

    await redis.zremrangebyscore("room_expirations", 0, now);
  }
}
