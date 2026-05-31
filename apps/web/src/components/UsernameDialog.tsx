// components/UsernameDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@ark-ui/react";
import { useUserStore } from "@/store/user-store";

export function UsernameDialog() {
  const { nickname, setNickname } = useUserStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!nickname || nickname.trim() === "") {
      setOpen(true);
    }
  }, [nickname]);

  const handleSubmit = () => {
    if (value.trim().length < 2) return;
    setNickname(value.trim());
    setOpen(false);
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

      <Dialog.Positioner className="fixed inset-0 flex-center z-50 px-4">
        <Dialog.Content
          className="
            surface-card 
            p-8 
            rounded-xl 
            max-w-md 
            w-full 
            border border-border-soft 
            shadow-lg 
            animate-fade-in
          "
        >
          <Dialog.Title className="text-title-3 mb-2 text-primary">
            Choose a username
          </Dialog.Title>

          <Dialog.Description className="text-body-soft mb-6">
            Please enter a username to join the chat room.
          </Dialog.Description>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Username..."
            className="
              w-full 
              p-3 
              rounded-md 
              bg-surface-muted 
              text-text 
              border border-border-soft 
              focus:outline-none 
              focus:ring-2 
              focus:ring-primary 
              mb-5
            "
          />

          <button
            onClick={handleSubmit}
            className="
              w-full 
              px-4 py-3 
              rounded-md 
              bg-primary 
              text-bg 
              font-medium 
              hover:bg-accent 
              transition
            "
          >
            Enter room
          </button>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
