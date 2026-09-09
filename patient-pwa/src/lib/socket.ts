/**
 * Socket.io client for patient-pwa.
 *
 * Connects patient device to backend real-time stream.
 * Automatically receives:
 * - queue:status-updated
 * - queue:patient-called
 * - notification:new
 */
import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

export function connectPatientSocket(token: string): Socket {
  if (socket?.connected) return socket;

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
    console.log("🔌 Patient Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Patient Socket disconnected:", reason);
  });

  return socket;
}

export function disconnectPatientSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function onPatientQueueCalled(callback: (ticket: any) => void) {
  socket?.on("queue:patient-called", callback);
  return () => {
    socket?.off("queue:patient-called", callback);
  };
}

export function onPatientQueueUpdated(callback: (ticket: any) => void) {
  socket?.on("queue:status-updated", callback);
  return () => {
    socket?.off("queue:status-updated", callback);
  };
}
