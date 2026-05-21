import { rooms, messages } from "./schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Room = InferSelectModel<typeof rooms>;
export type Message = InferSelectModel<typeof messages>;

export type CreateRoom = InferInsertModel<typeof rooms>;
export type CreateMessage = InferInsertModel<typeof messages>;
