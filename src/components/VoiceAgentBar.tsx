import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mic, PhoneOff, Loader2 } from "lucide-react";
import { useConversation } from "@11labs/react";

interface VoiceAgentBarProps {
  agentId: string;
  voiceId?: string;
}

const VoiceAgentBar = ({ agentId, voiceId = "9BWtsMINqrJLrRacOk9x" }: VoiceAgentBarProps) => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  const conversation = useConversation({
    overrides: {
      tts: { voiceId },
    },
    onConnect: () => {
      toast({ title: "Voice connected", description: "You can start talking now." });
    },
    onDisconnect: () => {
      toast({ title: "Voice disconnected" });
    },
    onError: (error) => {
      toast({ title: "Voice error", description: String(error), variant: "destructive" });
    },
  });

  const startConversation = async () => {
    if (connecting) return;
    try {
      setConnecting(true);
      // Request mic permission up front to provide a clearer UX
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId });
    } catch (err) {
      toast({ title: "Microphone or connection failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      // no-op
    }
  };

  const connected = conversation.status === "connected";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="px-4 py-3 shadow-lg flex items-center gap-3">
        <div className="text-sm">
          {connected ? (conversation.isSpeaking ? "Listening & Speaking" : "Connected") : connecting ? "Connecting…" : "Voice Assistant"}
        </div>
        {!connected ? (
          <Button variant="hero" size="lg" onClick={startConversation} aria-label="Start voice conversation" disabled={connecting}>
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          </Button>
        ) : (
          <Button variant="secondary" size="lg" onClick={endConversation} aria-label="End voice conversation">
            <PhoneOff className="h-4 w-4" />
          </Button>
        )}
      </Card>
    </div>
  );
};

export default VoiceAgentBar;
