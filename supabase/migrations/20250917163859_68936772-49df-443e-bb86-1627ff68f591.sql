-- Add last_login field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on last_login queries
CREATE INDEX idx_profiles_last_login ON public.profiles(last_login);