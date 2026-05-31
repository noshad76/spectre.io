"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Send } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { useChatStore } from "@/store/chat-store";
import { socket } from "@/lib/socket/socket";
import { generateUid } from "@/lib/utils/generateUid";
import debounce from "lodash/debounce";

export function MessageInput() {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isTypingRef = useRef(false);

  const roomId = useChatStore((s) => s.roomId);
  const userId = useUserStore((s) => s.userId);
  const nickname = useUserStore((s) => s.nickname);
  const removeTyping = useChatStore((s) => s.removeTypingUser);
  const addOptimistic = useChatStore((s) => s.addOptimisticMessage);

  // ۱. استفاده از Ref برای داشتن همیشه آخرین مقادیر بدون وابستگی به رندر
  const stateRef = useRef({ roomId, userId });
  useEffect(() => {
    stateRef.current = { roomId, userId };
  }, [roomId, userId]);

  // ۲. تعریف Debounce با useMemo برای پایداری و دسترسی به Ref
  const debouncedStopTyping = useMemo(
    () =>
      debounce(() => {
        const { roomId: currentRoomId, userId: currentUserId } =
          stateRef.current;

        if (!currentRoomId || !currentUserId) return;

        console.log("Debounced Stop Sent to Server"); // برای دیباگ
        socket.emit("typing_stop", {
          roomId: currentRoomId,
          userId: currentUserId,
        });
        removeTyping(currentUserId);
        isTypingRef.current = false;
      }, 2000),
    [removeTyping], // وابستگی فقط به اکشن استور
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (!roomId || !userId) return;

    // شروع تایپ
    if (!isTypingRef.current && value.length > 0) {
      isTypingRef.current = true;
      socket.emit("typing_start", { roomId, userId, username: nickname });
    }

    // تمدید تایمر توقف
    if (value.length > 0) {
      debouncedStopTyping();
    }

    // توقف آنی در صورت خالی شدن Input
    if (value.length === 0 && isTypingRef.current) {
      debouncedStopTyping.cancel();
      socket.emit("typing_stop", { roomId, userId });
      removeTyping(userId);
      isTypingRef.current = false;
    }
  };

  const send = () => {
    if (!text.trim() || !roomId || !nickname || !userId || isSending) return;

    debouncedStopTyping.cancel();
    if (isTypingRef.current) {
      socket.emit("typing_stop", { roomId, userId });
      removeTyping(userId);
      isTypingRef.current = false;
    }

    setIsSending(true);
    const clientId = generateUid();

    addOptimistic({
      id: clientId,
      roomId,
      senderId: userId,
      senderName: nickname,
      content: text,
      createdAt: new Date().toISOString(),
      clientId,
      status: "sending",
    });

    socket.emit("send_message", {
      roomId,
      userId,
      senderName: nickname,
      content: text,
      clientId,
    });

    setText("");
    setIsSending(false);
  };

  // Cleanup
  useEffect(() => {
    return () => debouncedStopTyping.cancel();
  }, [debouncedStopTyping]);

  return (
    <div className="px-4 pb-4 bg-surface-muted/30">
      <div className="flex items-center gap-3 bg-surface-muted p-2 rounded-[24px] border border-border focus-within:border-primary transition-all">
        <input
          value={text}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="flex-1 bg-transparent px-3 outline-none text-text placeholder:text-text-muted"
          placeholder="Type a message..."
          disabled={isSending}
        />
        <button
          onClick={send}
          disabled={isSending || !text.trim()}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
