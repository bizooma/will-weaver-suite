-- 1) Remove any duplicate system events (same title/date)
WITH duplicates AS (
  SELECT lower(title) AS ltitle, event_date, MIN(id) AS keep_id, COUNT(*) AS cnt
  FROM marketing_events
  WHERE event_type = 'system'
  GROUP BY lower(title), event_date
  HAVING COUNT(*) > 1
)
DELETE FROM marketing_events m
USING duplicates d
WHERE m.event_type = 'system'
  AND lower(m.title) = d.ltitle
  AND m.event_date = d.event_date
  AND m.id <> d.keep_id;

-- 2) Prevent future duplicates for system events
CREATE UNIQUE INDEX IF NOT EXISTS ux_system_events_title_date
ON marketing_events ((lower(title)), event_date)
WHERE event_type = 'system';