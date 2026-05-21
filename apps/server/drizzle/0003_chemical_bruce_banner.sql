ALTER TABLE "messages" RENAME COLUMN "sender" TO "sender_name";--> statement-breakpoint
DROP INDEX "idx_room_messages";--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "sender_id" uuid NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_messages_room_cursor" ON "messages" USING btree ("room_id","created_at","id");--> statement-breakpoint
CREATE INDEX "idx_rooms_expire" ON "rooms" USING btree ("expire_at");