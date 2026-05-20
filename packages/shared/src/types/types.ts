export interface MessageDTO {
  id: string;
  roomId: string;
  content: string;
  sender: string;
  createdAt: string;
}

export interface ServerToClientEvents {
  new_message: (message: MessageDTO) => void;
  user_count_update: (data: { count: number }) => void;
  typing_update: (data: { username: string; isTyping: boolean }) => void;
  message_history: (messages: MessageDTO[]) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { roomId: string; username: string }) => void;
  send_message: (data: { roomId: string; content: string; sender: string }) => void;
  typing_start: (roomId: string) => void;
  typing_stop: (roomId: string) => void;
}
