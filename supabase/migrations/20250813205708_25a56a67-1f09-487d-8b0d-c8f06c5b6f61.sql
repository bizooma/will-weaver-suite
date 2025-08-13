-- Create storage bucket for training documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-documents', 
  'training-documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create training_sources table to store URLs and document references
CREATE TABLE public.training_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('url', 'document')),
  source_url TEXT,
  file_path TEXT,
  file_name TEXT,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_content table to store processed content
CREATE TABLE public.training_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_source_id UUID NOT NULL REFERENCES public.training_sources(id) ON DELETE CASCADE,
  content_chunk TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on training tables
ALTER TABLE public.training_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_sources
CREATE POLICY "Users can view their own training sources"
ON public.training_sources
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create training sources for their chatbots"
ON public.training_sources
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own training sources"
ON public.training_sources
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sources"
ON public.training_sources
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for training_content
CREATE POLICY "Users can view training content for their sources"
ON public.training_content
FOR SELECT
USING (
  training_source_id IN (
    SELECT id FROM public.training_sources WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage training content"
ON public.training_content
FOR ALL
USING (true)
WITH CHECK (true);

-- Create storage policies for training documents
CREATE POLICY "Users can upload their own training documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'training-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own training documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'training-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own training documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'training-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_training_sources_updated_at
BEFORE UPDATE ON public.training_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_training_sources_chatbot_id ON public.training_sources(chatbot_id);
CREATE INDEX idx_training_sources_user_id ON public.training_sources(user_id);
CREATE INDEX idx_training_content_source_id ON public.training_content(training_source_id);