import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Settings2 } from "lucide-react";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { Button } from "@/components/ui/button";
import { KIOSK_LANGUAGES, getCopy } from "@/mock/i18n";
import { useKioskSession } from "@/state/kiosk-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose Your Language — Smart OPD Kiosk" },
      {
        name: "description",
        content:
          "Select English, Hindi or a regional language for the hospital OPD kiosk before registering.",
      },
      { property: "og:title", content: "Choose Your Language — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Pick the language you are most comfortable reading at the OPD kiosk.",
      },
    ],
  }),
  component: LanguagePage,
});

function LanguagePage() {
  const { session, update } = useKioskSession();
  const t = getCopy(session.language);
  const navigate = useNavigate();

  return (
    <KioskShell step="welcome">
      <h1 className="kiosk-heading">{t.languageTitle}</h1>
      <p className="kiosk-sub mt-3 max-w-2xl text-muted-foreground">{t.languageSub}</p>

      <div
        role="radiogroup"
        aria-label={t.languageTitle}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {KIOSK_LANGUAGES.map((lang) => {
          const selected = session.language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ language: lang.code })}
              className={cn(
                "flex min-h-28 items-center justify-between gap-4 rounded-xl border-2 bg-card px-6 py-5 text-left transition-colors",
                selected
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:border-teal",
              )}
            >
              <span className="min-w-0">
                <span className="block text-2xl font-semibold">{lang.native}</span>
                <span className="block text-muted-foreground">{lang.label}</span>
                {lang.note ? (
                  <span className="mt-1 block text-sm text-muted-foreground">{lang.note}</span>
                ) : null}
              </span>
              {selected ? (
                <span className="flex shrink-0 items-center gap-2 text-primary">
                  <Check className="size-6" aria-hidden />
                  <span className="sr-only">{t.selected}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button size="kioskLg" onClick={() => navigate({ to: "/register" })}>
          {t.continueLabel}
        </Button>
        <Button variant="outline" size="kioskLg" onClick={() => navigate({ to: "/accessibility" })}>
          <Settings2 aria-hidden />
          {t.accessibility}
        </Button>
        <Button variant="ghost" size="kioskLg" onClick={() => navigate({ to: "/" })}>
          {t.back}
        </Button>
      </div>
    </KioskShell>
  );
}
