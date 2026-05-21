export interface MessageDTO {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}
export interface PaginatedMessages {
  messages: MessageDTO[];

  pageInfo: {
    hasNextPage: boolean;
    nextCursor?: Cursor;
  };
}

export interface ServerToClientEvents {
  new_message: (message: MessageDTO) => void;

  message_ack: (data: { clientId: string; message: MessageDTO }) => void;

  message_history: (data: PaginatedMessages) => void;

  typing_update: (data: {
    userId: string;
    username: string;
    isTyping: boolean;
  }) => void;

  user_count_update: (data: { roomId: string; count: number }) => void;

  room_closed: (data: { roomId: string; reason: "EXPIRED" }) => void;

  error_event: (data: {
    code: "ROOM_NOT_FOUND" | "ROOM_EXPIRED" | "MESSAGE_INVALID" | "RATE_LIMIT";
  }) => void;
}

export interface ClientToServerEvents {
  join_room: (data: {
    roomId: string;
    userId: string;
    username: string;
    history?: { limit: number };
  }) => void;

  send_message: (data: {
    roomId: string;
    userId: string;
    senderName: string;
    content: string;
    clientId: string;
  }) => void;

  load_history: (data: {
    roomId: string;
    limit: number;
    cursor: Cursor;
  }) => void;

  typing_start: (data: {
    roomId: string;
    userId: string;
    username: string;
  }) => void;

  typing_stop: (data: { roomId: string; userId: string }) => void;

  leave_room: (data: { roomId: string; userId: string }) => void;
}

export interface Cursor {
  createdAt: string;
  id: string;
}
