-- Phase 1: Critical Security Fixes

-- 1. Create user_api_keys table for API key management
CREATE TABLE public.user_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  api_key text NOT NULL UNIQUE,
  key_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_api_keys
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_api_keys
CREATE POLICY "Users can manage their own API keys" 
ON public.user_api_keys 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Create user_settings table for white label and other settings
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  white_label_enabled boolean NOT NULL DEFAULT false,
  custom_domain text,
  brand_color text DEFAULT '#3b82f6',
  company_name text,
  logo_url text,
  hide_branding boolean NOT NULL DEFAULT false,
  api_access_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Create widget_requests table to track widget usage and security
CREATE TABLE public.widget_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id uuid NOT NULL,
  origin_domain text,
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on widget_requests
ALTER TABLE public.widget_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for widget_requests - allow public creation for active chatbots
CREATE POLICY "Allow widget request logging for active chatbots" 
ON public.widget_requests 
FOR INSERT
WITH CHECK (chatbot_id IN (SELECT id FROM chatbots WHERE is_active = true));

-- Users can view widget requests for their chatbots
CREATE POLICY "Users can view widget requests for their chatbots" 
ON public.widget_requests 
FOR SELECT
USING (chatbot_id IN (SELECT id FROM chatbots WHERE user_id = auth.uid()));

-- 4. Add updated_at triggers
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Function to generate secure API keys
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS text AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to get chatbot widget configuration (secure, limited data)
CREATE OR REPLACE FUNCTION public.get_chatbot_widget_config(chatbot_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only return essential data for widget embedding
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'description', c.description,
    'welcomeMessage', c.configuration->>'welcomeMessage',
    'primaryColor', c.configuration->>'primaryColor',
    'videoUrl', c.configuration->>'videoUrl',
    'suggestedResponses', c.configuration->'suggestedResponses',
    'showSuggestedResponses', (c.configuration->>'showSuggestedResponses')::boolean,
    'contactPhone', c.configuration->>'contactPhone',
    'contactEmail', c.configuration->>'contactEmail',
    'calendlyUrl', c.calendly_url,
    'is_active', c.is_active
  ) INTO result
  FROM chatbots c
  WHERE c.id = chatbot_id_param AND c.is_active = true;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Chatbot not found or inactive';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;