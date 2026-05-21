DROP INDEX "idx_room_messages";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "ttl_hours" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "expire_at" timestamp with time zone NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_room_messages" ON "messages" USING btree ("room_id","created_at");