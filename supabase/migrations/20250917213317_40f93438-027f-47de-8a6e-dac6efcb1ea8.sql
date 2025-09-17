-- Clean up duplicate marketing events with corrected syntax
-- First, let's see the duplicates and then clean them up

WITH duplicate_groups AS (
  SELECT 
    event_date,
    lower(trim(title)) as normalized_title,
    event_type,
    array_agg(id ORDER BY created_at DESC) as event_ids,
    COUNT(*) as duplicate_count
  FROM marketing_events 
  WHERE is_active = true
  GROUP BY event_date, lower(trim(title)), event_type
  HAVING COUNT(*) > 1
)
-- Delete duplicate events, keeping only the most recent one
DELETE FROM marketing_events 
WHERE id IN (
  SELECT unnest(event_ids[2:]) 
  FROM duplicate_groups
);

-- Add a unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_events_unique 
ON marketing_events (event_date, lower(trim(title)), event_type) 
WHERE is_active = true;