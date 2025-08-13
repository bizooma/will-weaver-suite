-- Create a policy to allow public access to active chatbots
-- This will allow the chatbot widget to be displayed on public websites
CREATE POLICY "Allow public access to active chatbots" 
ON public.chatbots 
FOR SELECT 
USING (is_active = true);

-- Also allow public conversation creation for chatbot widgets
CREATE POLICY "Allow public conversation creation for active chatbots" 
ON public.chatbot_conversations 
FOR INSERT 
WITH CHECK (
  chatbot_id IN (
    SELECT id FROM chatbots WHERE is_active = true
  )
);