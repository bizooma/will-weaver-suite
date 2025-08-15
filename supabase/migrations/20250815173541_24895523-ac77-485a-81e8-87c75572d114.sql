-- Add missing background_task_status column to contact_submissions table
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS background_task_status TEXT;