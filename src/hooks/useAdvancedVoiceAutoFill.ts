import { useState, useCallback } from "react";
import { useDemoSupabase } from "@/hooks/useDemoSupabase";
import { toast } from "sonner";
import { ExtractedData, VoiceProcessingResult } from "./useVoiceAutoFill";

export interface VoiceSession {
  id: string;
  user_id: string;
  session_data: any;
  extracted_data: any; // Use any to match database Json type
  confidence_scores: any; // Use any to match database Json type
  transcriptions: string[];
  context_questions: string[];
  validation_issues: any; // Use any to match database Json type
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationIssue {
  type: 'missing_critical' | 'inconsistent' | 'low_confidence' | 'legal_concern';
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

export interface SmartFollowUp {
  question: string;
  context: string;
  expectedFields: string[];
  priority: 'high' | 'medium' | 'low';
}

export function useAdvancedVoiceAutoFill() {
  const supabase = useDemoSupabase();
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<SmartFollowUp[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const createSession = useCallback(async (initialData?: any): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        toast.error("Please log in to use voice sessions");
        return null;
      }

      const { data: sessionData, error: insertError } = await supabase
        .from('voice_sessions')
        .insert({
          user_id: data.user.id,
          session_data: initialData || {},
          extracted_data: {},
          confidence_scores: {},
          transcriptions: [],
          context_questions: [],
          validation_issues: {}
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setCurrentSession(sessionData);
      return sessionData.id;
    } catch (e) {
      console.error("Failed to create voice session:", e);
      toast.error("Failed to start voice session");
      return null;
    }
  }, []);

  const updateSession = useCallback(async (
    sessionId: string, 
    updates: any
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('voice_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to update voice session:", e);
      return false;
    }
  }, []);

  const resumeSession = useCallback(async (sessionId: string): Promise<VoiceSession | null> => {
    try {
      const { data, error } = await supabase
        .from('voice_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setCurrentSession(data);
      return data;
    } catch (e) {
      console.error("Failed to resume voice session:", e);
      return null;
    }
  }, []);

  const validateExtractedData = useCallback(async (
    extractedData: ExtractedData,
    confidenceScores: Record<string, number>,
    existingFormData?: any
  ): Promise<ValidationIssue[]> => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-voice-data", {
        body: { 
          extractedData, 
          confidenceScores, 
          existingFormData 
        }
      });

      if (error) throw error;
      
      const issues = data.validationIssues || [];
      setValidationIssues(issues);
      return issues;
    } catch (e) {
      console.error("Validation failed:", e);
      return [];
    } finally {
      setIsValidating(false);
    }
  }, []);

  const generateFollowUpQuestions = useCallback(async (
    extractedData: ExtractedData,
    validationIssues: ValidationIssue[],
    sessionContext?: any
  ): Promise<SmartFollowUp[]> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-followup-questions", {
        body: { 
          extractedData, 
          validationIssues, 
          sessionContext 
        }
      });

      if (error) throw error;
      
      const questions = data.followUpQuestions || [];
      setFollowUpQuestions(questions);
      return questions;
    } catch (e) {
      console.error("Failed to generate follow-up questions:", e);
      return [];
    }
  }, []);

  const addTranscriptionToSession = useCallback(async (
    sessionId: string,
    transcription: string,
    extractedData: ExtractedData,
    confidenceScores: Record<string, number>
  ): Promise<boolean> => {
    if (!currentSession) return false;

    const updatedTranscriptions = [...currentSession.transcriptions, transcription];
    const mergedData = mergeExtractedData(currentSession.extracted_data as ExtractedData, extractedData);
    const mergedScores = { ...currentSession.confidence_scores, ...confidenceScores };

    const success = await updateSession(sessionId, {
      transcriptions: updatedTranscriptions,
      extracted_data: mergedData,
      confidence_scores: mergedScores
    });

    if (success) {
      setCurrentSession(prev => prev ? {
        ...prev,
        transcriptions: updatedTranscriptions,
        extracted_data: mergedData,
        confidence_scores: mergedScores
      } : null);

      // Validate and generate follow-ups
      const issues = await validateExtractedData(mergedData, mergedScores);
      await generateFollowUpQuestions(mergedData, issues, currentSession);
    }

    return success;
  }, [currentSession, updateSession, validateExtractedData, generateFollowUpQuestions]);

  const getUserSessions = useCallback(async (): Promise<VoiceSession[]> => {
    try {
      const { data, error } = await supabase
        .from('voice_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Failed to fetch user sessions:", e);
      return [];
    }
  }, []);

  const mergeExtractedData = (existing: ExtractedData, newData: ExtractedData): ExtractedData => {
    const merged = { ...existing };

    // Merge personal information
    if (newData.personal) {
      merged.personal = { ...merged.personal, ...newData.personal };
    }

    // Merge spouse information
    if (newData.spouse) {
      merged.spouse = { ...merged.spouse, ...newData.spouse };
    }

    // Merge executor information
    if (newData.executor) {
      merged.executor = { ...merged.executor, ...newData.executor };
    }

    // Merge alternative executor
    if (newData.altExecutor) {
      merged.altExecutor = { ...merged.altExecutor, ...newData.altExecutor };
    }

    // Merge guardian information
    if (newData.guardian) {
      merged.guardian = { ...merged.guardian, ...newData.guardian };
    }

    // Merge alternative guardian
    if (newData.altGuardian) {
      merged.altGuardian = { ...merged.altGuardian, ...newData.altGuardian };
    }

    // Merge beneficiaries (combine arrays, avoid duplicates by name)
    if (newData.beneficiaries) {
      const existingBeneficiaries = merged.beneficiaries || [];
      const newBeneficiaries = newData.beneficiaries.filter(newBen => 
        !existingBeneficiaries.some(existing => existing.name === newBen.name)
      );
      merged.beneficiaries = [...existingBeneficiaries, ...newBeneficiaries];
    }

    // Merge gifts (combine arrays)
    if (newData.gifts) {
      merged.gifts = [...(merged.gifts || []), ...newData.gifts];
    }

    // Merge pets information
    if (newData.pets) {
      merged.pets = { ...merged.pets, ...newData.pets };
    }

    // Merge funeral preferences
    if (newData.funeral) {
      merged.funeral = { ...merged.funeral, ...newData.funeral };
    }

    // Merge confidence scores
    if (newData.confidence) {
      merged.confidence = { ...merged.confidence, ...newData.confidence };
    }

    return merged;
  };

  return {
    currentSession,
    validationIssues,
    followUpQuestions,
    isValidating,
    createSession,
    updateSession,
    resumeSession,
    validateExtractedData,
    generateFollowUpQuestions,
    addTranscriptionToSession,
    getUserSessions,
    setCurrentSession
  };
}