import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Info,
  MessageSquareText,
  PhoneCall,
  Search,
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
            Your information is used only to organise today’s OPD visit.
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

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="card-premium p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Info className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Before you join the queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep your photo ID, mobile number and any previous prescription ready. A staff
                member can help if you do not have an ID.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ArrivalItem icon={ClipboardList} title="Register" text="Confirm your details" />
            <ArrivalItem icon={MessageSquareText} title="Tell us" text="Share your symptoms" />
            <ArrivalItem icon={Ticket} title="Wait safely" text="Follow your token" />
          </div>
        </Card>

        <Card className="card-premium p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal">Today at OPD</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Clock3 className="size-5 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">Registration desk</p>
                <p className="text-sm text-muted-foreground">08:00 AM – 04:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Search className="size-5 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">Queue updates</p>
                <p className="text-sm text-muted-foreground">Your token is shown after triage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoneCall className="size-5 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">Need assistance?</p>
                <p className="text-sm text-muted-foreground">
                  Ask the help desk or call 1800-419-0022
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

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

function ArrivalItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ClipboardList;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface p-4">
      <Icon className="size-5 text-primary" aria-hidden />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
