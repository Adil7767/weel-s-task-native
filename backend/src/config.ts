import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z
    .string()
    .default("4000")
    .transform((value) => {
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) {
        throw new Error(`APP_PORT must be a number, received ${value}`);
      }
      return parsed;
    }),
  DATABASE_URL: z
    .string()
    .default(() => {
      const user = process.env.POSTGRES_USER ?? "task";
      const password = process.env.POSTGRES_PASSWORD ?? "task";
      const host = process.env.POSTGRES_HOST ?? "db";
      const port = process.env.POSTGRES_PORT ?? "5432";
      const dbName = process.env.POSTGRES_DB ?? "task";
      return `postgres://${user}:${password}@${host}:${port}/${dbName}`;
    }),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters long"),
  TOKEN_TTL_MINUTES: z
    .string()
    .default("1440")
    .transform((raw) => {
      const parsed = Number.parseInt(raw, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error("TOKEN_TTL_MINUTES must be a positive integer");
      }
      return parsed;
    }),
  ALLOW_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean) ?? []
    ),
  SEED_EMAIL: z.string().email().default("demo@task.io"),
  SEED_PASSWORD: z.string().min(8).default("Password123!"),
  SWAGGER_ENABLED: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration validation failed", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  tokenTtlMinutes: number;
  allowOrigins: string[];
  seedEmail: string;
  seedPassword: string;
  swaggerEnabled: boolean;
};

const config: AppConfig = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.APP_PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  tokenTtlMinutes: parsed.data.TOKEN_TTL_MINUTES,
  allowOrigins: parsed.data.ALLOW_ORIGINS ?? [],
  seedEmail: parsed.data.SEED_EMAIL,
  seedPassword: parsed.data.SEED_PASSWORD,
  swaggerEnabled: parsed.data.SWAGGER_ENABLED ?? true,
};

export default config;

