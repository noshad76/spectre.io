<div align="center">
  <h1>spectre.io</h1>
  <p><strong>Realtime room-based chat with self-destructing rooms, Socket.IO transport, PostgreSQL persistence, and an aggressively optimistic Next.js client.</strong></p>

  <p>
    <a href="README.md#license"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-0f172a.svg" /></a>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178c6.svg" />
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black.svg" />
    <img alt="Express" src="https://img.shields.io/badge/Express-5-111827.svg" />
    <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-4.8-010101.svg" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Drizzle-336791.svg" />
    <img alt="Redis" src="https://img.shields.io/badge/Redis-presence%20%7C%20rate%20limit-dc382d.svg" />
    <img alt="Repo Size" src="https://img.shields.io/github/repo-size/noshad76/spectre.io" />
  </p>
</div>

---

## Overview

`spectre.io` is a realtime, temporary room-based chat platform. Users create rooms with a bounded TTL from **1 to 24 hours**, invite others by room ID, exchange messages with sub-second synchronization, and then watch the room disappear when its expiration deadline arrives.

The system deliberately separates rendering from authority:

- **Next.js** owns the user experience and local optimistic state.
- **Socket.IO** owns realtime fan-out, presence, typing, and room lifecycle signals.
- **Express + Drizzle** own validation, persistence, pagination, and expiration enforcement.
- **PostgreSQL** stores rooms/messages; **Redis** powers distributed Socket.IO, presence bookkeeping, room expiration indexes, and message rate limiting.

Stream Chat was part of the reference architecture as a UI-rendering strategy only. This codebase currently implements a custom chat UI, while preserving the same backend-owned messaging model and DTO shape required for Stream-compatible rendering.

## Key Features

- **Realtime Sync** - room joins, message broadcasts, typing updates, and presence counts are delivered over Socket.IO.
- **Temporary Rooms** - every room receives a TTL between `1` and `24` hours and a deterministic `expireAt` timestamp.
- **Dual Layer Expiration** - server-side event validation blocks expired rooms, while a Redis-backed cleanup loop emits `room_closed`, disconnects sockets, and deletes expired rows.
- **Optimistic Messaging** - the client renders outbound messages immediately with `status: "sending"`, then reconciles them through `message_ack` using a stable `clientId`.
- **Cursor-Based Pagination** - history loads with `(createdAt, id)` cursors for deterministic infinite scroll over message history.
- **Presence Tracking** - Redis sets track unique users per room, not just raw socket connections.
- **Typing Indicators** - typing state is broadcast to peers and automatically expires in Redis.
- **Spam Resistance** - message sends are rate-limited at `2 messages / second` per socket.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Zustand, TanStack Query, Socket.IO Client, Tailwind CSS 4, Ark UI, GSAP, Sonner |
| Backend | Node.js, Express 5, Socket.IO 4, TypeScript, Zod, Helmet, CORS |
| Database | PostgreSQL, Drizzle ORM, Drizzle Kit |
| Realtime Infrastructure | Redis, `@socket.io/redis-adapter`, ioredis |
| Tooling | npm workspaces, Biome, tsx, TypeScript project references |
| Deployment Target | Vercel frontend, containerized Node.js backend, managed PostgreSQL, managed Redis |

## Architecture

```mermaid
flowchart TD
  U[User Browser] -->|REST: create/join/get room| W[Next.js Web App]
  U <-->|WebSocket / polling| S[Socket.IO Gateway]

  W -->|Axios| A[Express REST API]
  W -->|Zustand optimistic store| UI[Chat UI]

  A -->|Drizzle ORM| PG[(PostgreSQL)]
  S -->|Drizzle ORM| PG
  S <-->|pub/sub adapter| R[(Redis)]

  R --> P[Presence Sets]
  R --> T[Typing Hashes]
  R --> L[Rate Limit Keys]
  R --> E[room_expirations ZSET]

  J[Cleanup Job / 5s] --> E
  J -->|emit room_closed| S
  J -->|cascade delete| PG

  S -->|message_history / new_message / ack| UI
  S -->|typing_update / user_count_update / room_closed| UI
```

## Repository Layout

`spectre.io` is organized as an npm workspaces monorepo. The repository keeps deployable applications under `apps/*` and reusable cross-runtime code under `packages/*`. This structure keeps the frontend, backend, and shared contract layer versioned together, so API schemas, Socket.IO payload types, Drizzle models, and DTOs evolve atomically instead of drifting across separate repositories.

```txt
.
|-- apps
|   |-- server                 # Express + Socket.IO backend
|   |   |-- drizzle            # generated SQL migrations and metadata
|   |   `-- src
|   |       |-- controllers    # REST controllers
|   |       |-- jobs           # expiration cleanup worker
|   |       |-- modules        # presence and typing services
|   |       |-- services       # room and message domain logic
|   |       `-- socket         # event handlers, adapter, rate limit
|   `-- web                    # Next.js application
|       `-- src
|           |-- app            # App Router pages
|           |-- components     # chat UI components
|           |-- hooks          # room create/join/get hooks
|           |-- lib            # API client, socket client, env validation
|           |-- providers      # Socket event lifecycle binding
|           `-- store          # Zustand chat/user stores
|-- packages
|   `-- shared                 # Zod schemas, DTOs, Drizzle schema, shared types
|-- docker-compose.yml         # Redis service for local development
`-- package.json               # npm workspace scripts
```

### Monorepo Packages

| Workspace | Path | Responsibility |
| --- | --- | --- |
| `web` | `apps/web` | Next.js client, room creation/join flows, Socket.IO client lifecycle, optimistic chat state, and UI rendering |
| `server` | `apps/server` | Express REST API, Socket.IO gateway, Redis-backed presence/typing/rate-limit state, expiration cleanup, and Drizzle persistence |
| `@spectre/shared` | `packages/shared` | Shared Zod validators, TypeScript DTOs, Socket event contracts, REST response types, and Drizzle table definitions |

The root `package.json` orchestrates all workspaces. Running `npm run dev` starts the shared package in watch mode before launching the web and server apps, while `npm run build` compiles the shared package first so both applications consume the same generated type surface.

## Database Model

### `rooms`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated by PostgreSQL |
| `name` | `text` | Room display name, validated at `3..50` chars |
| `ttl_hours` | `integer` | Room lifetime, validated at `1..24` |
| `created_at` | `timestamptz` | Creation timestamp |
| `expire_at` | `timestamptz` | Authoritative expiration timestamp |

Indexes:

- `idx_rooms_expire` on `expire_at` for expiration sweeps.

### `messages`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, generated by PostgreSQL |
| `room_id` | `uuid` | FK to `rooms.id`, `ON DELETE CASCADE` |
| `sender_id` | `uuid` | Stable user identity generated client-side |
| `sender_name` | `text` | Display name snapshot at send time |
| `content` | `text` | Validated at `1..2000` chars |
| `created_at` | `timestamptz` | Message creation timestamp |

Indexes:

- `idx_messages_room_cursor` on `(room_id, created_at, id)` for cursor pagination.

## Installation Guide

### Prerequisites

- **Node.js** `20.x` or newer
- **npm** `10.x` or newer
- **Docker** and Docker Compose for Redis and optional local PostgreSQL
- **PostgreSQL** `15+`
- **Redis** `7+`

### 1. Clone the repository

```bash
git clone https://github.com/noshad76/spectre.io.git
cd spectre.io
```

### 2. Install workspace dependencies

```bash
npm install
```

### 3. Start infrastructure

The repository includes a Redis Compose service:

```bash
docker compose up -d redis
```

Start PostgreSQL locally if you do not already have a database available:

```bash
docker run --name spectre_postgres \
  -e POSTGRES_USER=spectre \
  -e POSTGRES_PASSWORD=spectre \
  -e POSTGRES_DB=spectre \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 4. Configure environment variables

Create `apps/server/.env`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
DATABASE_URL=postgres://spectre:spectre@localhost:5432/spectre
REDIS_URL=redis://localhost:6379
```

Create `apps/web/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 5. Apply the database schema

For local development, push the Drizzle schema directly:

```bash
npm run db:push -w server
```

Or generate and run migrations:

```bash
npm run db:migrate -w server
```

### 6. Run the development stack

```bash
npm run dev
```

This launches:

| Workspace | Command | Default URL |
| --- | --- | --- |
| `@spectre/shared` | `tsc -w` | N/A |
| `web` | `next dev -p 5000` | `http://localhost:5000` |
| `server` | `tsx watch src/index.ts` | `http://localhost:4000` |

### 7. Build for production

```bash
npm run build
```

## Environment Variables

### Backend: `apps/server/.env`

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `4000` | HTTP and Socket.IO server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string used by `pg` and Drizzle |
| `FRONTEND_URL` | Yes | - | CORS origin for Socket.IO clients |
| `REDIS_URL` | Yes | - | Redis URL for adapter, presence, typing, rate limit, and expirations |
| `NODE_ENV` | No | `development` | Runtime mode: `development` or `production` |

### Frontend: `apps/web/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | REST base URL, typically `http://localhost:4000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Socket.IO origin, typically `http://localhost:4000` |

## REST API

Base path: `/api`

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "spectre.io"
}
```

### Create Room

```http
POST /api/rooms
Content-Type: application/json
```

Request:

```json
{
  "name": "Team Sync",
  "ttlHours": 6
}
```

Validation:

| Field | Rule |
| --- | --- |
| `name` | string, trimmed, min `3`, max `50` |
| `ttlHours` | integer, min `1`, max `24` |

Response `201`:

```json
{
  "id": "4b4f6e50-b1c1-45b3-a402-7f2d53055a87",
  "name": "Team Sync",
  "ttlHours": 6,
  "createdAt": "2026-05-29T12:00:00.000Z",
  "expireAt": "2026-05-29T18:00:00.000Z"
}
```

### Get Room

```http
GET /api/rooms/:roomId
```

Responses:

| Status | Body | Meaning |
| --- | --- | --- |
| `200` | `Room` | Room is active |
| `404` | `{ "error": "Room not found" }` | Unknown room ID |
| `410` | `{ "error": "ROOM_EXPIRED" }` | Room exists but is expired |

## Socket.IO Events

All socket events are typed in `packages/shared/src/types/types.ts`.

### Client -> Server

#### `join_room`

Joins a room, registers presence, and returns initial history.

```ts
socket.emit("join_room", {
  roomId: string,
  userId: string,
  username: string,
  history?: { limit: number }
})
```

Validation:

- `roomId`: UUID
- `userId`: UUID
- `username`: `2..32` chars
- `history.limit`: optional, `1..100`, defaults to `50`

#### `send_message`

Persists a message and broadcasts it to the room.

```ts
socket.emit("send_message", {
  roomId: string,
  userId: string,
  senderName: string,
  content: string,
  clientId: string
})
```

Validation:

- `content`: `1..2000` chars
- hard rate limit: `2 messages / second / socket`
- server rejects sends after room expiration

#### `load_history`

Loads older messages using a cursor.

```ts
socket.emit("load_history", {
  roomId: string,
  limit: number,
  cursor: {
    createdAt: string,
    id: string
  }
})
```

#### `typing_start`

```ts
socket.emit("typing_start", {
  roomId: string,
  userId: string,
  username: string
})
```

#### `typing_stop`

```ts
socket.emit("typing_stop", {
  roomId: string,
  userId: string
})
```

#### `leave_room`

Declared in shared types for client compatibility. Current server cleanup is performed on socket disconnect.

```ts
socket.emit("leave_room", {
  roomId: string,
  userId: string
})
```

### Server -> Client

#### `message_history`

Returned after `join_room` and `load_history`.

```ts
socket.on("message_history", (data: {
  messages: MessageDTO[],
  pageInfo: {
    hasNextPage: boolean,
    nextCursor?: { createdAt: string, id: string }
  }
}) => {})
```

#### `message_ack`

Reconciles an optimistic client message with the persisted server message.

```ts
socket.on("message_ack", (data: {
  clientId: string,
  message: MessageDTO
}) => {})
```

#### `new_message`

Broadcast to every other socket in the room after persistence.

```ts
socket.on("new_message", (message: MessageDTO) => {})
```

#### `typing_update`

```ts
socket.on("typing_update", (data: {
  userId: string,
  username: string,
  isTyping: boolean
}) => {})
```

#### `user_count_update`

```ts
socket.on("user_count_update", (data: {
  roomId: string,
  count: number
}) => {})
```

#### `room_closed`

```ts
socket.on("room_closed", (data: {
  roomId: string,
  reason: "EXPIRED"
}) => {})
```

#### `error_event`

```ts
socket.on("error_event", (data: {
  code:
    | "ROOM_NOT_FOUND"
    | "ROOM_EXPIRED"
    | "MESSAGE_INVALID"
    | "RATE_LIMIT"
    | "JOIN_INVALID_PAYLOAD"
}) => {})
```

## Key Logic Highlights

### Dual Layer Expiration

`spectre.io` treats room expiration as a server-authoritative invariant, not a UI preference.

1. **Synchronous event validation**
   - REST `GET /api/rooms/:roomId` returns `410 ROOM_EXPIRED` for stale rooms.
   - `join_room` and `send_message` load the room and call `isRoomExpired(room)` before continuing.
   - Expired rooms emit `room_closed` and refuse new writes.

2. **Asynchronous cleanup loop**
   - `createRoom()` calculates `expireAt = now + ttlHours` and inserts the room.
   - The room ID is also inserted into Redis sorted set `room_expirations` with `expireAt.getTime()` as score.
   - `cleanupExpiredRooms()` runs every `5 seconds`, queries expired scores, emits `room_closed`, disconnects sockets in those rooms, deletes room rows, and removes Redis expiration entries.
   - PostgreSQL `ON DELETE CASCADE` removes message history with the room.

This gives the platform two safety rails: expired writes are blocked immediately, and dead rooms are eventually purged even if no user interacts with them.

### Optimistic UI and Message Reconciliation

The frontend emits a locally generated `clientId` with every outbound message:

```ts
const clientId = generateUid()

addOptimisticMessage({
  id: clientId,
  clientId,
  roomId,
  senderId: userId,
  senderName: nickname,
  content,
  createdAt: new Date().toISOString(),
  status: "sending"
})

socket.emit("send_message", { roomId, userId, senderName, content, clientId })
```

The server persists the message, then returns:

```ts
socket.emit("message_ack", {
  clientId,
  message
})
```

The Zustand store replaces the optimistic record with the canonical persisted `MessageDTO` and flips status to `"sent"`. Incoming messages from other users arrive via `new_message` and are merged idempotently.

### Stream Chat SDK Mapping

The reference architecture allows Stream Chat React components to render chat UI while keeping storage, authorization, lifecycle, and channel semantics in the custom backend.

Database DTO:

```ts
type MessageDTO = {
  id: string
  roomId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}
```

Stream-compatible projection:

```ts
function mapToStreamMessage(msg: MessageDTO) {
  return {
    id: msg.id,
    text: msg.content,
    created_at: msg.createdAt,
    user: {
      id: msg.senderId,
      name: msg.senderName
    }
  }
}
```

In that model, Socket.IO feeds a client store, the store projects messages into Stream's rendering shape, and the Stream backend remains unused.

## Message Pagination

Initial room join loads the newest messages:

```sql
SELECT *
FROM messages
WHERE room_id = $1
ORDER BY created_at DESC, id DESC
LIMIT $2;
```

Older history uses the last item from the previous page as a compound cursor:

```sql
SELECT *
FROM messages
WHERE room_id = $1
  AND (
    created_at < $2
    OR (created_at = $2 AND id < $3)
  )
ORDER BY created_at DESC, id DESC
LIMIT $4;
```

The client reverses each history page before prepending it, so the UI remains chronological from top to bottom while fetching older pages on upward scroll.

## Presence and Typing

Presence is implemented with Redis sets:

```txt
presence:room:<roomId>                Set<userId>
presence:room:<roomId>:user:<userId>  Set<socketId>
```

This lets a single user hold multiple socket connections without inflating the room count. `user_count_update` broadcasts the unique-user cardinality after joins and disconnects.

Typing state is implemented with Redis hashes:

```txt
typing:room:<roomId>  Hash<userId, socketId>
```

The hash expires after `10 seconds`. The frontend debounces `typing_stop` by `2 seconds`, which reduces chatter while preserving responsive UX.

## Operational Notes

- **Clock authority**: expiration is enforced on the server using persisted `expireAt`; client clock manipulation cannot authorize writes.
- **Horizontal scale**: Socket.IO uses the Redis adapter, so room broadcasts can cross Node.js instances.
- **Current cleanup cadence**: expiration cleanup runs every `5 seconds` inside the API process.
- **Current room cleanup trigger**: sockets are removed on `disconnect`; `leave_room` is declared in shared types but is not currently handled server-side.
- **CORS**: Socket.IO is restricted to `FRONTEND_URL`; Express currently uses permissive CORS middleware.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run shared watcher, Next.js app, and server concurrently |
| `npm run build` | Build shared package, web app, and server |
| `npm run lint` | Run Biome checks across the repository |
| `npm run format` | Format the repository with Biome |
| `npm run db:push -w server` | Push Drizzle schema to PostgreSQL |
| `npm run db:generate -w server` | Generate Drizzle migrations |
| `npm run db:migrate -w server` | Generate and apply Drizzle migrations |

## Production Deployment

A typical production topology:

```mermaid
flowchart TD
  Users --> V[Vercel / Next.js]
  V --> LB[Load Balancer]
  LB --> N1[Node API Instance]
  LB --> N2[Node API Instance]
  N1 <-->|Socket.IO Redis Adapter| Redis[(Managed Redis)]
  N2 <-->|Socket.IO Redis Adapter| Redis
  N1 --> PG[(Managed PostgreSQL)]
  N2 --> PG
```

Recommended deployment configuration:

- Deploy `apps/web` to Vercel with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` pointing at the backend origin.
- Deploy `apps/server` as a long-running Node.js service; Socket.IO requires a persistent process.
- Use managed PostgreSQL for durable room and message storage.
- Use managed Redis for Socket.IO pub/sub, presence, typing, expiration tracking, and rate limit keys.
- Enable sticky sessions at the load balancer if your platform requires them for long-lived socket transports.

## Roadmap

- Attachments and rich media
- Reactions and lightweight moderation
- First-class authentication
- Server-issued invite links
- Push notifications
- End-to-end encryption
- Dedicated worker process for cleanup and scheduled jobs

## License

MIT License

Copyright (c) 2026 Amir Hossein Noshad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
