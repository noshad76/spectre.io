"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatProvider } from "@/providers/ChatProvider";
import { UsernameDialog } from "@/components/UsernameDialog";
import { useUserStore } from "@/store/user-store";
import { ChatLayout } from "./ChatLayout";
import { useGetRoom } from "@/hooks/useGetRoom";

import { useMemo } from "react";

export default function ChatRoom({ roomId }: { roomId: string }) {
  const nickname = useUserStore((s) => s.nickname);
  const { setExpireTime, setRoomName, setRoomId } = useChatStore();

  const { data, error, isLoading } = useGetRoom(roomId);

  const isExpired = useMemo(() => {
    if (!data?.expireAt) return false;
    return new Date() >= new Date(data.expireAt);
  }, [data]);

  useEffect(() => {
    if (data) {
      const expireDate = new Date(data.expireAt);
      setRoomId(data.id);
      setRoomName(data.name);
      setExpireTime(expireDate.toISOString());
    }
  }, [data, setRoomId, setRoomName, setExpireTime]);

  if (isLoading)
    return (
      <main className="min-h-screen flex-center text-primary">Loading...</main>
    );

  if (error || isExpired) {
    return (
      <main className="min-h-screen flex-center flex-col gap-4 p-4 text-center">
        <h1 className="text-3xl font-bold text-danger">Room Expired</h1>
        <p className="text-muted">This room is no longer available.</p>
        <a href="/room" className="px-4 py-2 bg-primary text-white rounded-lg">
          Back to Rooms
        </a>
      </main>
    );
  }

  return (
    <>
      {!nickname && <UsernameDialog />}

      {nickname ? (
        <ChatProvider>
          <ChatLayout />
        </ChatProvider>
      ) : null}
    </>
  );
}
