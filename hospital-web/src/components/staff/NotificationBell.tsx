import { AlertTriangle, Bell, CheckCheck, ListOrdered, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/state/notifications";
import type { NotificationKind } from "@/services";

const KIND: Record<NotificationKind, { icon: typeof Bell; label: string; className: string }> = {
  EMERGENCY: {
    icon: AlertTriangle,
    label: "Emergency",
    className: "text-emergency bg-emergency-soft",
  },
  QUEUE: { icon: ListOrdered, label: "Queue update", className: "text-teal bg-teal/10" },
  STAFF_ACTION: { icon: UserCog, label: "Staff action", className: "text-primary bg-primary/10" },
};

export function NotificationBell() {
  const { notifications, unread, markRead, markAllRead, clearAll } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        >
          <Bell aria-hidden />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-emergency px-1 text-[10px] font-bold leading-4 text-emergency-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck aria-hidden />
            Mark all read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            You are all caught up.
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const meta = KIND[n.kind];
                const Icon = meta.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60",
                        !n.read && "bg-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                          meta.className,
                        )}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{n.title}</span>
                          {!n.read ? (
                            <span
                              className="size-2 shrink-0 rounded-full bg-teal"
                              aria-label="Unread"
                            />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{n.body}</span>
                        <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">
                          {meta.label} · {n.time}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}

        <div className="border-t border-border px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
