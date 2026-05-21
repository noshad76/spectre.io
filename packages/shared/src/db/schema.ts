import { integer } from "drizzle-orm/pg-core";
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    ttlHours: integer("ttl_hours").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    expireAt: timestamp("expire_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("idx_rooms_expire").on(table.expireAt)],
);
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roomId: uuid("room_id")
      .references(() => rooms.id, { onDelete: "cascade" })
      .notNull(),

    senderId: uuid("sender_id").notNull(),

    senderName: text("sender_name").notNull(),

    content: text("content").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_messages_room_cursor").on(
      table.roomId,
      table.createdAt,
      table.id,
    ),
  ],
);
