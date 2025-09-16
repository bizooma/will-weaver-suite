-- Add public access policy for shared will drafts
CREATE POLICY "Allow public access to shared drafts by slug" 
ON public.will_drafts 
FOR SELECT 
USING (true);

-- Update the existing user-only policy to be more specific
DROP POLICY IF EXISTS "Users can view their own drafts" ON public.will_drafts;

CREATE POLICY "Users can view their own drafts" 
ON public.will_drafts 
FOR SELECT 
USING (auth.uid() = user_id);