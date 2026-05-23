import { CreateMessage, Cursor, messages } from "@spectre/shared/schemas";
import { db } from "../db";
import { and, desc, eq, lt, or } from "drizzle-orm";

export async function createMessage(data: CreateMessage) {
  const [msg] = await db.insert(messages).values(data).returning();

  return {
    id: msg.id,
    roomId: msg.roomId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function getLatestMessages(roomId: string, limit = 50) {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.roomId, roomId))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit);

  const msgs = rows.map((m) => ({
    id: m.id,
    roomId: m.roomId,
    senderId: m.senderId,
    senderName: m.senderName,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  const nextCursor =
    msgs.length > 0
      ? {
          createdAt: msgs[msgs.length - 1].createdAt,
          id: msgs[msgs.length - 1].id,
        }
      : undefined;

  return {
    messages: msgs,
    pageInfo: {
      hasNextPage: Boolean(nextCursor),
      nextCursor,
    },
  };
}


export async function loadOlderMessages(
  roomId: string,
  limit: number,
  cursor: Cursor
) {
  const rows = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.roomId, roomId),
        or(
          lt(messages.createdAt, new Date(cursor.createdAt)),
          and(
            eq(messages.createdAt, new Date(cursor.createdAt)),
            lt(messages.id, cursor.id)
          )
        )
      )
    )
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit);

  const msgs = rows.map((m) => ({
    id: m.id,
    roomId: m.roomId,
    senderId: m.senderId,
    senderName: m.senderName,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  const nextCursor =
    msgs.length > 0
      ? {
          createdAt: msgs[msgs.length - 1].createdAt,
          id: msgs[msgs.length - 1].id,
        }
      : undefined;

  return {
    messages: msgs,
    pageInfo: {
      hasNextPage: Boolean(nextCursor),
      nextCursor,
    },
  };
}
