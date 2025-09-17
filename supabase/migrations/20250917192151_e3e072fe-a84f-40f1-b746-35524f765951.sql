-- Insert US and Canadian holidays for 2025-2026 into marketing_events table

-- US Federal Holidays 2025
INSERT INTO marketing_events (title, description, event_date, event_type, created_by, tags, content_suggestions, is_active) VALUES
('New Year''s Day', 'Federal holiday marking the beginning of the calendar year', '2025-01-01', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Marketing Opportunity'], '{"suggestions": "New year, new legal resolutions. Share content about estate planning for the new year, business formation for new entrepreneurs, and legal checkups for existing clients."}', true),

('Martin Luther King Jr. Day', 'Federal holiday honoring civil rights leader Martin Luther King Jr.', '2025-01-20', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Civil Rights'], '{"suggestions": "Honor MLK''s legacy by sharing content about civil rights law, workplace discrimination protections, and equal justice under law."}', true),

('Presidents'' Day', 'Federal holiday honoring all U.S. presidents', '2025-02-17', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday'], '{"suggestions": "Celebrate American leadership and constitutional law. Share content about constitutional rights, presidential powers, and the rule of law."}', true),

('Memorial Day', 'Federal holiday honoring military personnel who died in service', '2025-05-26', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Veterans'], '{"suggestions": "Honor fallen heroes and highlight veterans'' legal rights, military family law, and VA benefits assistance."}', true),

('Juneteenth', 'Federal holiday commemorating the emancipation of enslaved African Americans', '2025-06-19', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Civil Rights'], '{"suggestions": "Commemorate freedom and justice. Share content about civil rights protections, workplace equality, and anti-discrimination laws."}', true),

('Independence Day', 'Federal holiday celebrating American independence', '2025-07-04', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Constitution'], '{"suggestions": "Celebrate American freedoms and constitutional rights. Share content about Bill of Rights, constitutional law, and legal protections for citizens."}', true),

('Labor Day', 'Federal holiday honoring the American labor movement', '2025-09-01', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Employment Law'], '{"suggestions": "Focus on workers'' rights and employment law. Share content about workplace safety, wage and hour laws, and employee protections."}', true),

('Columbus Day', 'Federal holiday commemorating Christopher Columbus''s arrival in the Americas', '2025-10-13', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday'], '{"suggestions": "Reflect on history and cultural heritage. Share content about indigenous rights, cultural preservation laws, and heritage protection."}', true),

('Veterans Day', 'Federal holiday honoring military veterans', '2025-11-11', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Veterans'], '{"suggestions": "Thank veterans for their service. Share content about veterans'' benefits, military family law, and legal services for service members."}', true),

('Thanksgiving', 'Federal holiday for giving thanks', '2025-11-27', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Family'], '{"suggestions": "Express gratitude and focus on family law. Share content about family legal planning, estate planning, and protecting what matters most."}', true),

('Christmas Day', 'Federal holiday celebrating Christmas', '2025-12-25', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Family'], '{"suggestions": "Celebrate the season of giving. Share content about charitable giving laws, tax deductions, and year-end estate planning."}', true),

-- Canadian National Holidays 2025
('New Year''s Day (Canada)', 'National holiday marking the beginning of the calendar year', '2025-01-01', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Marketing Opportunity'], '{"suggestions": "New year, new legal resolutions for Canadian clients. Share content about business law updates, tax law changes, and legal planning for the new year."}', true),

('Family Day (Canada)', 'Provincial holiday celebrating family', '2025-02-17', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'Provincial Holiday', 'Family'], '{"suggestions": "Celebrate family connections. Share content about family law, child custody, adoption services, and protecting family interests."}', true),

('Good Friday (Canada)', 'Christian holiday commemorating the crucifixion of Jesus', '2025-04-18', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Reflect on sacrifice and service. Share content about legal aid services, pro bono work, and serving the community."}', true),

('Easter Monday (Canada)', 'Christian holiday celebrating Easter', '2025-04-21', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Celebrate renewal and new beginnings. Share content about business restructuring, fresh starts, and legal solutions for moving forward."}', true),

('Victoria Day (Canada)', 'National holiday honoring Queen Victoria', '2025-05-19', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Honor Canadian heritage and constitutional monarchy. Share content about constitutional law, Charter of Rights and Freedoms, and Canadian legal traditions."}', true),

('Canada Day', 'National holiday celebrating Canadian Confederation', '2025-07-01', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Constitution'], '{"suggestions": "Celebrate Canadian independence and values. Share content about Charter rights, Canadian constitutional law, and legal protections for Canadians."}', true),

('Civic Holiday (Canada)', 'Provincial holiday celebrating community', '2025-08-04', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'Provincial Holiday'], '{"suggestions": "Celebrate community involvement. Share content about municipal law, civic responsibilities, and community legal services."}', true),

('Labour Day (Canada)', 'National holiday honoring the labor movement', '2025-09-01', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Employment Law'], '{"suggestions": "Focus on workers'' rights in Canada. Share content about employment standards, workplace safety laws, and labor relations."}', true),

('Thanksgiving (Canada)', 'National holiday for giving thanks', '2025-10-13', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Family'], '{"suggestions": "Express gratitude and focus on what matters most. Share content about estate planning, family law, and protecting loved ones."}', true),

('Remembrance Day (Canada)', 'National holiday honoring military sacrifice', '2025-11-11', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Veterans'], '{"suggestions": "Honor those who served. Share content about veterans'' affairs, military family law, and legal services for service members and their families."}', true),

('Christmas Day (Canada)', 'National holiday celebrating Christmas', '2025-12-25', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Family'], '{"suggestions": "Celebrate the season of giving. Share content about charitable tax benefits, estate planning, and year-end legal considerations."}', true),

('Boxing Day (Canada)', 'National holiday following Christmas', '2025-12-26', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Focus on giving back and community service. Share content about charitable organizations, volunteer legal services, and community involvement."}', true),

-- Important Legal/Business Dates 2025
('Tax Day (US)', 'Federal income tax filing deadline', '2025-04-15', 'system', NULL, ARRAY['Business Date', 'US Tax', 'Legal Deadline', 'Marketing Opportunity'], '{"suggestions": "Help clients with tax-related legal issues. Share content about tax law, business deductions, tax dispute resolution, and tax planning strategies."}', true),

('Tax Filing Deadline (Canada)', 'Individual income tax filing deadline', '2025-04-30', 'system', NULL, ARRAY['Business Date', 'Canadian Tax', 'Legal Deadline', 'Marketing Opportunity'], '{"suggestions": "Assist Canadian clients with tax matters. Share content about tax compliance, business tax issues, and tax dispute resolution services."}', true),

('National Law Day (US)', 'Day celebrating the rule of law', '2025-05-01', 'system', NULL, ARRAY['Legal Holiday', 'US Legal', 'Professional Day'], '{"suggestions": "Celebrate the legal profession and rule of law. Share content about access to justice, legal rights education, and the importance of legal representation."}', true),

('Constitution Day (US)', 'Day commemorating the signing of the US Constitution', '2025-09-17', 'system', NULL, ARRAY['Legal Holiday', 'US Legal', 'Constitution', 'Professional Day'], '{"suggestions": "Honor the Constitution and rule of law. Share content about constitutional rights, civil liberties, and the foundation of American law."}', true);

-- US Federal Holidays 2026
INSERT INTO marketing_events (title, description, event_date, event_type, created_by, tags, content_suggestions, is_active) VALUES
('New Year''s Day', 'Federal holiday marking the beginning of the calendar year', '2026-01-01', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Marketing Opportunity'], '{"suggestions": "New year, new legal resolutions. Share content about estate planning for the new year, business formation for new entrepreneurs, and legal checkups for existing clients."}', true),

('Martin Luther King Jr. Day', 'Federal holiday honoring civil rights leader Martin Luther King Jr.', '2026-01-19', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Civil Rights'], '{"suggestions": "Honor MLK''s legacy by sharing content about civil rights law, workplace discrimination protections, and equal justice under law."}', true),

('Presidents'' Day', 'Federal holiday honoring all U.S. presidents', '2026-02-16', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday'], '{"suggestions": "Celebrate American leadership and constitutional law. Share content about constitutional rights, presidential powers, and the rule of law."}', true),

('Memorial Day', 'Federal holiday honoring military personnel who died in service', '2026-05-25', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Veterans'], '{"suggestions": "Honor fallen heroes and highlight veterans'' legal rights, military family law, and VA benefits assistance."}', true),

('Juneteenth', 'Federal holiday commemorating the emancipation of enslaved African Americans', '2026-06-19', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Civil Rights'], '{"suggestions": "Commemorate freedom and justice. Share content about civil rights protections, workplace equality, and anti-discrimination laws."}', true),

('Independence Day', 'Federal holiday celebrating American independence', '2026-07-04', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Constitution'], '{"suggestions": "Celebrate American freedoms and constitutional rights. Share content about Bill of Rights, constitutional law, and legal protections for citizens."}', true),

('Labor Day', 'Federal holiday honoring the American labor movement', '2026-09-07', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Employment Law'], '{"suggestions": "Focus on workers'' rights and employment law. Share content about workplace safety, wage and hour laws, and employee protections."}', true),

('Columbus Day', 'Federal holiday commemorating Christopher Columbus''s arrival in the Americas', '2026-10-12', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday'], '{"suggestions": "Reflect on history and cultural heritage. Share content about indigenous rights, cultural preservation laws, and heritage protection."}', true),

('Veterans Day', 'Federal holiday honoring military veterans', '2026-11-11', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Veterans'], '{"suggestions": "Thank veterans for their service. Share content about veterans'' benefits, military family law, and legal services for service members."}', true),

('Thanksgiving', 'Federal holiday for giving thanks', '2026-11-26', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Family'], '{"suggestions": "Express gratitude and focus on family law. Share content about family legal planning, estate planning, and protecting what matters most."}', true),

('Christmas Day', 'Federal holiday celebrating Christmas', '2026-12-25', 'system', NULL, ARRAY['Legal Holiday', 'US Holiday', 'Federal Holiday', 'Family'], '{"suggestions": "Celebrate the season of giving. Share content about charitable giving laws, tax deductions, and year-end estate planning."}', true),

-- Canadian National Holidays 2026
('New Year''s Day (Canada)', 'National holiday marking the beginning of the calendar year', '2026-01-01', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Marketing Opportunity'], '{"suggestions": "New year, new legal resolutions for Canadian clients. Share content about business law updates, tax law changes, and legal planning for the new year."}', true),

('Family Day (Canada)', 'Provincial holiday celebrating family', '2026-02-16', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'Provincial Holiday', 'Family'], '{"suggestions": "Celebrate family connections. Share content about family law, child custody, adoption services, and protecting family interests."}', true),

('Good Friday (Canada)', 'Christian holiday commemorating the crucifixion of Jesus', '2026-04-03', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Reflect on sacrifice and service. Share content about legal aid services, pro bono work, and serving the community."}', true),

('Easter Monday (Canada)', 'Christian holiday celebrating Easter', '2026-04-06', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Celebrate renewal and new beginnings. Share content about business restructuring, fresh starts, and legal solutions for moving forward."}', true),

('Victoria Day (Canada)', 'National holiday honoring Queen Victoria', '2026-05-18', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Honor Canadian heritage and constitutional monarchy. Share content about constitutional law, Charter of Rights and Freedoms, and Canadian legal traditions."}', true),

('Canada Day', 'National holiday celebrating Canadian Confederation', '2026-07-01', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Constitution'], '{"suggestions": "Celebrate Canadian independence and values. Share content about Charter rights, Canadian constitutional law, and legal protections for Canadians."}', true),

('Civic Holiday (Canada)', 'Provincial holiday celebrating community', '2026-08-03', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'Provincial Holiday'], '{"suggestions": "Celebrate community involvement. Share content about municipal law, civic responsibilities, and community legal services."}', true),

('Labour Day (Canada)', 'National holiday honoring the labor movement', '2026-09-07', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Employment Law'], '{"suggestions": "Focus on workers'' rights in Canada. Share content about employment standards, workplace safety laws, and labor relations."}', true),

('Thanksgiving (Canada)', 'National holiday for giving thanks', '2026-10-12', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Family'], '{"suggestions": "Express gratitude and focus on what matters most. Share content about estate planning, family law, and protecting loved ones."}', true),

('Remembrance Day (Canada)', 'National holiday honoring military sacrifice', '2026-11-11', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Veterans'], '{"suggestions": "Honor those who served. Share content about veterans'' affairs, military family law, and legal services for service members and their families."}', true),

('Christmas Day (Canada)', 'National holiday celebrating Christmas', '2026-12-25', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday', 'Family'], '{"suggestions": "Celebrate the season of giving. Share content about charitable tax benefits, estate planning, and year-end legal considerations."}', true),

('Boxing Day (Canada)', 'National holiday following Christmas', '2026-12-26', 'system', NULL, ARRAY['Legal Holiday', 'Canadian Holiday', 'National Holiday'], '{"suggestions": "Focus on giving back and community service. Share content about charitable organizations, volunteer legal services, and community involvement."}', true),

-- Important Legal/Business Dates 2026
('Tax Day (US)', 'Federal income tax filing deadline', '2026-04-15', 'system', NULL, ARRAY['Business Date', 'US Tax', 'Legal Deadline', 'Marketing Opportunity'], '{"suggestions": "Help clients with tax-related legal issues. Share content about tax law, business deductions, tax dispute resolution, and tax planning strategies."}', true),

('Tax Filing Deadline (Canada)', 'Individual income tax filing deadline', '2026-04-30', 'system', NULL, ARRAY['Business Date', 'Canadian Tax', 'Legal Deadline', 'Marketing Opportunity'], '{"suggestions": "Assist Canadian clients with tax matters. Share content about tax compliance, business tax issues, and tax dispute resolution services."}', true),

('National Law Day (US)', 'Day celebrating the rule of law', '2026-05-01', 'system', NULL, ARRAY['Legal Holiday', 'US Legal', 'Professional Day'], '{"suggestions": "Celebrate the legal profession and rule of law. Share content about access to justice, legal rights education, and the importance of legal representation."}', true),

('Constitution Day (US)', 'Day commemorating the signing of the US Constitution', '2026-09-17', 'system', NULL, ARRAY['Legal Holiday', 'US Legal', 'Constitution', 'Professional Day'], '{"suggestions": "Honor the Constitution and rule of law. Share content about constitutional rights, civil liberties, and the foundation of American law."}', true);