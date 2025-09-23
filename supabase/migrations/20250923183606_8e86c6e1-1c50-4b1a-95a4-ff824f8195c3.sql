-- Create platform training categories table
CREATE TABLE public.platform_training_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create platform training videos table
CREATE TABLE public.platform_training_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.platform_training_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL, -- Extract from URL for embedding
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user video progress tracking table
CREATE TABLE public.user_video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.platform_training_videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.platform_training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view active categories" 
ON public.platform_training_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.platform_training_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for videos
CREATE POLICY "Anyone can view active videos" 
ON public.platform_training_videos 
FOR SELECT 
USING (is_active = true AND category_id IN (
  SELECT id FROM public.platform_training_categories WHERE is_active = true
));

CREATE POLICY "Admins can manage videos" 
ON public.platform_training_videos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for progress
CREATE POLICY "Users can view their own progress" 
ON public.user_video_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.user_video_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_video_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_platform_training_categories_updated_at
BEFORE UPDATE ON public.platform_training_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_training_videos_updated_at
BEFORE UPDATE ON public.platform_training_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_video_progress_updated_at
BEFORE UPDATE ON public.user_video_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.platform_training_categories (name, description, icon, display_order) VALUES
('Search Engine Optimization (SEO)', 'Learn how to optimize your law firm website for search engines', 'Search', 1),
('Pay-Per-Click Advertising (PPC)', 'Master Google Ads and paid advertising strategies for law firms', 'MousePointer', 2),
('Social Media Marketing', 'Build your law firm presence on social media platforms', 'Share2', 3),
('Content Marketing & Blogging', 'Create compelling content that attracts and converts clients', 'FileText', 4),
('Email Marketing', 'Develop effective email campaigns for client acquisition and retention', 'Mail', 5),
('Local SEO & Google My Business', 'Dominate local search results and optimize your Google My Business profile', 'MapPin', 6),
('Conversion Rate Optimization', 'Optimize your website to convert more visitors into clients', 'TrendingUp', 7),
('Analytics & Reporting', 'Track and measure your digital marketing performance', 'BarChart', 8),
('Client Retention Strategies', 'Keep clients happy and encourage referrals', 'Users', 9);