import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Square, Check, X, AlertCircle, Loader2, MessageSquare, History } from "lucide-react";
import { useVoiceAutoFill, ExtractedData, VoiceProcessingResult } from "@/hooks/useVoiceAutoFill";
import { useAdvancedVoiceAutoFill, ValidationIssue, SmartFollowUp } from "@/hooks/useAdvancedVoiceAutoFill";
import { cn } from "@/lib/utils";

interface VoiceAutoFillPanelProps {
  onDataExtracted: (data: ExtractedData, confidence: Record<string, number>) => void;
  onCancel: () => void;
  initialFormData?: any;
}

const VoiceAutoFillPanel = ({ onDataExtracted, onCancel, initialFormData }: VoiceAutoFillPanelProps) => {
  const { isRecording, isProcessing, currentTranscription, recordAndProcess } = useVoiceAutoFill();
  const { 
    currentSession, 
    validationIssues, 
    followUpQuestions, 
    isValidating,
    createSession,
    addTranscriptionToSession,
    getUserSessions 
  } = useAdvancedVoiceAutoFill();
  
  const [lastResult, setLastResult] = useState<VoiceProcessingResult | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showSessions, setShowSessions] = useState(false);
  const [previousSessions, setPreviousSessions] = useState([]);

  // Initialize session and load previous sessions
  useEffect(() => {
    const initializeSession = async () => {
      await createSession(initialFormData);
      const sessions = await getUserSessions();
      setPreviousSessions(sessions);
    };
    initializeSession();
  }, []);

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleRecordToggle = async () => {
    const result = await recordAndProcess();
    if (result && currentSession) {
      setLastResult(result);
      // Add to session for advanced processing
      await addTranscriptionToSession(
        currentSession.id,
        result.transcription,
        result.extractedData,
        result.extractedData.confidence || {}
      );
    }
  };

  const handleApproveData = () => {
    if (currentSession?.extracted_data) {
      // Use session data which includes merged information from multiple recordings
      onDataExtracted(currentSession.extracted_data as ExtractedData, currentSession.confidence_scores as Record<string, number>);
    } else if (lastResult?.extractedData) {
      onDataExtracted(lastResult.extractedData, lastResult.extractedData.confidence || {});
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const renderExtractedField = (label: string, value: string | undefined, confidenceKey: string) => {
    if (!value) return null;
    
    const confidence = currentSession?.confidence_scores?.[confidenceKey] || 
                      lastResult?.extractedData?.confidence?.[confidenceKey] || 0;
    
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <span className="text-sm font-medium text-muted-foreground">{label}:</span>
          <span className="ml-2 text-sm">{value}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs", getConfidenceColor(confidence), "text-white")}
        >
          {getConfidenceLabel(confidence)}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Voice Auto-Fill</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
            >
              <History className="h-4 w-4 mr-2" />
              Sessions
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Tell me about yourself and your estate planning needs. I'll extract the key information to fill your form.
        </p>
      </div>

      {/* Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recording
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={handleRecordToggle}
              disabled={isProcessing}
              className={cn(
                "w-20 h-20 rounded-full transition-all duration-200",
                isRecording && "animate-pulse"
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            
            <div className="text-center">
              {isRecording && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Recording...</p>
                  <p className="text-xs text-muted-foreground">{formatDuration(recordingDuration)}</p>
                </div>
              )}
              {isProcessing && (
                <p className="text-sm font-medium text-blue-600">Processing audio...</p>
              )}
              {!isRecording && !isProcessing && (
                <p className="text-sm text-muted-foreground">
                  {lastResult ? "Tap to record again" : "Tap to start recording"}
                </p>
              )}
            </div>
          </div>

          {/* Current Transcription */}
          {currentTranscription && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Transcription:</strong> {currentTranscription}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Validation Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationIssues.map((issue, index) => (
                <Alert key={index} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <strong>{issue.message}</strong>
                      {issue.suggestions && issue.suggestions.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {issue.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Follow-up Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {followUpQuestions.map((question, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{question.question}</p>
                    <Badge variant={
                      question.priority === 'high' ? 'destructive' : 
                      question.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {question.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{question.context}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data Preview */}
      {(currentSession?.extracted_data || lastResult?.extractedData) && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Use session data if available, otherwise use last result */}
                {(() => {
                  const dataToShow = (currentSession?.extracted_data as ExtractedData) || lastResult?.extractedData;
                  if (!dataToShow) return null;
                  
                  return (
                    <>
                      {/* Personal Information */}
                      {dataToShow.personal && (
                        <div>
                          <h4 className="font-semibold mb-2">Personal Information</h4>
                          {renderExtractedField("Full Name", dataToShow.personal.fullName, "personal.fullName")}
                          {renderExtractedField("Date of Birth", dataToShow.personal.dob, "personal.dob")}
                          {renderExtractedField("Address", dataToShow.personal.address, "personal.address")}
                          {renderExtractedField("State", dataToShow.personal.state, "personal.state")}
                          {renderExtractedField("Marital Status", dataToShow.personal.maritalStatus, "personal.maritalStatus")}
                          <Separator className="my-3" />
                        </div>
                      )}

                      {/* Spouse */}
                      {dataToShow.spouse?.name && (
                        <div>
                          <h4 className="font-semibold mb-2">Spouse</h4>
                          {renderExtractedField("Name", dataToShow.spouse.name, "spouse.name")}
                          {renderExtractedField("Date of Birth", dataToShow.spouse.dob, "spouse.dob")}
                          {renderExtractedField("Address", dataToShow.spouse.address, "spouse.address")}
                          <Separator className="my-3" />
                        </div>
                      )}

                      {/* Beneficiaries */}
                      {dataToShow.beneficiaries && dataToShow.beneficiaries.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Beneficiaries</h4>
                          {dataToShow.beneficiaries.map((beneficiary, index) => (
                            <div key={index} className="pl-4 border-l-2 border-muted mb-3">
                              <p className="text-sm font-medium text-muted-foreground">Beneficiary {index + 1}</p>
                              {renderExtractedField("Name", beneficiary.name, `beneficiaries.${index}.name`)}
                              {renderExtractedField("Date of Birth", beneficiary.dob, `beneficiaries.${index}.dob`)}
                              {renderExtractedField("Relationship", beneficiary.relationship, `beneficiaries.${index}.relationship`)}
                            </div>
                          ))}
                          <Separator className="my-3" />
                        </div>
                      )}

                      {/* Executor */}
                      {dataToShow.executor?.name && (
                        <div>
                          <h4 className="font-semibold mb-2">Executor</h4>
                          {renderExtractedField("Name", dataToShow.executor.name, "executor.name")}
                          {renderExtractedField("Relationship", dataToShow.executor.relationship, "executor.relationship")}
                          <Separator className="my-3" />
                        </div>
                      )}

                      {/* Pets */}
                      {dataToShow.pets?.petName && (
                        <div>
                          <h4 className="font-semibold mb-2">Pet Information</h4>
                          {renderExtractedField("Pet Name", dataToShow.pets.petName, "pets.petName")}
                          {renderExtractedField("Pet Type", dataToShow.pets.petType, "pets.petType")}
                          {renderExtractedField("Caregiver", dataToShow.pets.petCaregiver, "pets.petCaregiver")}
                          <Separator className="my-3" />
                        </div>
                      )}

                      {/* Funeral Preferences */}
                      {dataToShow.funeral?.funeralPreference && (
                        <div>
                          <h4 className="font-semibold mb-2">Funeral Preferences</h4>
                          {renderExtractedField("Preference", dataToShow.funeral.funeralPreference, "funeral.funeralPreference")}
                          {renderExtractedField("Instructions", dataToShow.funeral.funeralInstructions, "funeral.funeralInstructions")}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button onClick={handleApproveData} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Apply to Form
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!lastResult && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Tips:</strong> Speak naturally about your personal information, family members, assets, 
            and preferences. For example: "My name is John Smith, I live in California, I'm married to Sarah, 
            and I have two children - Emily and Michael. I want my brother Tom to be my executor..."
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VoiceAutoFillPanel;