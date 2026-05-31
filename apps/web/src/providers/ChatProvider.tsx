"use client";

import { ReactNode, useEffect } from "react";
import { socket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat-store";
import { useUserStore } from "@/store/user-store";

import {
  bindPresenceEvents,
  unbindPresenceEvents,
} from "@/lib/socket/events/presence";
import {
  bindMessageEvents,
  unbindMessageEvents,
} from "@/lib/socket/events/messages";
import {
  bindTypingEvents,
  unbindTypingEvents,
} from "@/lib/socket/events/typing";
import { bindErrorEvents, unbindErrorEvents } from "@/lib/socket/events/errors";
import { useRouter } from "next/navigation";

export function ChatProvider({ children }: { children: ReactNode }) {
  const roomId = useChatStore((s) => s.roomId);
  const userId = useUserStore((s) => s.userId);
  const nickname = useUserStore((s) => s.nickname);
  const router = useRouter();
  const handleRoomExpired = (data?: { reason?: string }) => {
    // toast.info("Room Closed", { description: data?.reason });
    socket.disconnect();

    router.push("/room");
  };
  useEffect(() => {
    if (!roomId || !userId || !nickname) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit("join_room", {
        roomId,
        userId,
        username: nickname,
        history: { limit: 50 },
      });
    };

    socket.on("connect", handleConnect);
    socket.on("room_closed", handleRoomExpired);
    if (socket.connected) {
      handleConnect();
    }

    bindPresenceEvents(roomId);
    bindMessageEvents(roomId);
    bindTypingEvents(roomId);
    bindErrorEvents();

    const handlePageHide = () => socket.disconnect();

    window.addEventListener("beforeunload", handlePageHide);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      socket.off("connect", handleConnect);

      unbindPresenceEvents();
      unbindMessageEvents();
      unbindTypingEvents();
      unbindErrorEvents();

      socket.disconnect();

      window.removeEventListener("beforeunload", handlePageHide);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [roomId, userId, nickname]);

  return <>{children}</>;
}
