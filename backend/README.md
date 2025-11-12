# Backend Service

Node.js + Express API that powers the Task Delivery Preference experience. Provides authentication, user profile, and order management endpoints backed by Postgres via Drizzle ORM.

## 1. Prerequisites

- Node.js ≥ 20 (for local development)
- npm (ships with Node)
- Postgres 16 (Docker recommended)
- Docker + Docker Compose (optional but recommended for full stack)

## 2. Initial Setup (from scratch)

```bash
git clone <repo-url>
cd Task/backend
cp .env.example .env
npm install
```

### Postgres (local via Docker)

```bash
# From repo root
docker compose up -d db

# Create application + test databases once
docker compose exec db psql -U task -c "CREATE DATABASE task;"
docker compose exec db psql -U task -c "CREATE DATABASE task_test;"
```

## 3. Migrations & Seeds

Build the TypeScript output before running scripts:

```bash
npm run build
npm run migrate   # runs drizzle migrations
npm run seed      # inserts demo user credentials
```

The backend Docker container executes `migrate` + `seed` automatically on startup.

## 4. Run the Server

### Development (tsx with hot reload)

```bash
npm run dev
```

### Production build + start

```bash
npm run build
npm start
```

Server listens on `http://localhost:4000` by default, configurable via `.env`.

## 5. API Overview

- `POST /auth/login` → JWT token + user info
- `GET /me` → current user (requires `Authorization: Bearer <token>`)
- `POST /orders` → create delivery preference (validation enforced)
- `GET /orders/:id`
- `PUT /orders/:id`
- Health check: `GET /health`
- Swagger docs: `GET /docs`

## 6. Testing

Ensure Postgres test DB is running (`task_test`). With Docker DB running:

```bash
npm run test
```

Vitest suite covers login, auth guard, and order validation scenarios.

## 7. Useful Commands

```bash
npm run dev       # start dev server
npm run build     # compile TypeScript
npm run migrate   # run migrations
npm run seed      # seed demo user
npm run test      # run Vitest suite
```

## 8. Environment Variables

Defined in `.env.example` – adjust as needed.

- `APP_PORT`, `DATABASE_URL`, `POSTGRES_*`
- `JWT_SECRET`, `TOKEN_TTL_MINUTES`
- `ALLOW_ORIGINS`, `SEED_EMAIL`, `SEED_PASSWORD`
- `SWAGGER_ENABLED`


