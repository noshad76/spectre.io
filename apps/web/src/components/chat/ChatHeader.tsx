"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users2, Timer, Copy, Check } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { formatTime, useCountdown } from "@/lib/utils/useCountdown";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ChatHeader() {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const userCount = useChatStore((s) => s.userCount);
  const expiry = useChatStore((s) => s.expireTime);
  const roomName = useChatStore((s) => s.roomName);
  const roomId = useChatStore((s) => s.roomId);

  const timeLeft = useCountdown(expiry!);

  const handleCopy = async () => {
    if (!roomId) return;

    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy roomId:", error);
    }
  };
  useEffect(() => {
    if (expiry) {
      const timeMs = new Date(expiry).getTime() - Date.now();

      if (timeMs <= 0) {
        toast.warning("room has been closed")
        router.push("/room");
      }
    }
  }, [timeLeft, expiry, router]);
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-surface/80 border-b border-border-soft px-4 flex items-center justify-between h-20">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link
          href="/room"
          className="p-2 rounded-lg hover:bg-surface-muted border border-border-soft active:scale-95 transition shrink-0"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>

        <div className="flex flex-col items-end w-full justify-center min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-surface-muted transition-colors shrink-0"
              title="Copy Room ID"
              aria-label="Copy Room ID"
            >
              {copied ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} className="text-text-muted" />
              )}
            </button>
            <span className="font-medium text-sm text-text truncate leading-none">
              {roomName || "Chat Room"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {expiry && (
              <div className="flex items-center gap-1 text-caption px-2 py-[2px] w-26 justify-between rounded-lg bg-surface-muted border border-border-soft shrink-0 h-6">
                <Timer size={11} className="text-primary shrink-0" />
                <span className="text-caption animate-pulse text-danger truncate">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-caption px-2 py-[2px] rounded-lg bg-surface-muted border border-border-soft shrink-0 h-6 items-center">
              <Users2 size={11} className="text-primary shrink-0" />
              <span className="text-caption text-primary truncate">
                {userCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
