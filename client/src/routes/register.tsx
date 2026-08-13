import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { MethodStep } from "@/components/kiosk/registration/MethodStep";
import { IdScanStep } from "@/components/kiosk/registration/IdScanStep";
import { ManualRegistrationStep } from "@/components/kiosk/registration/ManualRegistrationStep";
import { ConfirmationStep } from "@/components/kiosk/registration/ConfirmationStep";
import { useKioskSession } from "@/state/kiosk-session";
import type { Patient, RegistrationMethod } from "@/types/opd";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Patient Registration — Smart OPD Kiosk" },
      {
        name: "description",
        content:
          "Scan your ID, enter details manually, or register as a walk-in patient, then confirm your details for the OPD queue.",
      },
      { property: "og:title", content: "Patient Registration — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Scan your ID or type your details, then confirm them before joining the queue.",
      },
    ],
  }),
  component: RegisterPage,
});

type Stage = "method" | "scan" | "manual" | "confirm";

function RegisterPage() {
  const { session, update } = useKioskSession();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("method");
  const [method, setMethod] = useState<RegistrationMethod>(session.registrationMethod ?? "MANUAL");
  const [patient, setPatient] = useState<Partial<Patient>>(session.patient);

  function chooseMethod(next: RegistrationMethod) {
    setMethod(next);
    update({ registrationMethod: next });
    setStage(next === "ID_SCAN" ? "scan" : "manual");
  }

  function accept(next: Partial<Patient>, from: RegistrationMethod) {
    setPatient(next);
    setMethod(from);
    update({ registrationMethod: from, patient: next });
    setStage("confirm");
  }

  return (
    <KioskShell step="registration">
      {stage === "method" ? <MethodStep onSelect={chooseMethod} /> : null}

      {stage === "scan" ? (
        <IdScanStep
          onConfirm={(p) => accept(p, "ID_SCAN")}
          onManual={() => {
            setMethod("MANUAL");
            update({ registrationMethod: "MANUAL" });
            setStage("manual");
          }}
          onBack={() => setStage("method")}
        />
      ) : null}

      {stage === "manual" ? (
        <ManualRegistrationStep
          method={method}
          initial={patient}
          onSubmit={(p) => accept(p, method === "WALK_IN" ? "WALK_IN" : "MANUAL")}
          onBack={() => setStage("method")}
        />
      ) : null}

      {stage === "confirm" ? (
        <ConfirmationStep
          patient={patient}
          method={method}
          onConfirm={() => navigate({ to: "/symptoms" })}
          onEdit={() => setStage("manual")}
        />
      ) : null}
    </KioskShell>
  );
}
