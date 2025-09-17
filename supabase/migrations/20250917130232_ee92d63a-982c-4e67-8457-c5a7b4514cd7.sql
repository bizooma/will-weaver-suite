-- Create voice_search_tests table
CREATE TABLE public.voice_search_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  market_city TEXT NOT NULL,
  market_state TEXT NOT NULL,
  market_zip TEXT,
  practice_areas TEXT[] NOT NULL DEFAULT '{}',
  custom_practice_area TEXT,
  test_questions TEXT[] NOT NULL DEFAULT '{}',
  selected_assistants TEXT[] NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_search_queries table  
CREATE TABLE public.voice_search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL,
  question TEXT NOT NULL,
  assistant TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_search_results table
CREATE TABLE public.voice_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_id UUID NOT NULL,
  assistant TEXT NOT NULL,
  raw_results JSONB NOT NULL DEFAULT '{}',
  snippets JSONB NOT NULL DEFAULT '{}',
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  ai_overview_text TEXT,
  local_pack_results JSONB NOT NULL DEFAULT '{}',
  voice_transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_search_analysis table
CREATE TABLE public.voice_search_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL,
  firm_domain TEXT,
  firm_business_name TEXT,
  presence_score INTEGER NOT NULL DEFAULT 0,
  frequency_score INTEGER NOT NULL DEFAULT 0,
  competitive_score INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0,
  competitor_data JSONB NOT NULL DEFAULT '{}',
  optimization_suggestions JSONB NOT NULL DEFAULT '{}',
  compliance_issues JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_search_reports table
CREATE TABLE public.voice_search_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'pdf',
  report_data JSONB NOT NULL DEFAULT '{}',
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_search_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_search_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for voice_search_tests
CREATE POLICY "Users can create their own voice search tests" 
ON public.voice_search_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own voice search tests" 
ON public.voice_search_tests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice search tests" 
ON public.voice_search_tests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice search tests" 
ON public.voice_search_tests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for voice_search_queries
CREATE POLICY "Users can view queries for their tests" 
ON public.voice_search_queries 
FOR SELECT 
USING (test_id IN (SELECT id FROM public.voice_search_tests WHERE user_id = auth.uid()));

CREATE POLICY "System can manage queries" 
ON public.voice_search_queries 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for voice_search_results
CREATE POLICY "Users can view results for their tests" 
ON public.voice_search_results 
FOR SELECT 
USING (query_id IN (
  SELECT vq.id FROM public.voice_search_queries vq 
  JOIN public.voice_search_tests vt ON vq.test_id = vt.id 
  WHERE vt.user_id = auth.uid()
));

CREATE POLICY "System can manage results" 
ON public.voice_search_results 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for voice_search_analysis
CREATE POLICY "Users can view analysis for their tests" 
ON public.voice_search_analysis 
FOR SELECT 
USING (test_id IN (SELECT id FROM public.voice_search_tests WHERE user_id = auth.uid()));

CREATE POLICY "System can manage analysis" 
ON public.voice_search_analysis 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for voice_search_reports
CREATE POLICY "Users can view their own reports" 
ON public.voice_search_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.voice_search_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_voice_search_tests_updated_at
BEFORE UPDATE ON public.voice_search_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_search_analysis_updated_at
BEFORE UPDATE ON public.voice_search_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();