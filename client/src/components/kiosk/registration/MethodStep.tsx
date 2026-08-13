import { IdCard, Keyboard, UserRound, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RegistrationMethod } from "@/types/opd";

const OPTIONS: {
  method: RegistrationMethod;
  icon: LucideIcon;
  title: string;
  text: string;
  hint: string;
}[] = [
  {
    method: "ID_SCAN",
    icon: IdCard,
    title: "Scan ID",
    text: "Hold your ID card in front of the kiosk camera.",
    hint: "Fastest — about 30 seconds",
  },
  {
    method: "MANUAL",
    icon: Keyboard,
    title: "Enter details manually",
    text: "Type your name, date of birth and mobile number.",
    hint: "Use this if your card is damaged",
  },
  {
    method: "WALK_IN",
    icon: UserRound,
    title: "Continue without ID (walk-in)",
    text: "Register with just a name and mobile number.",
    hint: "Staff can add your ID later",
  },
];

export function MethodStep({ onSelect }: { onSelect: (m: RegistrationMethod) => void }) {
  return (
    <div>
      <h1 className="kiosk-heading">How would you like to register?</h1>
      <p className="kiosk-sub mt-3 max-w-2xl text-muted-foreground">
        Choose one option to continue. You can change this at any time.
      </p>

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {OPTIONS.map((o) => (
          <li key={o.method}>
            <button
              type="button"
              onClick={() => onSelect(o.method)}
              className="flex h-full min-h-56 w-full flex-col items-start gap-3 rounded-xl border-2 border-border bg-card p-7 text-left transition-colors hover:border-teal focus-visible:border-teal"
            >
              <span className="flex size-14 items-center justify-center rounded-xl bg-surface text-primary">
                <o.icon className="size-7" aria-hidden />
              </span>
              <span className="text-2xl font-semibold leading-tight">{o.title}</span>
              <span className="text-muted-foreground">{o.text}</span>
              <span className="mt-auto flex items-center gap-2 pt-3 text-sm font-medium text-teal">
                {o.hint}
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
