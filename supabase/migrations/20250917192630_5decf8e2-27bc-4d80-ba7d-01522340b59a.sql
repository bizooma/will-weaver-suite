-- Remove duplicate marketing events, keeping only the oldest entry for each unique holiday
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY title, event_date, event_type 
      ORDER BY created_at ASC
    ) as rn
  FROM marketing_events
  WHERE event_type = 'system'
)
DELETE FROM marketing_events 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);