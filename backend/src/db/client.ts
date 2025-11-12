import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import config from "../config";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

const db = drizzle(pool, { schema });

export { db, pool, schema };

