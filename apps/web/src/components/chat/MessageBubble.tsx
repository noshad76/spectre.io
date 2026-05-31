"use client";

import { useRef } from "react";
import { ChatMessage } from "@/store/chat-store";
import gsap from "gsap";
import clsx from "clsx";
import { Clock, CheckCheck, AlertCircle } from "lucide-react";
import { useGSAP } from "@gsap/react";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { status } = message;

  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 12,
      duration: 0.22,
      ease: "power2.out",
    });
  }, []);

  return (
    <div
      className={clsx(
        "flex w-full px-4",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <div
        ref={ref}
        className={clsx(
          `
          relative
          max-w-[78%] md:max-w-[58%]
          px-4 py-2.5 
          rounded-2xl
          border
          text-sm leading-[1.45]
          shadow-sm
          `,
          isOwn
            ? "bg-primary-soft border-primary/50 text-text rounded-br-md"
            : "bg-surface-muted border-border-soft text-text-soft rounded-bl-md",
        )}
      >
        {/* Sender Name (فقط برای دیگران) */}
        {!isOwn && (
          <p className="text-[11px] font-semibold text-primary mb-1 leading-none">
            {message.senderName}
          </p>
        )}

        {/* Message Content */}
        <p className="text-[15px] leading-[1.45]">{message.content}</p>

        {/* Time + Status */}
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <span className="text-[11px] text-muted">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isOwn && (
            <div className="flex items-center ml-0.5">
              {status === "sending" && (
                <Clock size={14} className="text-muted/60" />
              )}

              {status === "sent" && (
                <CheckCheck size={14} className="text-primary/70" />
              )}

              {status === "failed" && (
                <AlertCircle size={14} className="text-danger" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
