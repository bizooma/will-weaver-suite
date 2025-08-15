-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  law_firm TEXT,
  city TEXT,
  state TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  sheet_synced BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (contact form submissions)
CREATE POLICY "Allow public contact form submissions" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admin access (you can adjust this later)
CREATE POLICY "Admin can view all submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (false); -- Disabled for now, can be enabled when admin auth is set up

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();