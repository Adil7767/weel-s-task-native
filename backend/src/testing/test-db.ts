import path from "node:path";
import { promises as fs } from "node:fs";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool, schema } from "../db/client";
import config from "../config";
import { hashPassword } from "../utils/password";
import { eq } from "drizzle-orm";

const ensureDrizzleMeta = async (drizzleDir: string) => {
  const metaDir = path.join(drizzleDir, "meta");
  await fs.mkdir(metaDir, { recursive: true });

  const journalPath = path.join(metaDir, "_journal.json");
  const metaPath = path.join(metaDir, "_meta.json");

  const defaultJournal = {
    entries: [],
  };

  const defaultMeta = {
    version: "5",
  };

  try {
    await fs.access(journalPath);
  } catch {
    await fs.writeFile(journalPath, JSON.stringify(defaultJournal, null, 2), "utf-8");
  }

  try {
    await fs.access(metaPath);
  } catch {
    await fs.writeFile(metaPath, JSON.stringify(defaultMeta, null, 2), "utf-8");
  }
};

export const runMigrations = async () => {
  const drizzleDir = path.resolve(process.cwd(), "drizzle");
  const migrationsFolder = drizzleDir;
  await ensureDrizzleMeta(drizzleDir);
  await migrate(db, { migrationsFolder });
};

export const resetData = async () => {
  await db.delete(schema.orders);
  await db.delete(schema.users);

  const passwordHash = await hashPassword(config.seedPassword);

  await db.insert(schema.users).values({
    email: config.seedEmail,
    passwordHash,
    name: "Demo User",
  });
};

export const getTestUser = async () => {
  return db.query.users.findFirst({
    where: eq(schema.users.email, config.seedEmail),
  });
};

export const closePool = async () => {
  await pool.end();
};

