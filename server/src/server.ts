import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);

// ── Socket.io ───────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:5176",
      /^http:\/\/localhost:[0-9]+$/,
      /^http:\/\/127\.0\.0\.1:[0-9]+$/,
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("Socket connected", { socketId: socket.id });

  socket.on("disconnect", (reason) => {
    logger.debug("Socket disconnected", { socketId: socket.id, reason });
  });
});

// Make io accessible to route handlers if needed
app.set("io", io);

// ── Start Server ────────────────────────────────────────────────────
server.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
  logger.info(`🔌 API base: http://localhost:${env.PORT}/api/v1`);
  logger.info(`⚡ Socket.io ready`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

export { server, io };
