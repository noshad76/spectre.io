import { Room } from "../db/types"; 

export type ApiResponse<T> = T;

export type ApiErrorResponse = {
  error: string | string[] | object;
};

export type CreateRoomResponse = Room;
export type GetRoomResponse = Room;
