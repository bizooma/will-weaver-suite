-- Add calendly_url field to chatbots table
ALTER TABLE public.chatbots 
ADD COLUMN calendly_url text;