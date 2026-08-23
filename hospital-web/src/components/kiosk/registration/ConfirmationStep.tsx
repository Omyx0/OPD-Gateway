import { ArrowRight, Pencil, ShieldCheck, IdCard, Keyboard, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Patient, RegistrationMethod } from "@/types/opd";

const METHOD_LABEL: Record<RegistrationMethod, { label: string; icon: typeof IdCard }> = {
  ID_SCAN: { label: "Scanned from ID card", icon: IdCard },
  MANUAL: { label: "Entered manually", icon: Keyboard },
  WALK_IN: { label: "Walk-in, no ID", icon: UserRound },
};

export function ConfirmationStep({
  patient,
  method,
  onConfirm,
  onEdit,
}: {
  patient: Partial<Patient>;
  method: RegistrationMethod;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  const meta = METHOD_LABEL[method];
  const MethodIcon = meta.icon;

  const rows: [string, string | undefined][] = [
    ["Full name", patient.name],
    ["Date of birth", patient.dateOfBirth],
    ["Age", patient.age ? `${patient.age} years` : undefined],
    ["Gender", patient.gender],
    ["Mobile number", patient.phone],
    ["ID number", patient.idNumber || undefined],
    ["Address", patient.address],
    ["Insurance", patient.insuranceProvider],
    ["Policy number", patient.insuranceNumber],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="kiosk-heading">Please check your details</h1>
      <p className="kiosk-sub mt-3 text-muted-foreground">
        Make sure everything below is right before we add you to the queue.
      </p>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <p className="text-lg font-semibold">Patient details</p>
          <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
            <MethodIcon className="size-4" aria-hidden />
            {meta.label}
          </Badge>
        </div>
        <dl className="divide-y divide-border">
          {rows
            .filter(([, v]) => Boolean(v))
            .map(([label, value]) => (
              <div key={label} className="grid gap-1 px-6 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-lg font-medium break-words">{value}</dd>
              </div>
            ))}
        </dl>
      </Card>

      <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Demonstration only — these details stay on this kiosk and are not sent anywhere.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="kioskLg" onClick={onConfirm}>
          Everything is correct
          <ArrowRight aria-hidden />
        </Button>
        <Button variant="outline" size="kioskLg" onClick={onEdit}>
          <Pencil aria-hidden />
          Edit details
        </Button>
      </div>
    </div>
  );
}
