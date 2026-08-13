import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  LayoutDashboard,
  ListOrdered,
  Moon,
  Sun,
  Users,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStaffStore } from "@/state/staff-store";
import { useStaffAuth } from "@/state/staff-auth";
import { NotificationBell } from "@/components/staff/NotificationBell";
import { ConnectionDemoButton } from "@/components/common/ConnectionBanner";

const nav: { to: string; label: string; icon: typeof Users; exact?: boolean }[] = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/staff/queue", label: "Queue", icon: ListOrdered },
  { to: "/staff/patients", label: "Patients", icon: Users },
  { to: "/staff/departments", label: "Departments", icon: Building2 },
  { to: "/staff/alerts", label: "Alerts", icon: Bell },
  { to: "/staff/analytics", label: "Analytics", icon: BarChart3 },
];

// Bottom bar keeps the five highest-traffic destinations on phones.
const mobileNav = nav.filter((i) => i.label !== "Departments");

export function StaffShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { alerts } = useStaffStore();
  const { user, signOut } = useStaffAuth();
  const unread = alerts.filter((a) => !a.acknowledged).length;

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div className={cn("flex min-h-dvh bg-background")}>
      <a href="#staff-main" className="skip-link">
        Skip to main content
      </a>
      <aside
        aria-label="Staff navigation"
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all md:flex",
          "m-3 mr-0 h-[calc(100dvh-1.5rem)] rounded-3xl shadow-lift",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-3 px-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="size-5" aria-hidden />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate font-semibold leading-tight">Smart OPD</span>
              <span className="block truncate text-xs text-sidebar-foreground/60">
                Operations
              </span>
            </span>
          ) : null}
        </div>
        <nav className="flex-1 space-y-1.5 p-3">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-sidebar-accent/40",
                  )}
                >
                  <item.icon className="size-4" aria-hidden />
                </span>
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
                {item.label === "Alerts" && unread > 0 ? (
                  <span
                    className={cn(
                      "rounded-full bg-emergency px-2 py-0.5 text-xs font-semibold text-emergency-foreground",
                      collapsed ? "sr-only" : "ml-auto",
                    )}
                  >
                    {unread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start rounded-2xl text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu aria-hidden />
            {!collapsed ? "Collapse" : null}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border/70 bg-background/85 px-3 backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="min-h-11 min-w-11 rounded-2xl md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b border-border p-4 text-left">
                  <SheetTitle>Smart OPD</SheetTitle>
                </SheetHeader>
                <nav aria-label="Staff navigation" className="space-y-1 p-3">
                  {nav.map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-2xl px-3 text-base font-medium",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary/60",
                        )}
                      >
                        <item.icon className="size-5 shrink-0" aria-hidden />
                        {item.label}
                        {item.label === "Alerts" && unread > 0 ? (
                          <span className="ml-auto rounded-full bg-emergency px-2 py-0.5 text-xs font-semibold text-emergency-foreground">
                            {unread}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <p className="hidden truncate text-sm text-muted-foreground lg:block">
              OPD Operations — City General Hospital
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ConnectionDemoButton className="hidden xl:inline-flex" />
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
            </Button>
            <Button variant="outline" size="sm" className="hidden rounded-2xl sm:inline-flex" asChild>
              <Link to="/">Kiosk view</Link>
            </Button>
            <span className="hidden text-sm font-medium lg:block">{user?.name ?? "Staff"}</span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              onClick={signOut}
              aria-label="Sign out"
            >
              <LogOut aria-hidden />
            </Button>
          </div>
        </header>
        <main
          id="staff-main"
          tabIndex={-1}
          className="min-w-0 flex-1 p-3 pb-28 sm:p-4 md:pb-6 lg:p-6"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation (app-like) */}
      <nav
        aria-label="Staff quick navigation"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/90 backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-1.5">
          {mobileNav.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-2xl transition-colors",
                      active && "bg-primary/12",
                    )}
                  >
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.label === "Alerts" && unread > 0 ? (
                    <span className="absolute right-2 top-1 size-2 rounded-full bg-emergency" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
