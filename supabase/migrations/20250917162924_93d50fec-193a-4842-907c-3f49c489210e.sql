-- Create marketing events table
CREATE TABLE public.marketing_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('system', 'user')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  content_suggestions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all active events" 
ON public.marketing_events 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own events" 
ON public.marketing_events 
FOR INSERT 
WITH CHECK (auth.uid() = created_by AND event_type = 'user');

CREATE POLICY "Users can update their own events" 
ON public.marketing_events 
FOR UPDATE 
USING (auth.uid() = created_by AND event_type = 'user');

CREATE POLICY "Users can delete their own events" 
ON public.marketing_events 
FOR DELETE 
USING (auth.uid() = created_by AND event_type = 'user');

-- Admins can manage system events
CREATE POLICY "Admins can manage system events" 
ON public.marketing_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_marketing_events_updated_at
BEFORE UPDATE ON public.marketing_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_marketing_events_date ON public.marketing_events(event_date);
CREATE INDEX idx_marketing_events_created_by ON public.marketing_events(created_by);
CREATE INDEX idx_marketing_events_tags ON public.marketing_events USING GIN(tags);