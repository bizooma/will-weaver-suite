-- Remove duplicate events that were created in the recent migration
-- Keep the older versions and remove the newer duplicates

DELETE FROM marketing_events 
WHERE id IN (
  'cf3cdf11-5ad4-4a45-91c7-1a984ab8746b' -- newer duplicate of Cybersecurity Awareness Month
);

-- Check for other potential duplicates and remove them if they exist
-- This will remove any events that have the same title and date but were created more recently
DELETE FROM marketing_events a
WHERE a.created_at > '2025-09-17 19:58:50'
AND EXISTS (
  SELECT 1 FROM marketing_events b 
  WHERE a.title = b.title 
  AND a.event_date = b.event_date 
  AND a.created_at > b.created_at
);