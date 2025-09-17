-- Clean up duplicate marketing events (fixed version)
-- Keep the most recent version of each duplicate and merge content suggestions

-- First, create a temporary table to identify duplicates
CREATE TEMP TABLE duplicate_events AS
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
SELECT 
  event_ids[1] as keep_id,
  unnest(event_ids[2:]) as delete_id
FROM duplicate_groups;

-- Update the kept events with merged tags from duplicates
UPDATE marketing_events 
SET tags = (
  SELECT array_agg(DISTINCT tag)
  FROM (
    SELECT unnest(tags) as tag
    FROM marketing_events m2
    WHERE m2.event_date = marketing_events.event_date
      AND lower(trim(m2.title)) = lower(trim(marketing_events.title))
      AND m2.event_type = marketing_events.event_type
      AND m2.is_active = true
  ) t
  WHERE tag IS NOT NULL AND tag != ''
),
updated_at = now()
WHERE id IN (SELECT keep_id FROM duplicate_events);

-- Delete the duplicate events
DELETE FROM marketing_events 
WHERE id IN (SELECT delete_id FROM duplicate_events);