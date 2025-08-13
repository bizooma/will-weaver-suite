-- Create chatbots table for user-created video chatbots
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  script_data JSONB NOT NULL DEFAULT '{}',
  configuration JSONB NOT NULL DEFAULT '{}',
  embed_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot_conversations table for analytics
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  conversation_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table for white-label features
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'basic',
  white_label_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_domain TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for chatbots
CREATE POLICY "Users can view their own chatbots" 
ON public.chatbots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chatbots" 
ON public.chatbots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbots" 
ON public.chatbots 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chatbots" 
ON public.chatbots 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for chatbot_conversations
CREATE POLICY "Users can view conversations for their chatbots" 
ON public.chatbot_conversations 
FOR SELECT 
USING (chatbot_id IN (SELECT id FROM public.chatbots WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create conversations" 
ON public.chatbot_conversations 
FOR INSERT 
WITH CHECK (true);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.chatbots ADD CONSTRAINT fk_chatbots_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chatbot_conversations ADD CONSTRAINT fk_conversations_chatbot_id FOREIGN KEY (chatbot_id) REFERENCES public.chatbots(id) ON DELETE CASCADE;
ALTER TABLE public.user_subscriptions ADD CONSTRAINT fk_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_chatbots_updated_at
BEFORE UPDATE ON public.chatbots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_chatbots_user_id ON public.chatbots(user_id);
CREATE INDEX idx_chatbot_conversations_chatbot_id ON public.chatbot_conversations(chatbot_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);