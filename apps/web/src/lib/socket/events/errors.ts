import { socket } from "../socket";
import { useChatStore } from "@/store/chat-store";
import type { ServerToClientEvents } from "@spectre/shared/schemas";
import { toast } from "sonner";

type ErrorCode = Parameters<ServerToClientEvents["error_event"]>[0]["code"];

const errorMessages: Record<ErrorCode, string> = {
  ROOM_NOT_FOUND: "Room not found.",
  ROOM_EXPIRED: "This room has expired.",
  MESSAGE_INVALID: "Invalid message content.",
  RATE_LIMIT: "You are sending messages too quickly.",
  JOIN_INVALID_PAYLOAD: "Invalid join payload.",
};

export function bindErrorEvents() {
  const reset = useChatStore.getState().reset;

  socket.on("error_event", (data) => {
    const message = errorMessages[data.code];

    console.warn("Socket error:", data.code);

    toast.error(message);

    switch (data.code) {
      case "ROOM_EXPIRED":
      case "ROOM_NOT_FOUND":
      case "JOIN_INVALID_PAYLOAD":
        reset();
        break;

      case "RATE_LIMIT":
      case "MESSAGE_INVALID":
        break;
    }
  });

  socket.on("room_closed", (data) => {
    console.warn("Room closed:", data.reason);

    reset();

    toast.error("Room has been closed.");
  });
}

export function unbindErrorEvents() {
  socket.off("error_event");
  socket.off("room_closed");
}
