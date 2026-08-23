import { useCallback, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CloudOff, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { SymptomIntro } from "@/components/kiosk/symptoms/SymptomIntro";
import { SymptomConversation } from "@/components/kiosk/symptoms/SymptomConversation";
import { EmergencyEscape } from "@/components/kiosk/symptoms/EmergencyEscape";
import type { VoiceState } from "@/components/kiosk/symptoms/VoiceOrb";
import { triageService } from "@/services";

const SYMPTOM_QUESTIONS = triageService.getQuestions();
import { useKioskSession } from "@/state/kiosk-session";
import { useStaffStore } from "@/state/staff-store";
import type { ChatMessage, Patient } from "@/types/opd";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Describe Your Symptoms — Smart OPD Kiosk" },
      {
        name: "description",
        content:
          "Speak or type your symptoms one question at a time so the OPD queue can be prioritised correctly.",
      },
      { property: "og:title", content: "Describe Your Symptoms — Smart OPD Kiosk" },
      {
        property: "og:description",
        content: "Guided voice-first symptom questions that decide your OPD queue priority.",
      },
    ],
  }),
  component: SymptomsPage,
});

type Stage = "intro" | "conversation" | "emergency" | "processing" | "unavailable";

function SymptomsPage() {
  const { session, update } = useKioskSession();
  const { addPatient, positionForPriority } = useStaffStore();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("intro");
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [index, setIndex] = useState(0);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [acknowledgement, setAcknowledgement] = useState<string | null>(null);
  const [textValue, setTextValue] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [flagged, setFlagged] = useState("");
  const timers = useRef<number[]>([]);
  const attempt = useRef(0);
  const failures = useRef(0);

  const question = SYMPTOM_QUESTIONS[index]!;
  const reduceMotion = session.reducedMotion;

  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const finish = useCallback(
    (all: string[]) => {
      setStage("processing");
      const priority = triageService.assessAnswers(all);
      const messages: ChatMessage[] = SYMPTOM_QUESTIONS.flatMap((q, i) => {
        const answer = all[i];
        const turn: ChatMessage[] = [{ id: `${q.id}-ai`, role: "ai", text: q.prompt }];
        if (answer) turn.push({ id: `${q.id}-p`, role: "patient", text: answer });
        return turn;
      });

      const triageResult = triageService.getResult(priority);
      const answerText = all.filter(Boolean).join(" ");
      const patient = {
        id: session.patient.id ?? `kiosk-${Date.now()}`,
        name: session.patient.name ?? "Walk-in patient",
        age: session.patient.age ?? 0,
        gender: session.patient.gender ?? "Other",
        phone: session.patient.phone ?? "Not provided",
        idNumber: session.patient.idNumber ?? "Not provided",
        ...session.patient,
      } as Patient;

      // Frontend-only: the kiosk patient joins the same in-memory queue the
      // staff dashboard reads from, so the demo is genuinely end-to-end.
      const entry = addPatient({
        patient,
        department: triageResult.department,
        priority,
        symptomsSummary: answerText || "Symptoms captured at kiosk.",
        triageSummary: triageResult.reason,
        flags: priority === "RED" ? ["Kiosk red flag"] : [],
      });

      update({
        symptoms: messages,
        triageResult,
        ticket: {
          token: entry.token,
          position: positionForPriority(priority),
          estimatedWaitMinutes: priority === "RED" ? 2 : priority === "YELLOW" ? 12 : 24,
        },
      });
      after(1200, () => navigate({ to: "/triage" }));
    },
    [navigate, update, addPatient, positionForPriority, session.patient],
  );

  function acceptAnswer(answer: string) {
    const next = [...answers, answer];
    setAnswers(next);

    if (triageService.detectRedFlag(answer)) {
      setFlagged(answer);
      setVoiceState("idle");
      setStage("emergency");
      return;
    }

    setVoiceState("processing");
    setAcknowledgement(null);
    after(900, () => {
      setVoiceState("speaking");
      setAcknowledgement(question.acknowledgement);
      after(1400, () => {
        setTranscript(null);
        setAcknowledgement(null);
        setVoiceState("idle");
        setTextValue("");
        if (index + 1 >= SYMPTOM_QUESTIONS.length) finish(next);
        else setIndex((i) => i + 1);
      });
    });
  }

  function startListening() {
    attempt.current += 1;
    setTranscript(null);
    setAcknowledgement(null);
    setVoiceState("listening");
    // Simulated recognition: every third attempt fails to demo the error state.
    after(2200, () => {
      if (attempt.current % 3 === 0) {
        failures.current += 1;
        if (failures.current >= 2) {
          setVoiceState("idle");
          setStage("unavailable");
          return;
        }
        setVoiceState("error");
        return;
      }
      failures.current = 0;
      setTranscript(question.mockTranscript);
      acceptAnswer(question.mockTranscript);
    });
  }

  function stopListening() {
    clearTimers();
    setVoiceState("idle");
    setTranscript(null);
  }

  if (stage === "intro") {
    return (
      <KioskShell step="symptoms">
        <SymptomIntro
          {...(session.patient.name ? { patientName: session.patient.name } : {})}
          onStartVoice={() => {
            setMode("voice");
            setStage("conversation");
          }}
          onStartText={() => {
            setMode("text");
            setStage("conversation");
          }}
        />
      </KioskShell>
    );
  }

  if (stage === "emergency") {
    return (
      <KioskShell step="symptoms">
        <EmergencyEscape
          quote={flagged}
          onContinue={() => {
            setStage("conversation");
            setTranscript(null);
            setTextValue("");
            if (index + 1 >= SYMPTOM_QUESTIONS.length) finish(answers);
            else setIndex((i) => i + 1);
          }}
        />
      </KioskShell>
    );
  }

  if (stage === "unavailable") {
    return (
      <KioskShell step="symptoms">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-priority-soft">
            <CloudOff className="size-8 text-priority-foreground" aria-hidden />
          </span>
          <h1 className="kiosk-heading mt-8">The assistant is temporarily unavailable</h1>
          <p className="kiosk-sub mt-4 text-muted-foreground" role="status" aria-live="polite">
            Please continue with manual assistance. You can type your answers here, or a staff
            member at the help desk will complete this with you. You will still receive a token.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="kioskLg"
              onClick={() => {
                failures.current = 0;
                attempt.current = 0;
                setMode("text");
                setVoiceState("idle");
                setStage("conversation");
              }}
            >
              Type my answers instead
            </Button>
            <Button
              variant="outline"
              size="kioskLg"
              onClick={() => {
                failures.current = 0;
                attempt.current = 0;
                setVoiceState("idle");
                setStage("conversation");
              }}
            >
              <RotateCcw aria-hidden />
              Try the assistant again
            </Button>
            <Button variant="ghost" size="kioskLg" onClick={() => finish(answers)}>
              Continue without the assistant
            </Button>
          </div>
        </div>
      </KioskShell>
    );
  }

  if (stage === "processing") {
    return (
      <KioskShell step="symptoms">
        <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
          <Loader2 className="size-12 animate-spin text-teal" aria-hidden />
          <h1 className="kiosk-heading mt-8">Analyzing your information…</h1>
          <p className="kiosk-sub mt-4 text-muted-foreground" role="status" aria-live="polite">
            Reviewing your answers. This takes a few seconds. Please do not leave the kiosk.
          </p>
        </div>
      </KioskShell>
    );
  }

  return (
    <KioskShell step="symptoms">
      <SymptomConversation
        question={question}
        index={index}
        total={SYMPTOM_QUESTIONS.length}
        mode={mode}
        voiceState={voiceState}
        transcript={transcript}
        acknowledgement={acknowledgement}
        reduceMotion={reduceMotion}
        textValue={textValue}
        onTextChange={setTextValue}
        onSubmitText={() => {
          if (!textValue.trim()) return;
          acceptAnswer(textValue.trim());
        }}
        onQuickReply={(v) => acceptAnswer(v)}
        onStartListening={startListening}
        onStop={stopListening}
        onRetry={startListening}
        onSwitchMode={() => {
          clearTimers();
          setVoiceState("idle");
          setTranscript(null);
          setMode((m) => (m === "voice" ? "text" : "voice"));
        }}
      />
    </KioskShell>
  );
}
