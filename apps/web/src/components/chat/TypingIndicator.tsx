"use client";

import { useChatStore } from "@/store/chat-store";

export function TypingIndicator() {
  const typingUsers = useChatStore((s) => s.typingUsers);

  if (typingUsers.size === 0) return null;

  const users = Array.from(typingUsers.values());
  const displayText =
    users.length > 1 ? "Several people are typing..." : `${users[0]} is typing`;

  return (
    <div
      className={`
      absolute bottom-20 left-6 z-20
      flex items-center gap-2
      justify-center
      px-2 py-1 rounded-full
      bg-surface-dark/60 backdrop-blur-md
      border border-white/10
      text-[12px] font-medium text-white/80
      transition-all duration-300 ease-out
    `}
    >
      {/* دات‌های انیمیشنی (Typing Dots) */}
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
      </div>
      <span>{displayText}</span>
    </div>
  );
}
