import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { sendSuccess } from "./utils/response.js";
import routes from "./routes/index.js";

const app = express();

// ── Security ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      env.CLIENT_URL,
      "http://localhost:5174",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174"
    ],
    credentials: true,
  })
);

// ── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ─────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// ── Rate Limiting ───────────────────────────────────────────────────
app.use(rateLimit(15 * 60 * 1000, 10000));

// ── Health Check ────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── API Routes ──────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ── Error Handling ──────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
