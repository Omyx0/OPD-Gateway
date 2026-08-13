import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareText,
  Ticket,
  ShieldCheck,
  Languages,
  Settings2,
  LifeBuoy,
} from "lucide-react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKioskSession } from "@/state/kiosk-session";
import { DemoScenarioBar } from "@/components/common/DemoScenarioBar";
import { getCopy } from "@/mock/i18n";
import kioskHero from "@/assets/kiosk-hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart OPD Kiosk — Register & Get Your Queue Token" },
      {
        name: "description",
        content:
          "Register at the hospital OPD kiosk, describe your symptoms, and receive a queue token with an estimated waiting time.",
      },
      { property: "og:title", content: "Smart OPD Kiosk — Register & Get Your Queue Token" },
      {
        property: "og:description",
        content:
          "Calm, accessible hospital OPD kiosk for registration, symptom triage and queue tokens.",
      },
    ],
  }),
  component: WelcomePage,
});

const stepIcons = [ClipboardList, MessageSquareText, Ticket];

function WelcomePage() {
  const { session } = useKioskSession();
  const t = getCopy(session.language);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <KioskShell step="welcome">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">{t.eyebrow}</p>
          <h1 className="kiosk-heading mt-3">{t.welcomeTitle}</h1>
          <p className="kiosk-sub mt-5 max-w-xl text-muted-foreground">{t.welcomeSub}</p>

          <div className="mt-9">
            <Button size="kioskLg" asChild className="w-full sm:w-auto">
              <Link to="/register">
                {t.start}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="outline" size="kiosk" asChild className="sm:min-w-44">
              <Link to="/language">
                <Languages aria-hidden />
                {t.language}
              </Link>
            </Button>
            <Button variant="outline" size="kiosk" asChild className="sm:min-w-44">
              <Link to="/accessibility">
                <Settings2 aria-hidden />
                {t.accessibility}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="kiosk"
              className="sm:min-w-44"
              onClick={() => setHelpOpen(true)}
            >
              <LifeBuoy aria-hidden />
              {t.help}
            </Button>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" aria-hidden />
            {t.demoNote}
          </p>
        </div>

        <div className="space-y-5">
          <div className="surface-brand relative overflow-hidden rounded-3xl p-5 sm:p-6">
            <div className="relative z-10 max-w-[62%]">
              <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
                {t.hospital}
              </p>
              <p className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{t.brand}</p>
              <p className="mt-2 text-sm opacity-85">{t.eyebrow}</p>
            </div>
            <img
              src={kioskHero}
              alt=""
              aria-hidden
              loading="lazy"
              width={1024}
              height={1024}
              className="pointer-events-none absolute -bottom-3 right-0 h-[125%] w-auto max-w-[46%] object-contain opacity-95"
            />
          </div>

          <Card className="card-premium divide-y divide-border/70 p-2">
            {t.steps.map((s, i) => {
              const Icon = stepIcons[i]!;
              return (
                <div key={s.title} className="flex items-start gap-4 p-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold">
                      {i + 1}. {s.title}
                    </p>
                    <p className="text-muted-foreground">{s.text}</p>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

      </div>

      <DemoScenarioBar />

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.helpTitle}</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              {t.helpBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button size="lg" onClick={() => setHelpOpen(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </KioskShell>
  );
}
