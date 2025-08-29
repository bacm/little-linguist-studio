import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VoiceRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWordDetected: (word: string) => void;
}

export const VoiceRecognitionDialog = ({
  open,
  onOpenChange,
  onWordDetected,
}: VoiceRecognitionDialogProps) => {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (open) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((res) => res[0].transcript)
            .join(" ");
          setResult(transcript.trim());
          setListening(false);
        };
        recognition.onend = () => {
          setListening(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setListening(true);
      } else {
        setResult("Speech recognition not supported");
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setResult("");
      setListening(false);
    }
  }, [open]);

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleAdd = () => {
    if (result) {
      onWordDetected(result);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Voice Recognition</DialogTitle>
        </DialogHeader>
        {!result ? (
          <div className="text-center space-y-4">
            <p>{listening ? "Listening..." : ""}</p>
            {listening && (
              <Button variant="destructive" onClick={handleStop}>
                Stop
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p>
              We heard: <span className="font-semibold">{result}</span>
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add Word</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VoiceRecognitionDialog;
