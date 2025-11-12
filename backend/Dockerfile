FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY tsconfig.json drizzle.config.ts vitest.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/package*.json ./
RUN npm install --omit=dev

COPY --from=base /app/dist ./dist
COPY drizzle ./drizzle

CMD ["sh", "-c", "node dist/src/scripts/migrate.js && node dist/src/scripts/seed.js && node dist/src/index.js"]

