# 🚀 Ahoj Monorepo — Single Source of Truth for Deployment Needs

This document contains all technical requirements, infrastructure dependencies, environment variables, third-party API keys, database setup steps, and release procedures for deploying the **ahoj** proximity social network.

> [!IMPORTANT]
> **Maintenance Directive**: Every time environment keys, database schemas, third-party auth providers, or deployment dependencies change in the codebase, this file MUST be updated immediately to remain the single source of truth.

---

## 📋 1. System Requirements & Infrastructure Stack

| Component | Technology / Service | Minimum Version / Spec |
| :--- | :--- | :--- |
| **Runtime** | Node.js + pnpm | Node.js 22+, pnpm 9+ |
| **Database** | PostgreSQL + PostGIS | PostgreSQL 16 with `postgis` extension |
| **Cache & Real-time** | Redis | Redis 7+ (Spatial index + Socket.io PubSub) |
| **Containers** | Docker & Docker Compose | Docker Engine 24+ |
| **Mobile Build** | Expo EAS CLI | `eas-cli` 12+ |
| **Web Host** | Next.js (Node server or Vercel) | Next.js 16+ |

---

## 🔑 2. Required Environment Variables (`.env`)

Create `apps/backend/.env` (and set variables in your cloud provider environment):

```env
# ─── 1. SERVER CONFIGURATION ───────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://ahoj.app,http://localhost:3001

# ─── 2. DATABASE & CACHE ───────────────────────────────────────────────────────
DATABASE_URL=postgresql://ahoj_user:ahoj_password@localhost:5432/ahoj_db
REDIS_URL=redis://localhost:6379

# ─── 3. JWT SECURITY ──────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=your-super-secret-access-token-key-at-least-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-at-least-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# ─── 4. GLOBAL 3RD PARTY OAUTH PROVIDERS ──────────────────────────────────────
# 🇺🇸 US Providers
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=com.martasko14.ahoj.sid
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY_PATH=./keys/AuthKey_APPLE.p8
META_APP_ID=your-facebook-meta-app-id
META_APP_SECRET=your-facebook-meta-app-secret

# 🇪🇺 EU Providers
NETID_CLIENT_ID=your-netid-client-id
NETID_CLIENT_SECRET=your-netid-client-secret

# 🇷🇺 RU Providers
VK_CLIENT_ID=your-vk-app-id
VK_CLIENT_SECRET=your-vk-app-secret
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret

# 🌏 Asia Providers
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
KAKAO_REST_API_KEY=your-kakao-rest-api-key

# ─── 5. FILE UPLOADS & OBJECT STORAGE (S3 / R2) ──────────────────────────────
S3_BUCKET=ahoj-media-uploads
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# ─── 6. PUSH NOTIFICATIONS ────────────────────────────────────────────────────
FCM_SERVER_KEY=your-firebase-cloud-messaging-server-key
```

---

## 🗄️ 3. Database Initialization & Migrations

PostgreSQL requires the `postgis` extension enabled before running migrations:

```sql
-- Run inside PostgreSQL instance
CREATE EXTENSION IF NOT EXISTS postgis;
```

Run Drizzle schema migration from the monorepo root:
```bash
# Push schema to target database
pnpm --filter @ahoj/backend db:push

# (Optional) Seed demo users and initial proximity location data
pnpm --filter @ahoj/backend db:seed
```

---

## 🐳 4. Production Deployment with Docker Compose

Deploy the backend, database, and Redis cluster using Docker:

```bash
# Build and start services in detached mode
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 📱 5. Mobile App Release (Android & iOS)

### Prerequisites:
Install EAS CLI globally and configure `app.json`:
```bash
npm install -g eas-cli
cd apps/mobile
eas login
eas build:configure
```

### Android Build:
* **APK (Internal Testing / Family Sharing)**:
  ```bash
  eas build --platform android --profile preview
  ```
* **AAB (Google Play Store Release)**:
  ```bash
  eas build --platform android --profile production
  ```

### iOS Build (App Store):
* **IPA (TestFlight / App Store)**:
  ```bash
  eas build --platform ios --profile production
  ```
> [!IMPORTANT]
> **Apple Store Guideline 4.8**: If your app uses 3rd-party logins (Google, Meta, etc.), Apple requires **Sign in with Apple** to be offered as an equivalent option on iOS.

---

## ⚖️ 6. Regional Compliance & Privacy Rules

1. **Russian Data Localization (Law 152-FZ)**:
   Personal data of Russian citizens must be stored on servers physically located within Russia. For Russian production deployment, host a database replica in a Moscow datacenter.
2. **EU GDPR**:
   * EXIF metadata must be stripped from all uploaded photos before storage.
   * Account deletion (`DELETE /users/me`) must purge all historical telemetry and media files.

---

## 📝 7. Changelog & Modification Log

| Date | Changed By | Description of Change |
| :--- | :--- | :--- |
| **2026-07-22** | Antigravity AI | Added 1:1 Web Story Media Editor with live filter previews, image file upload, and Distance Radar Ring view to Web App (`/app`). |
| **2026-07-22** | Antigravity AI | Fixed Sparks DB enum casting (`::spark_category`), parsed/rendered filters & text in story viewer, and structured mobile camera editor into 3-part layout with AntD outline icons and right-aligned toolbar. |
| **2026-07-22** | Antigravity AI | Enforced `/app` Web Auth Guard (`localStorage.getItem("accessToken")`), 1:1 Fastify API integration, Socket.io real-time chat, Sparks meetups, and Expo Go SDK 53 notification import workaround. |
| **2026-07-22** | Antigravity AI | Initial creation of unified single-source `DEPLOYMENT.md` capturing 3rd party OAuth keys, PostGIS steps, Docker setup, and EAS Android/iOS release needs. |
