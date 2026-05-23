// src/socket/socket-server.ts
import { Server } from "socket.io";
import {
  JoinRoomSchema,
  type ServerToClientEvents,
  type ClientToServerEvents,
  SendMessageSchema,
} from "@spectre/shared/schemas";

import { presenceService } from "../modules/presence/presence.service";
import { socketToUser } from "./connections";
import { env } from "../env";
import * as roomsService from "../services/rooms.service";
import * as messageService from "../services/message.service";
import { rateLimitService } from "./rate-limit";
import { typingService } from "../modules/typing/typing.service";

export function createSocketServer(httpServer: any) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: env.FRONTEND_URL,
        credentials: true,
      },
      transports: ["polling", "websocket"],
    },
  );

  io.on("connection", (socket) => {
    socket.on("join_room", async (payload) => {
      const parsed = JoinRoomSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("error_event", { code: "JOIN_INVALID_PAYLOAD" });
        return;
      }

      const { roomId, userId, username, history } = parsed.data;

      const room = await roomsService.getRoomById(roomId);
      if (!room) {
        socket.emit("error_event", { code: "ROOM_NOT_FOUND" });
        return;
      }

      if (roomsService.isRoomExpired(room)) {
        socket.emit("room_closed", { roomId, reason: "EXPIRED" });
        return;
      }

      const count = presenceService.add(roomId, userId, username, socket.id);

      socketToUser.set(socket.id, { roomId, userId });

      socket.join(roomId);

      io.to(roomId).emit("user_count_update", { roomId, count });

      const historyLimit = history?.limit ?? 50;

      const historyData = await messageService.getLatestMessages(
        roomId,
        historyLimit,
      );

      socket.emit("message_history", historyData);
    });
    socket.on("send_message", async (payload) => {
      console.log("RAW_PAYLOAD:", payload); // ← اینو اضافه کن

      const parsed = SendMessageSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("error_event", { code: "MESSAGE_INVALID" });
        return;
      }

      const { roomId, userId, senderName, content, clientId } = parsed.data;

      const room = await roomsService.getRoomById(roomId);
      if (!room) {
        socket.emit("error_event", { code: "ROOM_NOT_FOUND" });
        return;
      }

      if (roomsService.isRoomExpired(room)) {
        socket.emit("room_closed", { roomId, reason: "EXPIRED" });
        return;
      }

      const limited = rateLimitService.check(socket.id);
      if (limited) {
        socket.emit("error_event", { code: "RATE_LIMIT" });
        return;
      }

      const message = await messageService.createMessage({
        roomId,
        senderId: userId,
        senderName,
        content,
      });

      socket.emit("message_ack", {
        clientId,
        message,
      });

      socket.to(roomId).emit("new_message", message);
    });
    socket.on("typing_start", (payload) => {
      const { roomId, userId, username } = payload;
      typingService.add(roomId, userId, socket.id);
      console.log("Typing Start Received:", payload);

      socket.to(roomId).emit("typing_update", {
        userId,
        username,
        isTyping: true,
      });
    });

    // ۴. پایان تایپ با تایید لایه Service
    socket.on("typing_stop", (payload) => {
      console.log("Typing stop Received:", payload);

      const { roomId, userId } = payload;
      const isCompletelyStopped = typingService.remove(
        roomId,
        userId,
        socket.id,
      );

      if (isCompletelyStopped) {
        socket.to(roomId).emit("typing_update", {
          userId,
          username: "",
          isTyping: false,
        });
      }
    });
    socket.on("load_history", async (payload) => {
      const { roomId, limit, cursor } = payload;

      const page = await messageService.loadOlderMessages(
        roomId,
        limit,
        cursor,
      );

      socket.emit("message_history", page);
    });

    socket.on("disconnect", () => {
      const info = socketToUser.get(socket.id);
      if (!info) return;

      const { roomId, userId } = info;

      const count = presenceService.remove(roomId, userId, socket.id);
      io.to(roomId).emit("user_count_update", { roomId, count });

      const isCompletelyStopped = typingService.remove(
        roomId,
        userId,
        socket.id,
      );
      if (isCompletelyStopped) {
        socket.to(roomId).emit("typing_update", {
          userId,
          username: "",
          isTyping: false,
        });
      }

      socketToUser.delete(socket.id);
    });
  });

  return io;
}
