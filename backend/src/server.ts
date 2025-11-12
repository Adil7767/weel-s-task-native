import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";
import meRouter from "./routes/me";
import config from "./config";
import swaggerSpec from "./swagger/spec";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.allowOrigins.length > 0 ? config.allowOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/orders", ordersRouter);
  app.use("/me", meRouter);

  if (config.swaggerEnabled) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
  });

  return app;
};

const app = createApp();

export default app;

