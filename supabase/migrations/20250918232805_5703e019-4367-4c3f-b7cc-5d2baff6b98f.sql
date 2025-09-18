-- Add operator status to chatbot_conversations table
ALTER TABLE public.chatbot_conversations 
ADD COLUMN operator_status text NOT NULL DEFAULT 'ai',
ADD COLUMN operator_user_id uuid REFERENCES auth.users(id),
ADD COLUMN operator_taken_at timestamp with time zone;

-- Add constraint for operator status
ALTER TABLE public.chatbot_conversations 
ADD CONSTRAINT valid_operator_status 
CHECK (operator_status IN ('ai', 'human_requested', 'human_active'));

-- Create operator_sessions table
CREATE TABLE public.operator_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  operator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for operator_sessions
ALTER TABLE public.operator_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for operator_sessions
CREATE POLICY "Users can manage their own operator sessions" 
ON public.operator_sessions 
FOR ALL 
USING (auth.uid() = operator_user_id)
WITH CHECK (auth.uid() = operator_user_id);

-- Create operator_notes table for internal comments
CREATE TABLE public.operator_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  operator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for operator_notes
ALTER TABLE public.operator_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for operator_notes
CREATE POLICY "Users can manage notes for their chatbot conversations" 
ON public.operator_notes 
FOR ALL 
USING (conversation_id IN (
  SELECT cc.id 
  FROM chatbot_conversations cc 
  JOIN chatbots c ON cc.chatbot_id = c.id 
  WHERE c.user_id = auth.uid()
))
WITH CHECK (conversation_id IN (
  SELECT cc.id 
  FROM chatbot_conversations cc 
  JOIN chatbots c ON cc.chatbot_id = c.id 
  WHERE c.user_id = auth.uid()
) AND auth.uid() = operator_user_id);

-- Add trigger for operator_sessions updated_at
CREATE TRIGGER update_operator_sessions_updated_at
BEFORE UPDATE ON public.operator_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER TABLE public.chatbot_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.operator_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.operator_notes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.operator_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.operator_notes;