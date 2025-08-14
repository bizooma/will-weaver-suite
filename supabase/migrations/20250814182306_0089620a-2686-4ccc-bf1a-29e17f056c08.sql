-- Create voice sessions table for multi-session support
CREATE TABLE public.voice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  extracted_data JSONB NOT NULL DEFAULT '{}',
  confidence_scores JSONB NOT NULL DEFAULT '{}',
  transcriptions TEXT[] NOT NULL DEFAULT '{}',
  context_questions TEXT[] NOT NULL DEFAULT '{}',
  validation_issues JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own voice sessions" 
ON public.voice_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions" 
ON public.voice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions" 
ON public.voice_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice sessions" 
ON public.voice_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_voice_sessions_updated_at
BEFORE UPDATE ON public.voice_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();