"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateRoomInput, CreateRoomResponse } from "@spectre/shared/schemas";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { QUERY_KEYS } from "@/lib/constants/queryKeys";

export const useCreateRoom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRoomInput) => {
      const { data } = await api.post<CreateRoomResponse>(
        API_ROUTES.ROOMS.CREATE,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.ROOM(data.id), data);
      toast.success("Room created successfully!");
      router.push(ROUTES.CHAT(data.id));
    },
    onError: () => {
      toast.error("Failed to create room. Please try again.");
    },
  });
};
