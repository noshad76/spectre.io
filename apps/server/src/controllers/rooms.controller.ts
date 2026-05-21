import { Request, Response, NextFunction } from "express";
import { CreateRoomSchema, GetRoomParams } from "@spectre/shared/schemas";
import * as roomsService from "../services/rooms.service";

import {
  CreateRoomResponse,
  GetRoomResponse,
  ApiErrorResponse,
} from "@spectre/shared/schemas";

export async function createRoom(
  req: Request,
  res: Response<CreateRoomResponse | ApiErrorResponse>,
  next: NextFunction,
) {
  try {
    const input = CreateRoomSchema.parse(req.body);
    const room = await roomsService.createRoom(input.name, input.ttlHours);
    return res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

export async function getRoom(
  req: Request<GetRoomParams>,
  res: Response<GetRoomResponse | ApiErrorResponse>,
  next: NextFunction,
) {
  try {
    const { roomId } = req.params;
    const room = await roomsService.getRoomById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.json(room);
  } catch (err) {
    next(err);
  }
}
