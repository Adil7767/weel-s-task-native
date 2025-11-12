import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db/client";

async function runMigrations() {
  try {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void runMigrations();

