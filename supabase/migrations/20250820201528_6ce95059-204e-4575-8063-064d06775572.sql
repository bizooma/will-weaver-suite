-- Fix security warnings from the database functions

-- Fix function search_path issues by updating the functions
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS text AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix function search_path for chatbot widget config function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';