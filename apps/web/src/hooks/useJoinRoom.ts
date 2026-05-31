"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GetRoomResponse } from "@spectre/shared/schemas";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

export const useJoinRoom = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data } = await api.get<GetRoomResponse>(
        API_ROUTES.ROOMS.GET(roomId),
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success("Joined room successfully!");
      router.push(ROUTES.CHAT(data.id));
    },
    onError: () => {
      toast.error("Room not found. Please check the ID.");
    },
  });
};
