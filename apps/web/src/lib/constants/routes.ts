export const ROUTES = {
  HOME: '/',
  CREATE_ROOM: '/create-room',
  JOIN_ROOM: '/join-room',
  CHAT: (roomId: string) => `/c/${roomId}`,
} as const;
