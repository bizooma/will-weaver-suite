-- Create nonprofit_drafts table for storing draft applications
CREATE TABLE public.nonprofit_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  step INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.nonprofit_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own nonprofit drafts" 
ON public.nonprofit_drafts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nonprofit drafts" 
ON public.nonprofit_drafts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nonprofit drafts" 
ON public.nonprofit_drafts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nonprofit drafts" 
ON public.nonprofit_drafts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_nonprofit_drafts_updated_at
BEFORE UPDATE ON public.nonprofit_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();