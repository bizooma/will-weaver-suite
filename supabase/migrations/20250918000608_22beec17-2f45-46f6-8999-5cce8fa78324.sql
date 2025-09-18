-- Add remaining missing legal history events from Pack 2
INSERT INTO marketing_events (title, description, event_date, event_type, tags, content_suggestions) 
SELECT * FROM (VALUES 
  ('Gibbons v. Ogden Anniversary', 'SCOTUS affirmed federal power over interstate commerce (1824).', '2024-03-02', 'system', ARRAY['CommerceClause', 'SCOTUS', 'LegalHistory'], '{"practiceAreas": ["Constitutional", "Business"], "caption": "SCOTUS affirmed federal power over interstate commerce (1824)."}'),
  ('Worcester v. Georgia Anniversary', 'Decision recognized Tribal sovereignty against state laws (1832).', '2024-03-03', 'system', ARRAY['TribalSovereignty', 'SCOTUS', 'LegalHistory'], '{"practiceAreas": ["Tribal Law", "Constitutional"], "caption": "Decision recognized Tribal sovereignty against state laws (1832)."}'),
  ('Schenck v. United States Anniversary', 'The ''clear and present danger'' test announced (1919).', '2024-03-03', 'system', ARRAY['FreeSpeech', 'SCOTUS', 'LegalHistory'], '{"practiceAreas": ["First Amendment", "Criminal"], "caption": "The ''clear and present danger'' test announced (1919)."}'),
  ('McCulloch v. Maryland Anniversary', 'Necessary and Proper powers affirmed (1819).', '2024-03-06', 'system', ARRAY['NecessaryAndProper', 'SCOTUS', 'LegalHistory'], '{"practiceAreas": ["Constitutional", "Federal Courts"], "caption": "Necessary and Proper powers affirmed (1819)."}'),
  ('Crawford v. Washington Anniversary', 'Confrontation Clause standards reshaped in Crawford (2004).', '2024-03-08', 'system', ARRAY['ConfrontationClause', 'SixthAmendment', 'SCOTUS'], '{"practiceAreas": ["Criminal Procedure", "Constitutional"], "caption": "Confrontation Clause standards reshaped in Crawford (2004)."}'),
  ('Baker v. Carr Anniversary', '''One person, one vote'' principle advanced (1962).', '2024-03-26', 'system', ARRAY['Apportionment', 'VotingRights', 'SCOTUS'], '{"practiceAreas": ["Election Law", "Constitutional"], "caption": "''One person, one vote'' principle advanced (1962)."}'),
  ('Batson v. Kentucky Anniversary', 'Court restricted race‑based peremptory strikes (1986).', '2024-04-30', 'system', ARRAY['JurySelection', 'EqualProtection', 'SCOTUS'], '{"practiceAreas": ["Criminal Procedure", "Civil Rights"], "caption": "Court restricted race‑based peremptory strikes (1986)."}'),
  ('United States v. Lopez Anniversary', 'First modern case limiting Commerce Clause power (1995).', '2024-04-26', 'system', ARRAY['CommerceClause', 'Federalism', 'SCOTUS'], '{"practiceAreas": ["Constitutional", "Criminal"], "caption": "First modern case limiting Commerce Clause power (1995)."}'),
  ('Smith v. Allwright Anniversary', 'Court struck down white‑primary restrictions (1944).', '2024-04-03', 'system', ARRAY['VotingRights', 'SCOTUS', 'LegalHistory'], '{"practiceAreas": ["Election Law", "Civil Rights"], "caption": "Court struck down white‑primary restrictions (1944)."}'),
  ('Brandenburg v. Ohio Anniversary', 'Modern incitement standard announced (1969).', '2024-06-09', 'system', ARRAY['FreeSpeech', 'Incitement', 'SCOTUS'], '{"practiceAreas": ["First Amendment", "Criminal"], "caption": "Modern incitement standard announced (1969)."}')
) AS v(title, description, event_date, event_type, tags, content_suggestions)
WHERE NOT EXISTS (
  SELECT 1 FROM marketing_events me 
  WHERE me.title = v.title AND me.event_date = v.event_date
)