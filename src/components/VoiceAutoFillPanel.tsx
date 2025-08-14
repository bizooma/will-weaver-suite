import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Square, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useVoiceAutoFill, ExtractedData, VoiceProcessingResult } from "@/hooks/useVoiceAutoFill";
import { cn } from "@/lib/utils";

interface VoiceAutoFillPanelProps {
  onDataExtracted: (data: ExtractedData, confidence: Record<string, number>) => void;
  onCancel: () => void;
}

const VoiceAutoFillPanel = ({ onDataExtracted, onCancel }: VoiceAutoFillPanelProps) => {
  const { isRecording, isProcessing, currentTranscription, recordAndProcess } = useVoiceAutoFill();
  const [lastResult, setLastResult] = useState<VoiceProcessingResult | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

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
    if (result) {
      setLastResult(result);
    }
  };

  const handleApproveData = () => {
    if (lastResult?.extractedData) {
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
    
    const confidence = lastResult?.extractedData?.confidence?.[confidenceKey] || 0;
    
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
        <h2 className="text-2xl font-semibold">Voice Auto-Fill</h2>
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

      {/* Extracted Data Preview */}
      {lastResult?.extractedData && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {/* Personal Information */}
                {lastResult.extractedData.personal && (
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    {renderExtractedField("Full Name", lastResult.extractedData.personal.fullName, "personal.fullName")}
                    {renderExtractedField("Date of Birth", lastResult.extractedData.personal.dob, "personal.dob")}
                    {renderExtractedField("Address", lastResult.extractedData.personal.address, "personal.address")}
                    {renderExtractedField("State", lastResult.extractedData.personal.state, "personal.state")}
                    {renderExtractedField("Marital Status", lastResult.extractedData.personal.maritalStatus, "personal.maritalStatus")}
                    <Separator className="my-3" />
                  </div>
                )}

                {/* Spouse */}
                {lastResult.extractedData.spouse?.name && (
                  <div>
                    <h4 className="font-semibold mb-2">Spouse</h4>
                    {renderExtractedField("Name", lastResult.extractedData.spouse.name, "spouse.name")}
                    {renderExtractedField("Date of Birth", lastResult.extractedData.spouse.dob, "spouse.dob")}
                    {renderExtractedField("Address", lastResult.extractedData.spouse.address, "spouse.address")}
                    <Separator className="my-3" />
                  </div>
                )}

                {/* Beneficiaries */}
                {lastResult.extractedData.beneficiaries && lastResult.extractedData.beneficiaries.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Beneficiaries</h4>
                    {lastResult.extractedData.beneficiaries.map((beneficiary, index) => (
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
                {lastResult.extractedData.executor?.name && (
                  <div>
                    <h4 className="font-semibold mb-2">Executor</h4>
                    {renderExtractedField("Name", lastResult.extractedData.executor.name, "executor.name")}
                    {renderExtractedField("Relationship", lastResult.extractedData.executor.relationship, "executor.relationship")}
                    <Separator className="my-3" />
                  </div>
                )}

                {/* Pets */}
                {lastResult.extractedData.pets?.petName && (
                  <div>
                    <h4 className="font-semibold mb-2">Pet Information</h4>
                    {renderExtractedField("Pet Name", lastResult.extractedData.pets.petName, "pets.petName")}
                    {renderExtractedField("Pet Type", lastResult.extractedData.pets.petType, "pets.petType")}
                    {renderExtractedField("Caregiver", lastResult.extractedData.pets.petCaregiver, "pets.petCaregiver")}
                    <Separator className="my-3" />
                  </div>
                )}

                {/* Funeral Preferences */}
                {lastResult.extractedData.funeral?.funeralPreference && (
                  <div>
                    <h4 className="font-semibold mb-2">Funeral Preferences</h4>
                    {renderExtractedField("Preference", lastResult.extractedData.funeral.funeralPreference, "funeral.funeralPreference")}
                    {renderExtractedField("Instructions", lastResult.extractedData.funeral.funeralInstructions, "funeral.funeralInstructions")}
                  </div>
                )}
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