/**
 * Socket.io client for hospital-web.
 *
 * Connects to the backend with JWT auth, joins role-based rooms,
 * and provides typed event listeners for real-time updates.
 */
import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

const WS_URL = API_URL.replace("/api/v1", "").replace("https://", "wss://").replace("http://", "ws://");

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  // Close existing socket if any
  if (socket) {
    socket.disconnect();
  }

  const baseUrl = API_URL.replace("/api/v1", "");
  socket = io(baseUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket.io connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket.io disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.warn("🔌 Socket.io connection error:", error.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ── Typed event listeners ────────────────────────────────────────────

export interface QueueTicketEvent {
  id: string;
  token: string;
  priority: string;
  status: string;
  arrival_time: string;
  department_id?: string;
  patientUserId?: string;
}

export interface AlertEvent {
  id: string;
  type: string;
  message: string;
  status: string;
}

export interface NotificationEvent {
  id: string;
  title: string;
  message: string;
  type: string;
}

export function onQueueNewTicket(callback: (ticket: QueueTicketEvent) => void) {
  socket?.on("queue:new-ticket", callback);
  return () => { socket?.off("queue:new-ticket", callback); };
}

export function onQueueStatusUpdated(callback: (ticket: QueueTicketEvent) => void) {
  socket?.on("queue:status-updated", callback);
  return () => { socket?.off("queue:status-updated", callback); };
}

export function onQueuePatientCalled(callback: (ticket: QueueTicketEvent) => void) {
  socket?.on("queue:patient-called", callback);
  return () => { socket?.off("queue:patient-called", callback); };
}

export function onAlertNew(callback: (alert: AlertEvent) => void) {
  socket?.on("alert:new", callback);
  return () => { socket?.off("alert:new", callback); };
}

export function onNotificationNew(callback: (notification: NotificationEvent) => void) {
  socket?.on("notification:new", callback);
  return () => { socket?.off("notification:new", callback); };
}
