-- Create QR codes table
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  qr_config JSONB NOT NULL DEFAULT '{"foregroundColor": "#000000", "backgroundColor": "#ffffff", "size": 256, "errorCorrectionLevel": "M"}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create QR scans table
CREATE TABLE public.qr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for qr_codes
CREATE POLICY "Users can view their own QR codes" 
ON public.qr_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes" 
ON public.qr_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes" 
ON public.qr_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes" 
ON public.qr_codes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for qr_scans
CREATE POLICY "Users can view scans for their QR codes" 
ON public.qr_scans 
FOR SELECT 
USING (qr_code_id IN (SELECT id FROM public.qr_codes WHERE user_id = auth.uid()));

CREATE POLICY "Allow public scan logging for active QR codes" 
ON public.qr_scans 
FOR INSERT 
WITH CHECK (qr_code_id IN (SELECT id FROM public.qr_codes WHERE is_active = true));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON public.qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_qr_codes_slug ON public.qr_codes(slug);
CREATE INDEX idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_scanned_at ON public.qr_scans(scanned_at);