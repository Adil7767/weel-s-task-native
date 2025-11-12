import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      `postgres://${process.env.POSTGRES_USER || "task"}:${process.env.POSTGRES_PASSWORD || "task"}@${
        process.env.POSTGRES_HOST || "db"
      }:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DB || "task"}`,
  },
});

