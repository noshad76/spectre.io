import { relations } from "drizzle-orm/relations";
import { rooms, messages } from "./schema";

export const messagesRelations = relations(messages, ({one}) => ({
	room: one(rooms, {
		fields: [messages.roomId],
		references: [rooms.id]
	}),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	messages: many(messages),
}));