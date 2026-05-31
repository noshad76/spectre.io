import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@spectre/shared/schemas";
import { env } from "@/lib/env";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  env.NEXT_PUBLIC_SOCKET_URL,
  {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
  },
);
