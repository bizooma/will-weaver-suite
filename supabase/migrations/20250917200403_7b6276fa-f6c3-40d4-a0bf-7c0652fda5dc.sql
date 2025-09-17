-- Remove any remaining duplicate system events using ROW_NUMBER approach
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(title), event_date, event_type 
      ORDER BY created_at ASC
    ) AS rn
  FROM marketing_events
  WHERE event_type = 'system'
)
DELETE FROM marketing_events 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Create a unique constraint to prevent future duplicates for system events
CREATE UNIQUE INDEX IF NOT EXISTS ux_system_events_title_date
ON marketing_events (lower(title), event_date)
WHERE event_type = 'system';