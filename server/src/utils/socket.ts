/**
 * Socket.io event helper.
 *
 * Provides typed helpers to emit events through the io instance
 * stored on the Express app. Centralises event names so they stay
 * consistent between server and any future client SDK.
 */
import type { Application } from "express";
import type { Server as SocketIOServer } from "socket.io";
import { logger } from "./logger.js";

function getIO(app: Application): SocketIOServer | null {
  const io = app.get("io") as SocketIOServer | undefined;
  if (!io) {
    logger.warn("Socket.io instance not found on app");
    return null;
  }
  return io;
}

// ── Queue Events ────────────────────────────────────────────────────

export function emitQueueNewTicket(app: Application, ticket: Record<string, unknown>) {
  const io = getIO(app);
  if (!io) return;
  io.to("staff").to("doctor").emit("queue:new-ticket", ticket);
  logger.debug("Emitted queue:new-ticket", { ticketId: ticket.id });
}

export function emitQueueStatusUpdated(app: Application, ticket: Record<string, unknown>) {
  const io = getIO(app);
  if (!io) return;
  io.to("staff").to("doctor").emit("queue:status-updated", ticket);
  // Also notify the specific patient if we know their user id
  if (ticket.patientUserId) {
    io.to(`patient:${ticket.patientUserId}`).emit("queue:status-updated", ticket);
  }
  logger.debug("Emitted queue:status-updated", { ticketId: ticket.id, status: ticket.status });
}

export function emitQueuePatientCalled(app: Application, ticket: Record<string, unknown>) {
  const io = getIO(app);
  if (!io) return;
  io.to("staff").to("doctor").emit("queue:patient-called", ticket);
  if (ticket.patientUserId) {
    io.to(`patient:${ticket.patientUserId}`).emit("queue:patient-called", ticket);
  }
  logger.debug("Emitted queue:patient-called", { ticketId: ticket.id });
}

// ── Alert Events ────────────────────────────────────────────────────

export function emitAlertNew(app: Application, alert: Record<string, unknown>) {
  const io = getIO(app);
  if (!io) return;
  io.to("staff").to("doctor").emit("alert:new", alert);
  logger.debug("Emitted alert:new", { alertId: alert.id });
}

// ── Notification Events ─────────────────────────────────────────────

export function emitNotification(app: Application, userId: string, notification: Record<string, unknown>) {
  const io = getIO(app);
  if (!io) return;
  io.to(`patient:${userId}`).to(`user:${userId}`).emit("notification:new", notification);
  logger.debug("Emitted notification:new", { userId, notificationId: notification.id });
}
