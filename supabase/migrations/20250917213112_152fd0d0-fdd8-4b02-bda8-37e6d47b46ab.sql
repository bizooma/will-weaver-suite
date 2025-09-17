-- Clean up duplicate marketing events
-- Keep the most recent version of each duplicate and merge content suggestions

WITH duplicate_groups AS (
  SELECT 
    event_date,
    lower(trim(title)) as normalized_title,
    event_type,
    array_agg(id ORDER BY created_at DESC) as event_ids,
    array_agg(tags) as all_tags,
    array_agg(content_suggestions) as all_content,
    COUNT(*) as duplicate_count
  FROM marketing_events 
  WHERE is_active = true
  GROUP BY event_date, lower(trim(title)), event_type
  HAVING COUNT(*) > 1
),
merged_data AS (
  SELECT 
    event_ids[1] as keep_id,
    array_remove(event_ids, event_ids[1]) as delete_ids,
    (
      SELECT array_agg(DISTINCT tag) 
      FROM unnest(array_cat_agg(all_tags)) as tag 
      WHERE tag IS NOT NULL AND tag != ''
    ) as merged_tags,
    (
      SELECT jsonb_object_agg(
        'suggestions', 
        string_agg(DISTINCT content->>'suggestions', ' | ')
      )
      FROM unnest(all_content) as content
      WHERE content IS NOT NULL AND content != '{}'::jsonb
    ) as merged_content
  FROM duplicate_groups
)
-- Update the kept events with merged data
UPDATE marketing_events 
SET 
  tags = merged_data.merged_tags,
  content_suggestions = COALESCE(merged_data.merged_content, content_suggestions),
  updated_at = now()
FROM merged_data 
WHERE marketing_events.id = merged_data.keep_id;

-- Delete the duplicate events
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
DELETE FROM marketing_events 
WHERE id IN (
  SELECT unnest(array_remove(event_ids, event_ids[1]))
  FROM duplicate_groups
);