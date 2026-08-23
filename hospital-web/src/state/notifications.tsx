import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { alertService } from "@/services";
import type { AppNotification, NotificationKind } from "@/services";

interface NotificationsStore {
  notifications: AppNotification[];
  unread: number;
  notify: (input: { kind: NotificationKind; title: string; body: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsStore | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    alertService.getNotifications(),
  );

  const notify = useCallback(
    ({ kind, title, body }: { kind: NotificationKind; title: string; body: string }) => {
      setNotifications((n) => [alertService.createNotification({ kind, title, body }), ...n]);
    },
    [],
  );

  const markRead = useCallback((id: string) => {
    setNotifications((n) => n.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const value = useMemo<NotificationsStore>(
    () => ({
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      notify,
      markRead,
      markAllRead,
      clearAll,
    }),
    [notifications, notify, markRead, markAllRead, clearAll],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
