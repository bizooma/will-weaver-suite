import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Mic, PhoneOff, Loader2 } from "lucide-react";
import { useConversation } from "@elevenlabs/react";

interface VoiceAgentBarProps {
  agentId: string;
  voiceId?: string;
}

const VoiceAgentBar = ({ agentId, voiceId = "9BWtsMINqrJLrRacOk9x" }: VoiceAgentBarProps) => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  const conversation = useConversation({
    overrides: { tts: { voiceId } },
    onConnect: () => toast({ title: "Voice connected", description: "You can start talking now." }),
    onDisconnect: () => toast({ title: "Voice disconnected" }),
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      toast({ title: "Voice error", description: String(error), variant: "destructive" });
    },
  });

  const startConversation = async () => {
    if (connecting) return;
    try {
      setConnecting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("eleven-signed-url", { body: { agentId } });
      if (error || !data?.signed_url) {
        throw new Error(error?.message || "Failed to get signed URL from server");
      }

      await conversation.startSession({ signedUrl: data.signed_url });
    } catch (err) {
      console.error("startConversation failed", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Microphone or connection failed", description: message, variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch {}
  };

  const connected = conversation.status === "connected";

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
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
