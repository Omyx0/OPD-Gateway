import { Link } from "@tanstack/react-router";
import { Languages, Settings2, Stethoscope, Type, Contrast, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useKioskSession } from "@/state/kiosk-session";
import { KIOSK_LANGUAGES, getCopy } from "@/mock/i18n";

export function KioskHeader() {
  const { session, update } = useKioskSession();
  const language = KIOSK_LANGUAGES.find((l) => l.code === session.language);
  const t = getCopy(session.language);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:max-w-7xl">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Smart OPD home">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand)] text-primary-foreground shadow-soft sm:size-12">
            <Stethoscope className="size-6" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-semibold leading-tight sm:text-xl">
              {t.brand}
            </span>
            <span className="block truncate text-sm text-muted-foreground">{t.hospital}</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="lg" asChild className="h-12 rounded-2xl px-3 sm:px-4">
            <Link
              to="/language"
              aria-label={`Language: ${language?.label ?? "English"}. Change language`}
            >
              <Languages aria-hidden />
              <span className="font-semibold">{session.language.toUpperCase()}</span>
              <span className="hidden lg:inline font-normal text-muted-foreground">
                {language?.native}
              </span>
            </Link>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="h-12 rounded-2xl px-3 sm:px-4">
                <Settings2 aria-hidden />
                <span className="hidden sm:inline">{t.accessibility}</span>
                <span className="sr-only sm:hidden">{t.accessibility}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <p className="text-base font-semibold">{t.accessibilityTitle}</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="opt-large-text" className="flex items-center gap-2 text-base">
                    <Type className="size-4 text-muted-foreground" aria-hidden />
                    {t.largerText}
                  </Label>
                  <Switch
                    id="opt-large-text"
                    checked={session.largeText}
                    onCheckedChange={(v) => update({ largeText: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="opt-contrast" className="flex items-center gap-2 text-base">
                    <Contrast className="size-4 text-muted-foreground" aria-hidden />
                    {t.higherContrast}
                  </Label>
                  <Switch
                    id="opt-contrast"
                    checked={session.highContrast}
                    onCheckedChange={(v) => update({ highContrast: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="opt-motion" className="flex items-center gap-2 text-base">
                    <Sparkles className="size-4 text-muted-foreground" aria-hidden />
                    {t.reducedMotion}
                  </Label>
                  <Switch
                    id="opt-motion"
                    checked={session.reducedMotion}
                    onCheckedChange={(v) => update({ reducedMotion: v })}
                  />
                </div>
              </div>
              <Button variant="outline" size="lg" asChild className="mt-4 w-full">
                <Link to="/accessibility">{t.accessibilityTitle}</Link>
              </Button>
              <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                {t.savedLocally}
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
