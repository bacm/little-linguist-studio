// Simple hook around the Web Speech API (no OpenAI, no LLM)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseSpeechRecognitionOptions {
  lang?: string; // e.g., "en-US"
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechResultSegment {
  transcript: string;
  isFinal: boolean;
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
) => {
  const { lang = "en-US", continuous = true, interimResults = true } = options;

  const SpeechRecognitionImpl = useMemo(() => {
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }, []);

  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState<boolean>(!!SpeechRecognitionImpl);
  const [listening, setListening] = useState(false);
  const [results, setResults] = useState<SpeechResultSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const transcript = useMemo(() => results.map(r => r.transcript).join(" ").trim(), [results]);

  useEffect(() => {
    if (!SpeechRecognitionImpl) return;
    // @ts-ignore - vendor prefixed type
    const recognition: any = new SpeechRecognitionImpl();
    recognition.lang = lang;
    // @ts-ignore - vendor differences
    recognition.continuous = continuous;
    recognition.interimResults = interimResults as boolean;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      setError(event?.error || "Unknown speech recognition error");
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      const segments: SpeechResultSegment[] = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        segments.push({ transcript: res[0].transcript, isFinal: res.isFinal });
      }
      setResults(prev => {
        const finalized = prev.filter(s => s.isFinal);
        const merged = [...finalized, ...segments];
        return merged;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionImpl, lang, continuous, interimResults]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setResults([]);
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Safari may throw if already started
      try { recognitionRef.current.stop(); } catch {}
      try { recognitionRef.current.start(); } catch {}
    }
  }, []);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    results,
    error,
    start,
    stop,
    reset,
  };
};
