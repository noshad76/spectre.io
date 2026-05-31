"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, useChatStore } from "@/store/chat-store";
import { MessageBubble } from "./MessageBubble";
import { useUserStore } from "@/store/user-store";
import { socket } from "@/lib/socket/socket";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const pageInfo = useChatStore((s) => s.pageInfo);
  const nickname = useUserStore((s) => s.nickname);

  const listRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!pageInfo) return;
    if (!messages.length) return;

    if (initialLoad.current) {
      initialLoad.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [pageInfo]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const distanceFromBottom =
      list.scrollHeight - (list.scrollTop + list.clientHeight);

    if (distanceFromBottom < 150) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!pageInfo) return;

    const el = topSentinelRef.current;
    const list = listRef.current;
    if (!el || !list) return;

    let prevScrollHeight = 0;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;

        if (!pageInfo.hasNextPage || loadingHistory) return;

        if (!pageInfo?.hasNextPage) return;
        if (!pageInfo.nextCursor) return;
        if (loadingHistory) return;
        setLoadingHistory(true);
        prevScrollHeight = list.scrollHeight;
        socket.emit("load_history", {
          roomId: useChatStore.getState().roomId!,
          limit: 20,
          cursor: pageInfo.nextCursor,
        });
      },
      { root: listRef.current, threshold: 0.01 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [pageInfo, loadingHistory]);

  useEffect(() => {
    if (!loadingHistory) return;

    const list = listRef.current;
    if (!list) return;

    const newHeight = list.scrollHeight;
    const diff = newHeight - list.scrollHeight;
    requestAnimationFrame(() => {
      list.scrollTop = newHeight - list.scrollHeight;
    });

    setLoadingHistory(false);
  }, [messages]);
  const messageKey = (msg: ChatMessage) =>
    msg.clientId ? `client:${msg.clientId}` : `server:${msg.id}`;

  return (
    <div
      ref={listRef}
      className="
        h-full overflow-y-auto 
        px-4 py-6 
        space-y-3 
        bg-surface-muted/30
      "
    >
      <div ref={topSentinelRef} className="h-1" />

      {loadingHistory && (
        <div className="text-center text-caption text-primary py-2">
          Loading messages…
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={messageKey(msg)}
          message={msg}
          isOwn={msg.senderName === nickname}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
