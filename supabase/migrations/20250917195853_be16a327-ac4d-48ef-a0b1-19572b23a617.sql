-- Add special marketing days for social media campaigns
INSERT INTO marketing_events (title, description, event_date, event_type, tags, content_suggestions) VALUES

-- Love & Relationships (Family Law Focus)
('Valentine''s Day', 'Day of love and romance - perfect for family law marketing', '2025-02-14', 'system', ARRAY['family-law', 'relationships', 'seasonal'], '{"suggestions": "Share tips on prenups, estate planning for couples, or family law advice. Post about protecting love through legal planning."}'),
('Sweetest Day', 'Holiday to show appreciation for loved ones', '2025-10-18', 'system', ARRAY['family-law', 'relationships'], '{"suggestions": "Focus on family protection, guardianship, or estate planning content. Share stories about protecting what matters most."}'),
('National Wedding Month', 'June is traditionally wedding season', '2025-06-01', 'system', ARRAY['family-law', 'estate-planning', 'seasonal'], '{"suggestions": "Promote prenuptial agreements, name changes, estate planning for newlyweds. Share wedding law tips."}'),

-- Health & Awareness (Personal Injury/Healthcare Law)
('World Health Day', 'Global health awareness day', '2025-04-07', 'system', ARRAY['healthcare-law', 'personal-injury', 'awareness'], '{"suggestions": "Discuss healthcare directives, medical malpractice awareness, or patient rights. Share health-related legal tips."}'),
('Mental Health Awareness Month', 'May focuses on mental health', '2025-05-01', 'system', ARRAY['healthcare-law', 'disability-law', 'awareness'], '{"suggestions": "Address mental health in legal contexts, disability rights, workplace accommodations, or healthcare directives."}'),
('National Safety Month', 'June promotes safety awareness', '2025-06-01', 'system', ARRAY['personal-injury', 'workplace-law', 'awareness'], '{"suggestions": "Share workplace safety tips, personal injury prevention, or liability information. Promote safety in legal contexts."}'),

-- Business & Finance (Business Law Focus)
('National Small Business Week', 'Celebrating small businesses', '2025-05-04', 'system', ARRAY['business-law', 'entrepreneurship'], '{"suggestions": "Offer business formation tips, contract advice, intellectual property basics. Support local small businesses."}'),
('Tax Day', 'Federal tax filing deadline', '2025-04-15', 'system', ARRAY['business-law', 'tax-law', 'finance'], '{"suggestions": "Share tax law updates, business deduction tips, or estate tax information. Remind about legal tax strategies."}'),
('Financial Literacy Month', 'April promotes financial education', '2025-04-01', 'system', ARRAY['estate-planning', 'business-law', 'education'], '{"suggestions": "Educate on financial legal matters, estate planning, business finances, or investment law basics."}'),

-- Senior & Estate Planning
('National Senior Citizens Day', 'Honoring older adults', '2025-08-21', 'system', ARRAY['estate-planning', 'elder-law', 'senior-focused'], '{"suggestions": "Focus on elder law, estate planning, Medicare issues, or senior rights. Share resources for aging adults."}'),
('National Estate Planning Awareness Week', 'Third week of October', '2025-10-20', 'system', ARRAY['estate-planning', 'awareness'], '{"suggestions": "Promote wills, trusts, powers of attorney. Share estate planning checklists and importance of planning ahead."}'),

-- Technology & Privacy (Cyber Law)
('Data Privacy Day', 'Promoting privacy awareness', '2025-01-28', 'system', ARRAY['privacy-law', 'technology', 'cybersecurity'], '{"suggestions": "Discuss data protection laws, privacy rights, business data security, or cyber crime prevention."}'),
('Cybersecurity Awareness Month', 'October focuses on cyber safety', '2025-10-01', 'system', ARRAY['cybersecurity', 'business-law', 'awareness'], '{"suggestions": "Share cyber security legal tips, data breach response, privacy policies, or digital rights information."}'),

-- Education & Youth
('National Education Week', 'Celebrating education', '2025-11-17', 'system', ARRAY['education-law', 'family-law'], '{"suggestions": "Discuss education law, student rights, special education advocacy, or school district issues."}'),
('Back to School Season', 'Students returning to school', '2025-08-25', 'system', ARRAY['education-law', 'family-law', 'seasonal'], '{"suggestions": "Share education law tips, student privacy rights, or family legal preparation for school year."}'),

-- Community & Social Justice
('Law Day', 'Annual event to celebrate rule of law', '2025-05-01', 'system', ARRAY['legal-profession', 'community', 'awareness'], '{"suggestions": "Celebrate the legal profession, share law facts, promote access to justice, or highlight legal system importance."}'),
('Constitution Day', 'Commemorating the US Constitution', '2025-09-17', 'system', ARRAY['constitutional-law', 'civic-education'], '{"suggestions": "Share constitutional law insights, civic education, or fundamental rights information. Celebrate legal foundations."}'),
('Pro Bono Week', 'Celebrating volunteer legal services', '2025-10-27', 'system', ARRAY['legal-profession', 'community-service'], '{"suggestions": "Highlight pro bono work, access to justice, community legal services, or volunteer opportunities."}'),

-- Seasonal & Cultural
('Earth Day', 'Environmental awareness day', '2025-04-22', 'system', ARRAY['environmental-law', 'awareness'], '{"suggestions": "Discuss environmental law, regulatory compliance, green business practices, or sustainability legal issues."}'),
('National Volunteer Week', 'Celebrating volunteers', '2025-04-20', 'system', ARRAY['nonprofit-law', 'community'], '{"suggestions": "Highlight nonprofit law, volunteer protection, charitable giving laws, or community service legal aspects."}'),
('National Consumer Protection Week', 'First week of March', '2025-03-03', 'system', ARRAY['consumer-protection', 'business-law'], '{"suggestions": "Share consumer rights information, fraud prevention, warranty law, or business compliance tips."}'),

-- Recurring Annual Events for 2026
('Valentine''s Day', 'Day of love and romance - perfect for family law marketing', '2026-02-14', 'system', ARRAY['family-law', 'relationships', 'seasonal'], '{"suggestions": "Share tips on prenups, estate planning for couples, or family law advice. Post about protecting love through legal planning."}'),
('Tax Day', 'Federal tax filing deadline', '2026-04-15', 'system', ARRAY['business-law', 'tax-law', 'finance'], '{"suggestions": "Share tax law updates, business deduction tips, or estate tax information. Remind about legal tax strategies."}'),
('Earth Day', 'Environmental awareness day', '2026-04-22', 'system', ARRAY['environmental-law', 'awareness'], '{"suggestions": "Discuss environmental law, regulatory compliance, green business practices, or sustainability legal issues."}'),
('Law Day', 'Annual event to celebrate rule of law', '2026-05-01', 'system', ARRAY['legal-profession', 'community', 'awareness'], '{"suggestions": "Celebrate the legal profession, share law facts, promote access to justice, or highlight legal system importance."}'),
('Constitution Day', 'Commemorating the US Constitution', '2026-09-17', 'system', ARRAY['constitutional-law', 'civic-education'], '{"suggestions": "Share constitutional law insights, civic education, or fundamental rights information. Celebrate legal foundations."}'),
('Sweetest Day', 'Holiday to show appreciation for loved ones', '2026-10-17', 'system', ARRAY['family-law', 'relationships'], '{"suggestions": "Focus on family protection, guardianship, or estate planning content. Share stories about protecting what matters most."}');