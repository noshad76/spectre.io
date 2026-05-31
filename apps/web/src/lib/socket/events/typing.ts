import { socket } from "../socket";
import { useChatStore } from "@/store/chat-store";

export function bindTypingEvents(roomId: string) {
  const setTyping = useChatStore.getState().setTyping;

  socket.on("typing_update", (payload) => {
    const { userId, username, isTyping } = payload;
    setTyping(userId, username, isTyping);
  });
}

export function unbindTypingEvents() {
  socket.off("typing_update");
}
