# /A\ ahoj

**Next-Gen Proximity Social Network** — Mobile App + Web + Own Backend

---

## Project Structure

```
ahoj/
├── apps/
│   ├── backend/     # Node.js + Fastify + TypeScript API
│   ├── mobile/      # React Native + Expo mobile app
│   └── web/         # Next.js PWA (Phase 5)
├── packages/
│   └── shared/      # Shared types, Zod schemas, constants
├── docker-compose.yml
└── package.json
```

## Getting Started

### 1. Prerequisites

- Node.js 22+
- pnpm 9+
- Docker Desktop

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start database + Redis

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16 + PostGIS** on port `5432`
- **Redis 7** on port `6379`

### 4. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your values
```

### 5. Run database migrations

```bash
pnpm db:migrate
```

### 6. Start development

```bash
# Both backend + mobile
pnpm dev

# Backend only
pnpm dev:backend

# Mobile only
pnpm dev:mobile
```

Backend runs at: `http://localhost:3000`  
Health check: `http://localhost:3000/health`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo SDK |
| Backend | Node.js + Fastify + TypeScript |
| Database | PostgreSQL 16 + PostGIS |
| Cache | Redis 7 |
| ORM | Drizzle ORM |
| Real-time | Socket.io |
| Auth | JWT (access) + httpOnly cookie (refresh) |
| State | Zustand + TanStack Query |
| Monorepo | pnpm + Turborepo |

---

## API Endpoints

```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout

GET  /users/me
PUT  /users/me
PUT  /users/me/message
PUT  /users/me/location
GET  /users/:id

GET  /feed?lat=&lng=&radius=&limit=

POST /stories
GET  /stories/:userId
POST /stories/:id/view
DELETE /stories/:id

GET  /chats
POST /chats
GET  /chats/:id/messages
POST /chats/:id/messages

POST /access-requests/:targetId
GET  /access-requests/incoming
PUT  /access-requests/:id
```

## Socket.io Events

```
Client → Server:
  location:update { lat, lng }
  chat:join chatId
  chat:leave chatId
  typing:start chatId

Server → Client:
  feed:update [users]
  message:new message
  story:new { userId }
  access:approved { requestId }
```

---

## Development Roadmap

- **Phase 1** (Months 1-2): Auth, Feed, Stories, Privacy modes ← *current*
- **Phase 2** (Months 3-4): In-app chat, Push notifications
- **Phase 3** (Months 5-6): Interest tags, Group stories
- **Phase 4** (Months 7-9): Premium subscription, Events
- **Phase 5** (Months 10-12): AR, Audio stories, Web PWA

---

*ahoj — The Next-Gen Proximity Social Network*
