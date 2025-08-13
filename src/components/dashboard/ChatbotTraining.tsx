import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link as LinkIcon, Trash2, FileText, Globe } from "lucide-react";

interface TrainingSource {
  id: string;
  source_type: 'url' | 'document';
  source_url?: string | null;
  file_path?: string | null;
  file_name?: string | null;
  title?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
  created_at: string;
}

interface ChatbotTrainingProps {
  chatbotId: string;
}

export function ChatbotTraining({ chatbotId }: ChatbotTrainingProps) {
  const { toast } = useToast();
  const [trainingSources, setTrainingSources] = useState<TrainingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  useEffect(() => {
    loadTrainingSources();
  }, [chatbotId]);

  const loadTrainingSources = async () => {
    try {
      const { data, error } = await supabase
        .from('training_sources')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainingSources((data || []) as TrainingSource[]);
    } catch (error) {
      console.error('Error loading training sources:', error);
      toast({
        title: "Error",
        description: "Failed to load training sources",
        variant: "destructive"
      });
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Create training source record
      const { data, error } = await supabase
        .from('training_sources')
        .insert({
          chatbot_id: chatbotId,
          user_id: userData.user.id,
          source_type: 'url',
          source_url: url,
          title: url,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Call edge function to process URL
      const { error: processError } = await supabase.functions.invoke('process-training-url', {
        body: { trainingSourceId: data.id, url }
      });

      if (processError) {
        console.error('Error processing URL:', processError);
        // Update status to failed
        await supabase
          .from('training_sources')
          .update({ status: 'failed', error_message: processError.message })
          .eq('id', data.id);
      }

      setUrl("");
      loadTrainingSources();
      toast({
        title: "URL Added",
        description: "URL is being processed for training"
      });
    } catch (error) {
      console.error('Error adding URL:', error);
      toast({
        title: "Error",
        description: "Failed to add URL for training",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userData.user.id}/${Date.now()}_${file.name}`;

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('training-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create training source record
        const { data, error } = await supabase
          .from('training_sources')
          .insert({
            chatbot_id: chatbotId,
            user_id: userData.user.id,
            source_type: 'document',
            file_path: uploadData.path,
            file_name: file.name,
            title: file.name,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;

        // Call edge function to process document
        const { error: processError } = await supabase.functions.invoke('process-training-document', {
          body: { trainingSourceId: data.id, filePath: uploadData.path }
        });

        if (processError) {
          console.error('Error processing document:', processError);
          // Update status to failed
          await supabase
            .from('training_sources')
            .update({ status: 'failed', error_message: processError.message })
            .eq('id', data.id);
        }
      }

      setSelectedFiles(null);
      loadTrainingSources();
      toast({
        title: "Documents Uploaded",
        description: "Documents are being processed for training"
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sourceId: string, filePath?: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('training_sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;

      // Delete file from storage if it's a document
      if (filePath) {
        await supabase.storage
          .from('training-documents')
          .remove([filePath]);
      }

      loadTrainingSources();
      toast({
        title: "Deleted",
        description: "Training source removed successfully"
      });
    } catch (error) {
      console.error('Error deleting training source:', error);
      toast({
        title: "Error",
        description: "Failed to delete training source",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Train Your Chatbot</CardTitle>
          <CardDescription>
            Add URLs and upload documents to train your chatbot with custom knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">Add URL</TabsTrigger>
              <TabsTrigger value="documents">Upload Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : "Add URL"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documents">Upload Documents</Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, TXT, DOC, DOCX (Max 10MB each)
                  </p>
                </div>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!selectedFiles || isLoading} 
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isLoading ? "Uploading..." : "Upload Documents"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Sources</CardTitle>
          <CardDescription>
            Manage your chatbot's training data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trainingSources.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No training sources added yet. Add URLs or upload documents to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {trainingSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {source.source_type === 'url' ? (
                      <Globe className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{source.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.source_type === 'url' ? source.source_url : source.file_name}
                      </p>
                      {source.error_message && (
                        <p className="text-sm text-red-500 mt-1">{source.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(source.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(source.id, source.file_path)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}