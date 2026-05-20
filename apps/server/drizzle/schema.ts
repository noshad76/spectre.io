import { pgTable, uuid, text, timestamp, index, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const rooms = pgTable("rooms", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roomId: uuid("room_id").notNull(),
	content: text().notNull(),
	sender: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_room_messages").using("btree", table.roomId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "messages_room_id_rooms_id_fk"
		}).onDelete("cascade"),
]);
