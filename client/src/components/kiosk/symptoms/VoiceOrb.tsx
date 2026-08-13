import { Loader2, Mic, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

const BAR_HEIGHTS = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.55, 0.85, 0.4, 0.7, 0.95, 0.45];

export function Waveform({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  return (
    <div className="flex h-12 items-center justify-center gap-1.5" aria-hidden>
      {BAR_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className={cn("w-1.5 rounded-full", active ? "bg-teal" : "bg-muted-foreground/30")}
          initial={false}
          animate={
            active && !reduceMotion
              ? { scaleY: [0.3, h, 0.4, h * 0.8, 0.3] }
              : { scaleY: active ? h : 0.25 }
          }
          transition={
            active && !reduceMotion
              ? { duration: 1.1 + (i % 4) * 0.18, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          style={{ height: 44, originY: 0.5 }}
        />
      ))}
    </div>
  );
}

export function VoiceOrb({
  state,
  reduceMotion,
  onClick,
  label,
}: {
  state: VoiceState;
  reduceMotion: boolean;
  onClick?: (() => void) | undefined;
  label: string;
}) {
  const listening = state === "listening";
  const speaking = state === "speaking";

  const ring =
    state === "error"
      ? "border-emergency/40"
      : listening
        ? "border-teal/50"
        : speaking
          ? "border-primary/40"
          : "border-border";

  const Icon = state === "processing" ? Loader2 : speaking ? Volume2 : Mic;

  return (
    <div className="relative flex items-center justify-center">
      {listening && !reduceMotion ? (
        <motion.span
          className="absolute rounded-full bg-teal/15"
          style={{ width: 200, height: 200 }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          aria-hidden
        />
      ) : null}
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={label}
        className={cn(
          "relative flex size-40 items-center justify-center rounded-full border-4 bg-card shadow-sm transition sm:size-48",
          ring,
          onClick
            ? "cursor-pointer hover:shadow-md focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none"
            : "cursor-default",
        )}
      >
        <span
          className={cn(
            "flex size-24 items-center justify-center rounded-full sm:size-28",
            listening
              ? "bg-teal text-white"
              : speaking
                ? "bg-primary text-primary-foreground"
                : state === "error"
                  ? "bg-emergency/10 text-emergency"
                  : "bg-surface text-foreground",
          )}
        >
          <Icon
            className={cn("size-10 sm:size-12", state === "processing" && "animate-spin")}
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}
