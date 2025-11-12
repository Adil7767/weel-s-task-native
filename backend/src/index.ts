import app from "./server";
import config from "./config";
import { pool } from "./db/client";

const server = app.listen(config.port, () => {
  console.log(`Backend listening on port ${config.port}`);
});

const gracefulShutdown = async () => {
  console.log("Shutting down server...");
  server.close(async () => {
    await pool.end();
    console.log("Database connection pool closed.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

