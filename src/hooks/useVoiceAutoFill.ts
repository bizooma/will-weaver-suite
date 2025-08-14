import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractedData {
  personal?: {
    fullName?: string;
    dob?: string;
    address?: string;
    state?: string;
    maritalStatus?: string;
  };
  spouse?: {
    name?: string;
    dob?: string;
    address?: string;
  };
  beneficiaries?: Array<{
    name?: string;
    dob?: string;
    relationship?: string;
  }>;
  executor?: {
    name?: string;
    dob?: string;
    address?: string;
    relationship?: string;
  };
  altExecutor?: {
    name?: string;
    dob?: string;
    address?: string;
    relationship?: string;
  };
  guardian?: {
    name?: string;
    dob?: string;
    address?: string;
    relationship?: string;
  };
  altGuardian?: {
    name?: string;
    dob?: string;
    address?: string;
    relationship?: string;
  };
  gifts?: Array<{
    description?: string;
    beneficiary?: string;
  }>;
  pets?: {
    petName?: string;
    petType?: string;
    petCaregiver?: string;
    petInstructions?: string;
  };
  funeral?: {
    funeralPreference?: string;
    funeralInstructions?: string;
  };
  confidence?: Record<string, number>;
}

export interface VoiceProcessingResult {
  transcription: string;
  extractedData: ExtractedData;
  success: boolean;
}

export function useVoiceAutoFill() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setCurrentTranscription("");
      
    } catch (e) {
      console.error(e);
      toast.error("Microphone access denied");
      throw e;
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return null;
    
    return new Promise((resolve) => {
      try {
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setIsRecording(false);
          try { 
            streamRef.current?.getTracks().forEach((t) => t.stop()); 
          } catch {}
          resolve(blob);
        };
        mr.stop();
      } catch {
        resolve(null);
      }
    });
  };

  const processVoiceToData = async (audioBlob: Blob): Promise<VoiceProcessingResult | null> => {
    try {
      setIsProcessing(true);
      const base64 = await blobToBase64(audioBlob);
      
      const { data, error } = await supabase.functions.invoke("voice-to-structured-data", {
        body: { audio: base64 },
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Voice processing failed");
      }
      
      setCurrentTranscription(data.transcription);
      return {
        transcription: data.transcription,
        extractedData: data.extractedData,
        success: true
      };
      
    } catch (e) {
      console.error("Voice processing error:", e);
      toast.error("Voice processing failed");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const recordAndProcess = async (): Promise<VoiceProcessingResult | null> => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        return await processVoiceToData(blob);
      }
      return null;
    } else {
      await startRecording();
      return null;
    }
  };

  return {
    isRecording,
    isProcessing,
    currentTranscription,
    startRecording,
    stopRecording,
    processVoiceToData,
    recordAndProcess
  };
}