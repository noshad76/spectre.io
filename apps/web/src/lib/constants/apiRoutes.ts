export const API_ROUTES = {
  ROOMS: {
    CREATE: '/rooms',
    GET: (roomId: string) => `/rooms/${roomId}`,
  },
} as const;