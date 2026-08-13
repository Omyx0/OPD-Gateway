import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Contrast, Type, Sparkles, Volume2, Tags, Check } from "lucide-react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getCopy } from "@/mock/i18n";
import { useKioskSession } from "@/state/kiosk-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Settings — Smart OPD Kiosk" },
      {
        name: "description",
        content:
          "Turn on larger text, higher contrast, reduced motion, voice preference and clear labels for the OPD kiosk.",
      },
      { property: "og:title", content: "Accessibility Settings — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Adjust text size, contrast, motion and voice guidance to suit you.",
      },
    ],
  }),
  component: AccessibilityPage,
});

function ToggleRow({
  id,
  icon,
  title,
  hint,
  checked,
  onChange,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <Label htmlFor={id} className="flex items-start gap-4 text-left">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-semibold">{title}</span>
          <span className="block text-sm font-normal text-muted-foreground">{hint}</span>
        </span>
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-describedby={`${id}-hint`}
      />
      <span id={`${id}-hint`} className="sr-only">
        {hint}
      </span>
    </div>
  );
}

function AccessibilityPage() {
  const { session, update } = useKioskSession();
  const t = getCopy(session.language);
  const navigate = useNavigate();

  const voiceOptions = [
    { value: "off" as const, label: t.voiceOff },
    { value: "spoken" as const, label: t.voiceSpoken },
    { value: "slow" as const, label: t.voiceSlow },
  ];

  return (
    <KioskShell step="welcome">
      <h1 className="kiosk-heading">{t.accessibilityTitle}</h1>
      <p className="kiosk-sub mt-3 max-w-2xl text-muted-foreground">{t.accessibilitySub}</p>

      <Card className="mt-8 divide-y divide-border px-6 py-2">
        <ToggleRow
          id="a11y-large-text"
          icon={<Type className="size-5" aria-hidden />}
          title={t.largerText}
          hint={t.largerTextHint}
          checked={session.largeText}
          onChange={(v) => update({ largeText: v })}
        />
        <ToggleRow
          id="a11y-contrast"
          icon={<Contrast className="size-5" aria-hidden />}
          title={t.higherContrast}
          hint={t.higherContrastHint}
          checked={session.highContrast}
          onChange={(v) => update({ highContrast: v })}
        />
        <ToggleRow
          id="a11y-motion"
          icon={<Sparkles className="size-5" aria-hidden />}
          title={t.reducedMotion}
          hint={t.reducedMotionHint}
          checked={session.reducedMotion}
          onChange={(v) => update({ reducedMotion: v })}
        />
        <ToggleRow
          id="a11y-labels"
          icon={<Tags className="size-5" aria-hidden />}
          title={t.clearLabels}
          hint={t.clearLabelsHint}
          checked={session.clearLabels}
          onChange={(v) => update({ clearLabels: v })}
        />
      </Card>

      <fieldset className="mt-8">
        <legend className="flex items-center gap-3 text-lg font-semibold">
          <Volume2 className="size-5 text-primary" aria-hidden />
          {t.voicePreference}
        </legend>
        <p className="mt-1 text-sm text-muted-foreground">{t.voicePreferenceHint}</p>
        <div
          role="radiogroup"
          aria-label={t.voicePreference}
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          {voiceOptions.map((o) => {
            const selected = session.voicePreference === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ voicePreference: o.value })}
                className={cn(
                  "flex min-h-16 items-center justify-between gap-3 rounded-xl border-2 bg-card px-5 text-left text-lg font-medium transition-colors",
                  selected
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border hover:border-teal",
                )}
              >
                {o.label}
                {selected ? <Check className="size-5 text-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-6 text-sm text-muted-foreground">{t.savedLocally}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="kioskLg" onClick={() => navigate({ to: "/register" })}>
          {t.continueLabel}
        </Button>
        <Button variant="outline" size="kioskLg" onClick={() => navigate({ to: "/" })}>
          {t.back}
        </Button>
      </div>
    </KioskShell>
  );
}
