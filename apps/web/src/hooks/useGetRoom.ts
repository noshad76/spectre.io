"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GetRoomResponse } from "@spectre/shared/schemas";
import { API_ROUTES } from "@/lib/constants/apiRoutes";

export const useGetRoom = (roomId: string, enabled = true) =>
  useQuery({
    queryKey: ["get-room", roomId],
    queryFn: async (): Promise<GetRoomResponse> => {
      const { data } = await api.get<GetRoomResponse>(
        API_ROUTES.ROOMS.GET(roomId)
      );
      return data;
    },
    enabled: !!roomId && enabled,
    staleTime: 1000 * 60, // 1 دقیقه کش
  });
