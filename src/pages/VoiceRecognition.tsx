import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { ArrowLeft, Mic, Square } from "lucide-react";

const VoiceRecognition = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { supported, listening, transcript, error, start, stop, reset } = useSpeechRecognition({
    lang: "en-US",
    continuous: true,
    interimResults: true,
  });

  useEffect(() => {
    document.title = "Voice Recognition | BabyWords";
  }, []);

  const toggleListening = async () => {
    if (!supported) return;
    if (listening) stop(); else start();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-mint-light pb-20">
      <header className="bg-white p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Voice Recognition</h1>
            <p className="text-sm text-muted-foreground">Record and transcribe speech</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {!supported ? (
          <Card className="p-4 border-0 bg-destructive/10">
            <p className="text-sm text-foreground">
              Speech recognition is not supported on this device/browser. Try Chrome on desktop or Android.
            </p>
          </Card>
        ) : null}

        <section>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={toggleListening}
              aria-pressed={listening}
              className={
                `size-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ` +
                `${listening ? "bg-mint text-mint-foreground ring-4 ring-mint-light/70 shadow-[var(--shadow-glow)]" : "bg-mint-light text-mint-foreground hover:scale-105"}`
              }
              title={listening ? "Stop" : "Start"}
            >
              {listening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <p className="text-xs text-muted-foreground">{listening ? "Listening… tap to stop" : "Tap to start listening"}</p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset} disabled={!transcript}>
                Clear
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!transcript}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </section>

        {error ? (
          <Card className="p-3 bg-peach-light/40 border-0">
            <p className="text-xs text-foreground">{String(error)}</p>
          </Card>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Transcript</h2>
          <Card className="p-4 border-0 bg-card min-h-32">
            <p className="text-sm whitespace-pre-wrap leading-relaxed min-h-16">
              {transcript || "Your transcript will appear here…"}
            </p>
          </Card>
          <p className="text-xs text-muted-foreground">Tip: say a single word and then tap Stop. Use the + button on the home screen to add it.</p>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default VoiceRecognition;
