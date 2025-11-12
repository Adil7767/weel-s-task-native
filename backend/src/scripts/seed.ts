import { eq } from "drizzle-orm";
import config from "../config";
import { db, pool, schema } from "../db/client";
import { hashPassword } from "../utils/password";

async function seed() {
  try {
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, config.seedEmail),
    });

    if (existing) {
      console.log(`Seed user ${config.seedEmail} already exists. Skipping creation.`);
      return;
    }

    const passwordHash = await hashPassword(config.seedPassword);

    await db.insert(schema.users).values({
      email: config.seedEmail,
      passwordHash,
      name: "Demo User",
    });

    console.log(`Seed user created (${config.seedEmail} / ${config.seedPassword})`);
  } catch (error) {
    console.error("Seeding failed", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void seed();

