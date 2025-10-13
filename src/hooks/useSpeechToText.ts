import { useRef, useState } from "react";
import { useDemoSupabase } from "@/hooks/useDemoSupabase";
import { toast } from "sonner";

export function useSpeechToText() {
  const supabase = useDemoSupabase();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      toast.error("Microphone access denied");
      throw e;
    }
  };

  const stop = async (): Promise<Blob | null> => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return null;
    return new Promise((resolve) => {
      try {
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setIsRecording(false);
          try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
          resolve(blob);
        };
        mr.stop();
      } catch {
        resolve(null);
      }
    });
  };

  const transcribe = async (blob: Blob): Promise<string> => {
    try {
      const base64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke("voice-to-text", {
        body: { audio: base64 },
      });
      if (error) throw error;
      const text = (data as any)?.text?.trim?.();
      return text || "";
    } catch (e) {
      console.error(e);
      toast.error("Voice transcription failed");
      return "";
    }
  };

  return { isRecording, start, stop, transcribe };
}
