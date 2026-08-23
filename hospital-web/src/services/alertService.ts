/**
 * alertService — emergency alerts and staff notifications.
 *
 * MOCK IMPLEMENTATION. Alerts and notifications are seeded from local mock
 * data and raised in memory. A future backend maps to `GET /alerts`,
 * `POST /alerts/:id/acknowledge` and `GET /notifications`.
 */
import { MOCK_ALERTS } from "@/mock/opd";
import { MOCK_NOTIFICATIONS, timeNow } from "@/mock/notifications";
import type {
  AppNotification,
  EmergencyAlert,
  NotificationKind,
  QueueEntry,
} from "@/services/types";

export interface AlertService {
  /** GET /alerts — initial snapshot used to seed local state. */
  getAlerts(): EmergencyAlert[];
  /** POST /alerts — the alert a red-priority intake would raise. */
  createAlertForEntry(entry: QueueEntry, message: string): EmergencyAlert;
  /** POST /alerts/:id/acknowledge — pure helper on a local list. */
  applyAcknowledged(alerts: EmergencyAlert[], id: string): EmergencyAlert[];
  /** GET /notifications */
  getNotifications(): AppNotification[];
  /** Builds a notification record with a local timestamp. */
  createNotification(input: {
    kind: NotificationKind;
    title: string;
    body: string;
  }): AppNotification;
}

export const alertService: AlertService = {
  getAlerts() {
    return MOCK_ALERTS;
  },

  createAlertForEntry(entry, message) {
    return {
      id: `al-${entry.id}`,
      token: entry.token,
      department: entry.department,
      message,
      raisedAt: entry.arrivalTime,
      acknowledged: false,
    };
  },

  applyAcknowledged(alerts, id) {
    return alerts.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert));
  },

  getNotifications() {
    return MOCK_NOTIFICATIONS;
  },

  createNotification({ kind, title, body }) {
    return {
      id: `n-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      kind,
      title,
      body,
      time: timeNow(),
      read: false,
    };
  },
};
