"use client";

import { generateUid } from "@/lib/utils/generateUid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  userId: string;
  nickname: string;

  setNickname: (name: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: generateUid(),
      nickname: "",

      setNickname: (name) => set({ nickname: name }),
    }),
    { name: "user-storage" },
  ),
);
