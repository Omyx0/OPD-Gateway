import { env } from "../config/env.js";

type LogLevel = "info" | "warn" | "error" | "debug";

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(formatMessage("info", message, meta));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(formatMessage("warn", message, meta));
  },

  error(message: string, meta?: Record<string, unknown>) {
    console.error(formatMessage("error", message, meta));
  },

  debug(message: string, meta?: Record<string, unknown>) {
    if (env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message, meta));
    }
  },
};
