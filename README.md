# Task Delivery Preference App

Full-stack engineering challenge implementing a delivery-preference flow end to end. The stack uses a Node.js/Express backend, Drizzle ORM with Postgres, and a React Native (Expo) frontend. Everything runs through Docker Compose.

This root README gives a high-level overview. Detailed setup steps per project live in:

- `backend/README.md`
- `frontend/README.md`

## Table of Contents

1. [Architecture](#architecture)
2. [Requirements Checklist](#requirements-checklist)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [Running with Docker Compose](#running-with-docker-compose)
6. [Running Locally without Docker](#running-locally-without-docker)
7. [Testing](#testing)
8. [API Reference](#api-reference)
9. [Frontend Flow](#frontend-flow)
10. [Optional AI Ideas](#optional-ai-ideas)
11. [Future Improvements](#future-improvements)

---

## Architecture

- **Backend (`backend/`)**
  - Node.js + Express + TypeScript
  - Drizzle ORM + pg (Postgres)
  - JWT auth (`/auth/login`, `/me`)
  - Orders CRUD (`/orders`, `/orders/:id`)
  - Validation with Zod
  - Swagger docs at `/docs`
  - Migrations + seeds (`drizzle/0001_init.sql`, seed user)

- **Frontend (`frontend/`)**
  - Expo SDK 54 / React Native 0.81
  - React Navigation with stack navigator
  - Global auth context (token persistence via AsyncStorage)
  - Forms with React Hook Form + Zod
  - Screens: Login → Delivery Preference → Summary
  - Conditional fields per delivery type, future datetime enforcement
  - Summary screen supports refresh + editing + sign-out

- **Database**
  - Postgres 16 (Docker container)
  - Schema managed via Drizzle migrations

- **Docker**
  - `docker-compose.yml` runs Postgres, backend, frontend
  - Backend container runs migrations + seeds before booting
  - Frontend container starts Expo web server (port 8081)

---

## Requirements Checklist

- [x] Login flow with email/password, inline validation, auth guards
- [x] Delivery preference screen with `IN_STORE`, `DELIVERY`, `CURBSIDE`
  - Conditional fields (address/pickup/vehicle info)
  - Future datetime validation
- [x] Summary screen with edit + sign out
- [x] State persistence (token + order draft) via AsyncStorage
- [x] Backend JWT auth, validation, Postgres migrations, seed user
- [x] Docker Compose for backend, frontend, Postgres
- [x] Backend tests (login, guards, order validation)
- [ ] Frontend tests (framework set up; test cases TBD)
- [ ] Optional AI feature (ideas listed below)

---

## Prerequisites

To run everything locally you’ll need:

- Docker + Docker Compose (for full stack / DB)
- Node.js ≥ 20 (if you want to run backend/frontend outside Docker)
- npm (ships with Node)

---

## Environment Configuration

Copy the example environment files and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Defaults:

- Backend: JWT secret, Postgres credentials, seed user/password, allowed CORS origins.
- Frontend: `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:4000`).

---

## Running with Docker Compose

### 1. Build & start the full stack

```bash
docker compose up --build
```

Services:

- `db`: Postgres (exposed at `localhost:5432`)
- `backend`: API with Swagger docs at `http://localhost:4000/docs`
- `frontend`: Expo web at `http://localhost:8081`

Logs stream in the same terminal. Use `Ctrl+C` to stop; add `-d` to run detached.

> **Note:** If you see `permission denied` when Compose tries to talk to `/var/run/docker.sock`:
> - **Ubuntu/Linux:** run with `sudo` (`sudo docker compose up --build`) or add your user to the `docker` group (`sudo usermod -aG docker $USER`) and re-login.
> - **macOS (Docker Desktop):** ensure Docker Desktop is running and that the Tech Preview is turned off; if the socket is still blocked, restart Docker Desktop or sign out/in.

### 2. Seed user

Seeding runs automatically when the backend container starts (script in `backend/src/scripts/seed.ts`). Default credentials:

- Email: `demo@task.io`
- Password: `Password123!`

### 3. Tear down

```bash
docker compose down
```

Add `--volumes` if you want to remove the Postgres data volume.

---

## Running Locally without Docker

### Database

Start a Postgres instance (native or Docker). Example using existing compose service:

```bash
docker compose up -d db
```

Create databases (once):

```bash
docker exec -it task-db-1 psql -U task -c "CREATE DATABASE task;"
docker exec -it task-db-1 psql -U task -c "CREATE DATABASE task_test;"
```

### Backend

```bash
cd backend
npm install
npm run dev
```

The dev server uses tsx with hot reload. Migrations + seeds can be run manually:

```bash
npm run build
npm run migrate
npm run seed
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Expo CLI will show options to open the web app, Android emulator, or iOS simulator.

---

## Testing

### Backend Tests (Vitest)

Ensure the Postgres test database is available (see above), then:

```bash
cd backend
npm run test
```

The test setup seeds the user before each test and resets tables.

### Frontend Tests

Testing library + Jest configuration is in place (`npm test`), but no specs are written yet. Add tests under `frontend/src/__tests__/`.

---

## API Reference

Swagger docs: `http://localhost:4000/docs`

- `POST /auth/login` – returns `{ token, user }`
- `GET /me` – requires `Authorization: Bearer <token>`
- `POST /orders` – create order (enforces future datetime & conditional fields)
- `GET /orders/:id`
- `PUT /orders/:id`

All order routes require a valid JWT.

---

## Frontend Flow

1. **Login Screen**
   - Validates email/password inline using Zod.
   - On success, stores token + user in AsyncStorage and navigates to Delivery Preference.

2. **Delivery Preference Screen**
   - Tabbed options for delivery type (in-store, delivery, curbside).
   - Each type reveals required conditional fields.
   - Date picker enforces future time (native `@react-native-community/datetimepicker`).
   - Draft is auto-saved to AsyncStorage; rehydrated on return.
   - On submit: creates or updates order, clears draft, and navigates to Summary.

3. **Summary Screen**
   - Fetches order by ID, allows refresh via pull-down.
   - Edit button saves current order as a draft and navigates back to preference screen.
   - Sign out clears auth state and returns to login.

---

## Optional AI Ideas

Not implemented due to time, but backend/front-end architecture can support:

- Suggesting the next available time slot (OpenAI function call from backend)
- Autocompleting delivery instructions
- Rewriting error messages for clarity
- Generating a conversational summary of the order

Would require an OpenAI API key + backend proxy endpoint (keep key server-side, mock responses in tests).

---

## Future Improvements

- Add frontend test coverage (React Native Testing Library) for:
  - Login → navigation guards
  - Conditional field visibility
  - Future datetime validation
  - Summary consistency after edits
- Improve error handling UX (inline API errors, loading states)
- Add optimistic updates / caching on the frontend
- Support multiple orders per user
- Per-environment config for CORS/hosts
- Optional AI feature as described above

---

## Useful Commands Summary

```bash
# Docker-based workflow
docker compose up --build      # start everything
docker compose down            # stop

# Backend local dev
cd backend
npm install
npm run dev                    # start dev server
npm run build                  # compile TypeScript
npm run migrate                # run migrations (requires build)
npm run seed                   # seed database (requires build)
npm run test                   # Vitest suite (needs Postgres running)

# Frontend local dev
cd frontend
npm install
npm start                      # Expo dev server
npm run test                   # Jest (once tests are added)
```

Happy hacking! 🎉

# weel-s-task-native
# weel-s-task-native
