-- Update Canadian Thanksgiving from October 12th to October 13th for 2026
UPDATE marketing_events 
SET event_date = '2026-10-13'::date,
    updated_at = now()
WHERE title = 'Thanksgiving (Canada)' 
AND event_date = '2026-10-12'::date;