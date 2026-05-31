import { socket } from "../socket";
import { useChatStore } from "@/store/chat-store";

export function bindPresenceEvents(roomId: string) {
  const setUserCount = useChatStore.getState().setUserCount;

  socket.on("user_count_update", (payload) => {
    if (payload.roomId === roomId) {
      setUserCount(payload.count);
    }
  });
}

export function unbindPresenceEvents() {
  socket.off("user_count_update");
}
