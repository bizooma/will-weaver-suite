-- More comprehensive duplicate cleanup for Constitution Day and similar events
UPDATE marketing_events 
SET is_active = false 
WHERE id IN (
  -- Keep only one Constitution Day event
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY event_date 
      ORDER BY 
        CASE 
          WHEN title = 'Constitution Day' THEN 1
          WHEN title LIKE '%Constitution Day%' THEN 2
          ELSE 3
        END,
        created_at DESC
    ) as rn
    FROM marketing_events 
    WHERE event_date = '2025-09-17' 
      AND (title ILIKE '%constitution%' OR title ILIKE '%constitution day%')
      AND is_active = true
  ) ranked 
  WHERE rn > 1
);

-- Clean up other potential duplicates with similar logic patterns
WITH similar_events AS (
  SELECT 
    event_date,
    -- Group similar titles together
    CASE 
      WHEN title ILIKE '%constitution%' THEN 'Constitution Day'
      WHEN title ILIKE '%memorial day%' THEN 'Memorial Day'
      WHEN title ILIKE '%independence%' OR title ILIKE '%july 4%' OR title ILIKE '%4th of july%' THEN 'Independence Day'
      WHEN title ILIKE '%labor day%' THEN 'Labor Day'
      WHEN title ILIKE '%thanksgiving%' THEN 'Thanksgiving'
      WHEN title ILIKE '%veterans%' THEN 'Veterans Day'
      WHEN title ILIKE '%martin luther king%' OR title ILIKE '%mlk%' THEN 'Martin Luther King Jr. Day'
      ELSE title
    END as normalized_title,
    id,
    title,
    ROW_NUMBER() OVER (
      PARTITION BY event_date, 
      CASE 
        WHEN title ILIKE '%constitution%' THEN 'Constitution Day'
        WHEN title ILIKE '%memorial day%' THEN 'Memorial Day'
        WHEN title ILIKE '%independence%' OR title ILIKE '%july 4%' OR title ILIKE '%4th of july%' THEN 'Independence Day'
        WHEN title ILIKE '%labor day%' THEN 'Labor Day'
        WHEN title ILIKE '%thanksgiving%' THEN 'Thanksgiving'
        WHEN title ILIKE '%veterans%' THEN 'Veterans Day'
        WHEN title ILIKE '%martin luther king%' OR title ILIKE '%mlk%' THEN 'Martin Luther King Jr. Day'
        ELSE title
      END
      ORDER BY 
        LENGTH(title) ASC, -- Prefer shorter, cleaner titles
        created_at DESC
    ) as rn
  FROM marketing_events 
  WHERE is_active = true
    AND event_type = 'system'
)
UPDATE marketing_events 
SET is_active = false 
WHERE id IN (
  SELECT id FROM similar_events WHERE rn > 1
);