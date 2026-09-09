import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { supabaseAdmin } from "./config/supabase.js";

const server = http.createServer(app);

const clientUrls = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((u) => u.trim()).filter(Boolean)
  : [];

// ── Socket.io ───────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      ...clientUrls,
      "https://opd-gateway.vercel.app",
      "https://opd-gateway-server.vercel.app",
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
      /^https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
  },
});

// ── Socket.io Authentication & Room Management ──────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      // Allow unauthenticated connections (they just won't join role rooms)
      socket.data.role = "ANONYMOUS";
      return next();
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      socket.data.role = "ANONYMOUS";
      return next();
    }

    socket.data.userId = data.user.id;
    socket.data.email = data.user.email;

    // Fetch role from database
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .limit(1);

    socket.data.role = roleData?.[0]?.role ?? "PATIENT";
    next();
  } catch (err) {
    logger.error("Socket auth error", { error: err });
    next(); // Allow connection but without role rooms
  }
});

io.on("connection", (socket) => {
  const { userId, role, email } = socket.data;
  logger.info("Socket connected", { socketId: socket.id, userId, role });

  // Join role-based rooms
  if (role === "STAFF" || role === "ADMIN") {
    socket.join("staff");
    socket.join("doctor"); // Staff also sees doctor events
  }
  if (role === "DOCTOR") {
    socket.join("doctor");
    socket.join("staff"); // Doctor also sees staff events
  }
  if (role === "PATIENT" && userId) {
    socket.join(`patient:${userId}`);
  }
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Handle explicit room join requests
  socket.on("join:department", (departmentId: string) => {
    if (role === "DOCTOR" || role === "STAFF" || role === "ADMIN") {
      socket.join(`department:${departmentId}`);
      logger.debug("Socket joined department room", { socketId: socket.id, departmentId });
    }
  });

  socket.on("disconnect", (reason) => {
    logger.debug("Socket disconnected", { socketId: socket.id, reason });
  });
});

// Make io accessible to route handlers
app.set("io", io);

// ── Start Server ────────────────────────────────────────────────────
server.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
  logger.info(`🔌 API base: http://localhost:${env.PORT}/api/v1`);
  logger.info(`⚡ Socket.io ready with room management`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

export { server, io };

