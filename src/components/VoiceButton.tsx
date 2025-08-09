import { Button } from "@/components/ui/button";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { Mic, Square } from "lucide-react";
import { useState } from "react";

interface VoiceButtonProps {
  onResult: (text: string) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "hero";
  title?: string;
}

const VoiceButton = ({ onResult, size = "sm", variant = "outline", title = "Dictate" }: VoiceButtonProps) => {
  const { isRecording, start, stop, transcribe } = useSpeechToText();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    if (!isRecording) {
      await start();
      return;
    }
    setBusy(true);
    const blob = await stop();
    if (blob) {
      const text = await transcribe(blob);
      if (text) onResult(text);
    }
    setBusy(false);
  };

  return (
    <Button size={size} variant={variant} onClick={handleClick} aria-label={isRecording ? "Stop recording" : "Start recording"} title={title} disabled={busy}>
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceButton;
