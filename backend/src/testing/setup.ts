import "dotenv/config";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-secret-key-change-me";
process.env.POSTGRES_HOST ??= "localhost";
process.env.POSTGRES_PORT ??= "5432";
process.env.POSTGRES_USER ??= "task";
process.env.POSTGRES_PASSWORD ??= "task";
process.env.POSTGRES_DB ??= "task_test";
process.env.DATABASE_URL ??=
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

