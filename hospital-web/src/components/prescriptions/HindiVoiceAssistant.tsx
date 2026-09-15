import { useState, useEffect } from "react";
import { Volume2, VolumeX, Globe, Play, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HindiVoiceAssistantProps {
  medicationName: string;
  hindiText: string;
  englishText: string;
  patientName?: string;
}

export function HindiVoiceAssistant({
  medicationName,
  hindiText,
  englishText,
  patientName,
}: HindiVoiceAssistantProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!supported || typeof window === "undefined") {
      toast.error("Web Speech API is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any existing speech

    const greeting = language === "hi-IN"
      ? (patientName ? `नमस्ते ${patientName} जी। ` : "नमस्ते। ")
      : (patientName ? `Hello ${patientName}. ` : "Hello. ");

    const content = language === "hi-IN" ? hindiText : englishText;
    const fullText = `${greeting} ${medicationName} की खुराक निर्देश: ${content}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = language;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(
      (v) => v.lang.toLowerCase() === language.toLowerCase() || v.lang.startsWith(language.split("-")[0])
    );
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error("Speech playback error");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Volume2 className="size-4" />
          </span>
          <div>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              Accessible Voice Assistant
              <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] text-primary font-semibold">
                0 API Keys
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Audio medicine dosage reader in Hindi & Indian English
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex rounded-lg bg-background border p-0.5 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => {
              if (isPlaying) stop();
              setLanguage("hi-IN");
            }}
            className={`px-2 py-0.5 rounded ${
              language === "hi-IN" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            हिंदी
          </button>
          <button
            type="button"
            onClick={() => {
              if (isPlaying) stop();
              setLanguage("en-IN");
            }}
            className={`px-2 py-0.5 rounded ${
              language === "en-IN" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Spoken Text Preview */}
      <div className="rounded-lg bg-background/80 p-2.5 text-xs text-foreground/90 border border-border/60">
        <p className="italic font-sans">
          "{language === "hi-IN" ? hindiText : englishText}"
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <Button size="sm" variant="destructive" onClick={stop} className="h-7 text-xs gap-1">
              <Square className="size-3" /> Stop Audio
            </Button>
          ) : (
            <Button size="sm" onClick={speak} className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Play className="size-3" /> Read Dosage Aloud
            </Button>
          )}

          {isPlaying && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 animate-pulse ml-2 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Playing...
            </span>
          )}
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>Speed:</span>
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setSpeechRate(rate)}
              className={`px-1.5 py-0.5 rounded font-mono ${
                speechRate === rate ? "bg-muted font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
