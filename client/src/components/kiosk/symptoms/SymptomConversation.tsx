import { AlertTriangle, Keyboard, RefreshCw, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { VoiceOrb, Waveform, type VoiceState } from "./VoiceOrb";
import type { SymptomQuestion } from "@/services";

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "Tap the microphone to answer",
  listening: "Listening…",
  processing: "Processing…",
  speaking: "AI Speaking…",
  error: "We could not hear you",
};

export function SymptomConversation({
  question,
  index,
  total,
  mode,
  voiceState,
  transcript,
  acknowledgement,
  reduceMotion,
  textValue,
  onTextChange,
  onSubmitText,
  onQuickReply,
  onStartListening,
  onStop,
  onRetry,
  onSwitchMode,
}: {
  question: SymptomQuestion;
  index: number;
  total: number;
  mode: "voice" | "text";
  voiceState: VoiceState;
  transcript: string | null;
  acknowledgement: string | null;
  reduceMotion: boolean;
  textValue: string;
  onTextChange: (v: string) => void;
  onSubmitText: () => void;
  onQuickReply: (v: string) => void;
  onStartListening: () => void;
  onStop: () => void;
  onRetry: () => void;
  onSwitchMode: () => void;
}) {
  const busy =
    voiceState === "listening" || voiceState === "processing" || voiceState === "speaking";

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Question {index + 1} of {total}
      </p>
      <h1 className="kiosk-heading mt-3">{question.prompt}</h1>
      <p className="kiosk-sub mt-3 text-muted-foreground">{question.hint}</p>

      {mode === "voice" ? (
        <Card className="mt-8 flex flex-col items-center gap-6 p-6 sm:p-10">
          <VoiceOrb
            state={voiceState}
            reduceMotion={reduceMotion}
            label={voiceState === "listening" ? "Stop listening" : "Start speaking"}
            onClick={
              voiceState === "idle"
                ? onStartListening
                : voiceState === "listening"
                  ? onStop
                  : undefined
            }
          />
          <Waveform
            active={voiceState === "listening" || voiceState === "speaking"}
            reduceMotion={reduceMotion}
          />
          <p
            role="status"
            aria-live="polite"
            className={
              voiceState === "error"
                ? "text-xl font-semibold text-emergency"
                : "text-xl font-semibold"
            }
          >
            {STATE_LABEL[voiceState]}
          </p>

          {transcript ? (
            <p className="w-full rounded-xl bg-surface px-5 py-4 text-center text-lg">
              “{transcript}”
            </p>
          ) : null}
          {acknowledgement ? (
            <p className="text-center text-lg text-muted-foreground">{acknowledgement}</p>
          ) : null}

          {voiceState === "error" ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="kiosk" onClick={onRetry}>
                <RefreshCw aria-hidden />
                Try again
              </Button>
              <Button size="kiosk" variant="outline" onClick={onSwitchMode}>
                <Keyboard aria-hidden />
                Type instead
              </Button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              {voiceState === "listening" ? (
                <Button size="kiosk" variant="outline" onClick={onStop}>
                  <Square aria-hidden />
                  Stop
                </Button>
              ) : null}
              <Button size="kiosk" variant="ghost" onClick={onSwitchMode} disabled={busy}>
                <Keyboard aria-hidden />
                Type instead
              </Button>
            </div>
          )}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="size-4" aria-hidden />
            Demonstration only — no real voice recording takes place.
          </p>
        </Card>
      ) : (
        <Card className="mt-8 flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap gap-3">
            {question.quickReplies.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="kiosk"
                className="px-5"
                onClick={() => onQuickReply(reply)}
                disabled={busy}
              >
                {reply}
              </Button>
            ))}
          </div>
          <Textarea
            aria-label="Your answer"
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type your answer here"
            className="min-h-32 text-lg"
            disabled={busy}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="kioskLg"
              onClick={onSubmitText}
              disabled={!textValue.trim() || busy}
              className="sm:flex-1"
            >
              <Send aria-hidden />
              Send answer
            </Button>
            <Button size="kioskLg" variant="ghost" onClick={onSwitchMode} disabled={busy}>
              Use voice
            </Button>
          </div>
          {acknowledgement ? (
            <p role="status" aria-live="polite" className="text-lg text-muted-foreground">
              {acknowledgement}
            </p>
          ) : null}
        </Card>
      )}
    </div>
  );
}
