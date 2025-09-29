-- Add National Preparedness Month for October 2025
INSERT INTO public.marketing_events (
  title,
  description,
  event_date,
  event_type,
  tags,
  content_suggestions,
  created_by,
  is_active
) VALUES (
  'National Preparedness Month',
  'October is National Preparedness Month - a time to encourage Americans to take steps to prepare for emergencies in their homes, businesses, schools, and communities.',
  '2025-10-01',
  'system',
  ARRAY['preparedness', 'emergency', 'planning', 'safety', 'awareness'],
  '{
    "social_media": [
      "Share emergency preparedness tips for law firms",
      "Highlight the importance of business continuity planning", 
      "Post about disaster recovery for legal practices"
    ],
    "blog_topics": [
      "Legal Considerations in Emergency Preparedness",
      "Business Continuity Planning for Law Firms",
      "Protecting Client Data During Disasters"
    ],
    "hashtags": ["#NationalPreparednessMonth", "#EmergencyPreparedness", "#LawFirmSafety", "#BusinessContinuity"]
  }'::jsonb,
  NULL,
  true
);