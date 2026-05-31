import { socket } from "../socket";
import { useChatStore } from "@/store/chat-store";
import type { MessageDTO, PaginatedMessages } from "@spectre/shared/schemas";

export function bindMessageEvents(roomId: string) {
  const {
    addOptimisticMessage,
    addIncomingMessage,
    applyMessageAck,
    prependHistory,
  } = useChatStore.getState();

  // ========== MESSAGE_ACK ==========
  socket.on("message_ack", (payload: { clientId: string; message: MessageDTO }) => {
    applyMessageAck(payload.clientId, payload.message);
  });

  // ========== NEW_MESSAGE ==========
  socket.on("new_message", (message: MessageDTO) => {
    // server always sends messages already persisted
    addIncomingMessage(message);
  });

  // ========== HISTORY (initial + pagination) ==========
  socket.on("message_history", (data: PaginatedMessages) => {
    prependHistory(data.messages, data.pageInfo);
  });
}

export function unbindMessageEvents() {
  socket.off("message_ack");
  socket.off("new_message");
  socket.off("message_history");
}
