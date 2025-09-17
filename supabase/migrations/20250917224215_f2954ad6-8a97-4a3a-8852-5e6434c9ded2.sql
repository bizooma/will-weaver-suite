-- Restore essential legal calendar events for law firms
INSERT INTO public.marketing_events (title, description, event_date, event_type, tags, content_suggestions) VALUES
-- January
('Martin Luther King Jr. Day', 'Federal holiday honoring civil rights leader', '2024-01-15', 'system', ARRAY['civil rights', 'federal holiday', 'justice'], '{"suggestions": "Share content about civil rights law, pro bono work, or community service initiatives"}'),
('Legal Technology Month', 'Month-long focus on legal technology innovations', '2024-01-01', 'system', ARRAY['legal tech', 'innovation', 'efficiency'], '{"suggestions": "Highlight your firm''s use of technology, share legal tech tips, or discuss digital transformation"}'),

-- February
('American Heart Month', 'Health awareness month', '2024-02-01', 'system', ARRAY['health', 'awareness', 'wellness'], '{"suggestions": "Connect health law topics, workplace wellness policies, or healthcare compliance"}'),

-- March
('National Ethics Awareness Month', 'Focus on legal ethics and professional responsibility', '2024-03-01', 'system', ARRAY['ethics', 'professional responsibility', 'compliance'], '{"suggestions": "Share insights on legal ethics, professional conduct standards, or compliance best practices"}'),

-- April
('National Volunteer Week', 'Celebrating volunteerism and community service', '2024-04-21', 'system', ARRAY['volunteering', 'community service', 'pro bono'], '{"suggestions": "Highlight your firm''s pro bono work, volunteer activities, or community involvement"}'),

-- May
('Law Day', 'Annual event to celebrate the rule of law', '2024-05-01', 'system', ARRAY['law day', 'rule of law', 'legal profession'], '{"suggestions": "Share the importance of the legal system, constitutional rights, or your firm''s commitment to justice"}'),
('National Small Business Week', 'Celebrating small businesses and entrepreneurs', '2024-05-05', 'system', ARRAY['small business', 'entrepreneurship', 'business law'], '{"suggestions": "Offer business law tips, discuss startup legal needs, or highlight small business clients"}'),

-- June
('National Safety Month', 'Focus on safety and accident prevention', '2024-06-01', 'system', ARRAY['safety', 'workplace safety', 'personal injury'], '{"suggestions": "Share workplace safety tips, discuss personal injury law, or highlight safety regulations"}'),

-- July
('Independence Day', 'Celebrating American independence and freedom', '2024-07-04', 'system', ARRAY['independence day', 'freedom', 'constitution'], '{"suggestions": "Discuss constitutional rights, freedom of speech, or the founding principles of American law"}'),

-- August
('National Immunization Awareness Month', 'Promoting vaccination and public health', '2024-08-01', 'system', ARRAY['public health', 'immunization', 'healthcare law'], '{"suggestions": "Discuss healthcare law, vaccination policies, or public health regulations"}'),

-- September
('Constitution Day', 'Commemorating the signing of the U.S. Constitution', '2024-09-17', 'system', ARRAY['constitution', 'constitutional law', 'founding documents'], '{"suggestions": "Share insights about constitutional law, Bill of Rights, or foundational legal principles"}'),
('National Preparedness Month', 'Focus on emergency preparedness', '2024-09-01', 'system', ARRAY['emergency preparedness', 'disaster planning', 'business continuity'], '{"suggestions": "Discuss business continuity planning, disaster recovery legal issues, or emergency legal preparations"}'),

-- October
('National Cyber Security Awareness Month', 'Promoting cybersecurity best practices', '2024-10-01', 'system', ARRAY['cybersecurity', 'data protection', 'privacy law'], '{"suggestions": "Share cybersecurity tips for law firms, discuss data breach laws, or highlight privacy compliance"}'),
('Pro Bono Week', 'Celebrating pro bono legal services', '2024-10-20', 'system', ARRAY['pro bono', 'legal aid', 'access to justice'], '{"suggestions": "Highlight your pro bono work, discuss access to justice issues, or promote legal aid resources"}'),

-- November
('Veterans Day', 'Honoring military veterans', '2024-11-11', 'system', ARRAY['veterans', 'military', 'service'], '{"suggestions": "Honor veteran clients, discuss veterans'' benefits law, or highlight military service connections"}'),
('National Adoption Month', 'Raising awareness about adoption', '2024-11-01', 'system', ARRAY['adoption', 'family law', 'children'], '{"suggestions": "Share adoption law insights, discuss family law services, or highlight adoption success stories"}'),

-- December
('Human Rights Day', 'Commemorating the Universal Declaration of Human Rights', '2024-12-10', 'system', ARRAY['human rights', 'civil rights', 'international law'], '{"suggestions": "Discuss human rights law, civil liberties, or international legal principles"}'),
('Bill of Rights Day', 'Celebrating the first 10 amendments to the Constitution', '2024-12-15', 'system', ARRAY['bill of rights', 'constitutional amendments', 'civil liberties'], '{"suggestions": "Explore constitutional amendments, discuss civil liberties, or share insights on individual rights"}');

-- Add recurring annual events for 2025
INSERT INTO public.marketing_events (title, description, event_date, event_type, tags, content_suggestions) VALUES
-- 2025 events
('Martin Luther King Jr. Day', 'Federal holiday honoring civil rights leader', '2025-01-20', 'system', ARRAY['civil rights', 'federal holiday', 'justice'], '{"suggestions": "Share content about civil rights law, pro bono work, or community service initiatives"}'),
('Law Day', 'Annual event to celebrate the rule of law', '2025-05-01', 'system', ARRAY['law day', 'rule of law', 'legal profession'], '{"suggestions": "Share the importance of the legal system, constitutional rights, or your firm''s commitment to justice"}'),
('Independence Day', 'Celebrating American independence and freedom', '2025-07-04', 'system', ARRAY['independence day', 'freedom', 'constitution'], '{"suggestions": "Discuss constitutional rights, freedom of speech, or the founding principles of American law"}'),
('Constitution Day', 'Commemorating the signing of the U.S. Constitution', '2025-09-17', 'system', ARRAY['constitution', 'constitutional law', 'founding documents'], '{"suggestions": "Share insights about constitutional law, Bill of Rights, or foundational legal principles"}'),
('Veterans Day', 'Honoring military veterans', '2025-11-11', 'system', ARRAY['veterans', 'military', 'service'], '{"suggestions": "Honor veteran clients, discuss veterans'' benefits law, or highlight military service connections"}'),
('Human Rights Day', 'Commemorating the Universal Declaration of Human Rights', '2025-12-10', 'system', ARRAY['human rights', 'civil rights', 'international law'], '{"suggestions": "Discuss human rights law, civil liberties, or international legal principles"}'),
('Bill of Rights Day', 'Celebrating the first 10 amendments to the Constitution', '2025-12-15', 'system', ARRAY['bill of rights', 'constitutional amendments', 'civil liberties'], '{"suggestions": "Explore constitutional amendments, discuss civil liberties, or share insights on individual rights"}');