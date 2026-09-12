import cookieParser from "cookie-parser";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { requestLogger } from "@/middlewares/request-logger.middleware";
import logger from "./utils/core/logger";
import {
  metricsMiddleware,
  metricsHandler,
} from "@/middlewares/matrics.middleware";

const app = express();

app.use(metricsMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || true,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.use("/api", routes);

// Metrics prometheus
app.get("/metrics", metricsHandler);

// Health Check Route for Docker/Jenkins
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("SITAKO API is running!");
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;
