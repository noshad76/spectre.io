import { db } from "../db";
import { rooms } from "@spectre/shared/schemas";
import { lt } from "drizzle-orm";
import { io } from "../index";
export async function cleanupExpiredRooms() {
  const now = new Date();

  const expiredRooms = await db
    .select()
    .from(rooms)
    .where(lt(rooms.expireAt, now));

  if (expiredRooms.length > 0) {
    for (const room of expiredRooms) {
      io.to(room.id).emit("room_closed", {
        roomId: room.id,
        reason: "EXPIRED",
      });

      io.in(room.id).disconnectSockets();
    }

    await db.delete(rooms).where(lt(rooms.expireAt, now));
  }
}
