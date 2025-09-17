-- Insert US Legal History Pack 2 events into marketing_events table
INSERT INTO public.marketing_events (
  title, 
  description, 
  event_date, 
  event_type, 
  created_by, 
  tags, 
  content_suggestions
) VALUES
('Alaska admitted as the 49th state', 'Alaska became the 49th state on this day in 1959.', '2025-01-03', 'system', NULL, 
 ARRAY['Statehood', 'Alaska', 'LegalHistory'], '{"suggestions": "Constitutional law content about statehood processes and territorial governance.", "practice_areas": ["Constitutional", "Government"]}'),

('First U.S. presidential election began', 'Electors for the first U.S. presidential election were chosen starting Jan 7, 1789.', '2025-01-07', 'system', NULL, 
 ARRAY['PresidentialElection', 'FoundingEra', 'LegalHistory'], '{"suggestions": "Election law content about the electoral college and founding era voting procedures.", "practice_areas": ["Constitutional", "Election Law"]}'),

('Hazelwood School District v. Kuhlmeier decided', 'SCOTUS limited school-sponsored student speech in Hazelwood (1988).', '2025-01-13', 'system', NULL, 
 ARRAY['FirstAmendment', 'SCOTUS', 'StudentSpeech'], '{"suggestions": "Education law and First Amendment content about student speech rights in schools.", "practice_areas": ["Education", "First Amendment"]}'),

('New Jersey v. T.L.O. decided', 'SCOTUS set standards for student searches in schools (1985).', '2025-01-15', 'system', NULL, 
 ARRAY['SearchAndSeizure', 'FourthAmendment', 'SCOTUS'], '{"suggestions": "Criminal procedure and education law content about Fourth Amendment protections in schools.", "practice_areas": ["Criminal Procedure", "Education"]}'),

('Citizens United v. FEC decided', 'SCOTUS ruled on campaign finance and independent expenditures (2010).', '2025-01-21', 'system', NULL, 
 ARRAY['CampaignFinance', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "Election law content about campaign finance regulations and corporate speech rights.", "practice_areas": ["Election Law", "Constitutional"]}'),

('20th Amendment ratified', 'The 20th Amendment shortened the lame-duck period (1933).', '2025-01-23', 'system', NULL, 
 ARRAY['20thAmendment', 'USConstitution', 'LegalHistory'], '{"suggestions": "Constitutional law content about presidential transitions and the lame-duck period.", "practice_areas": ["Constitutional", "Government"]}'),

('Lilly Ledbetter Fair Pay Act signed', 'Fair Pay Act reset the clock for pay discrimination claims (2009).', '2025-01-29', 'system', NULL, 
 ARRAY['FairPay', 'EqualPay', 'EmploymentLaw'], '{"suggestions": "Employment law content about pay discrimination and statute of limitations for claims.", "practice_areas": ["Employment", "Civil Rights"]}'),

('Buckley v. Valeo decided', 'SCOTUS upheld campaign finance limits with important speech rulings (1976).', '2025-01-30', 'system', NULL, 
 ARRAY['CampaignFinance', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "Election law content about campaign finance regulation and free speech protections.", "practice_areas": ["Election Law", "Constitutional"]}'),

('House approved the 13th Amendment', 'The House passed the 13th Amendment abolishing slavery (1865).', '2025-01-31', 'system', NULL, 
 ARRAY['13thAmendment', 'Abolition', 'LegalHistory'], '{"suggestions": "Constitutional law content about the abolition of slavery and Civil War amendments.", "practice_areas": ["Constitutional", "Civil Rights"]}'),

('Indian Self-Determination and Education Assistance Act signed', 'Landmark self-governance law for Tribal Nations (1975).', '2025-01-04', 'system', NULL, 
 ARRAY['TribalSovereignty', 'ISDEAA', 'LegalHistory'], '{"suggestions": "Tribal law content about self-determination and federal-tribal relationships.", "practice_areas": ["Tribal Law", "Government"]}'),

('First session of the U.S. Supreme Court convened', 'SCOTUS opened its first session in New York City (1790).', '2025-02-02', 'system', NULL, 
 ARRAY['SCOTUS', 'JudicialBranch', 'LegalHistory'], '{"suggestions": "Judiciary and constitutional law content about the establishment of the federal court system.", "practice_areas": ["Judiciary", "Constitutional"]}'),

('Family and Medical Leave Act signed', 'FMLA guaranteed eligible workers job‑protected leave (1993).', '2025-02-05', 'system', NULL, 
 ARRAY['FMLA', 'EmploymentLaw', 'WorkersRights'], '{"suggestions": "Employment law content about family leave rights and workplace protections.", "practice_areas": ["Employment", "Labor"]}'),

('11th Amendment ratified', '11th Amendment limited federal lawsuits against states (1795).', '2025-02-07', 'system', NULL, 
 ARRAY['11thAmendment', 'SovereignImmunity', 'LegalHistory'], '{"suggestions": "Constitutional law content about state sovereign immunity and federal court jurisdiction.", "practice_areas": ["Constitutional", "Federal Courts"]}'),

('Telecommunications Act of 1996 signed (Section 230)', 'The 1996 Act (incl. Section 230) reshaped communications law.', '2025-02-08', 'system', NULL, 
 ARRAY['Section230', 'TelecomAct', 'InternetLaw'], '{"suggestions": "Technology law content about internet regulation and platform liability protections.", "practice_areas": ["Technology", "Communications"]}'),

('25th Amendment ratified', '25th Amendment clarified presidential succession and disability (1967).', '2025-02-10', 'system', NULL, 
 ARRAY['25thAmendment', 'USConstitution', 'LegalHistory'], '{"suggestions": "Constitutional law content about presidential succession and incapacity procedures.", "practice_areas": ["Constitutional", "Government"]}'),

('Federal Arbitration Act enacted', 'FAA established the enforceability of arbitration agreements (1925).', '2025-02-12', 'system', NULL, 
 ARRAY['Arbitration', 'Contracts', 'BusinessLaw'], '{"suggestions": "Arbitration and business law content about alternative dispute resolution.", "practice_areas": ["Arbitration", "Business"]}'),

('Executive Order 9066 issued', 'EO 9066 authorized Japanese American incarceration during WWII (1942).', '2025-02-19', 'system', NULL, 
 ARRAY['EO9066', 'CivilLiberties', 'LegalHistory'], '{"suggestions": "Civil liberties content about wartime executive power and constitutional protections.", "practice_areas": ["Civil Liberties", "Constitutional"]}'),

('21st Amendment proposed by Congress', 'Congress proposed repealing Prohibition via the 21st Amendment (1933).', '2025-02-20', 'system', NULL, 
 ARRAY['21stAmendment', 'Prohibition', 'LegalHistory'], '{"suggestions": "Constitutional law content about the amendment process and Prohibition repeal.", "practice_areas": ["Constitutional", "Government"]}'),

('Tinker v. Des Moines decided', 'Student speech rights affirmed in Tinker (1969).', '2025-02-24', 'system', NULL, 
 ARRAY['StudentSpeech', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "First Amendment content about student speech rights and educational settings.", "practice_areas": ["First Amendment", "Education"]}'),

('22nd Amendment ratified', '22nd Amendment set presidential term limits (1951).', '2025-02-27', 'system', NULL, 
 ARRAY['22ndAmendment', 'USConstitution', 'LegalHistory'], '{"suggestions": "Constitutional law content about presidential term limits and executive power.", "practice_areas": ["Constitutional", "Government"]}'),

('Articles of Confederation ratified', 'America''s first governing charter took effect (1781).', '2025-03-01', 'system', NULL, 
 ARRAY['ArticlesOfConfederation', 'FoundingEra', 'LegalHistory'], '{"suggestions": "Constitutional law content about early American governance and the transition to the Constitution.", "practice_areas": ["Constitutional", "Government"]}'),

('Civil Rights Act of 1875 signed', 'Post‑Reconstruction civil rights protections enacted (1875).', '2025-03-01', 'system', NULL, 
 ARRAY['CivilRights', 'Reconstruction', 'LegalHistory'], '{"suggestions": "Civil rights law content about Reconstruction era legislation and public accommodations.", "practice_areas": ["Civil Rights", "Constitutional"]}'),

('Gibbons v. Ogden decided', 'SCOTUS affirmed federal power over interstate commerce (1824).', '2025-03-02', 'system', NULL, 
 ARRAY['CommerceClause', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Constitutional law content about interstate commerce regulation and federal powers.", "practice_areas": ["Constitutional", "Business"]}'),

('Worcester v. Georgia decided', 'Decision recognized Tribal sovereignty against state laws (1832).', '2025-03-03', 'system', NULL, 
 ARRAY['TribalSovereignty', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Tribal law content about sovereignty and federal-state-tribal relationships.", "practice_areas": ["Tribal Law", "Constitutional"]}'),

('Belva Lockwood admitted to the U.S. Supreme Court bar', 'Belva Lockwood became the first woman admitted to argue before SCOTUS (1879).', '2025-03-03', 'system', NULL, 
 ARRAY['BelvaLockwood', 'WomenInLaw', 'LegalHistory'], '{"suggestions": "Legal profession content about women''s barriers and achievements in law.", "practice_areas": ["Judiciary", "Gender Equality"]}'),

('Schenck v. United States decided', 'The ''clear and present danger'' test announced (1919).', '2025-03-03', 'system', NULL, 
 ARRAY['FreeSpeech', 'SCOTUS', 'LegalHistory'], '{"suggestions": "First Amendment content about speech restrictions and the clear and present danger test.", "practice_areas": ["First Amendment", "Criminal"]}'),

('McCulloch v. Maryland decided', 'Necessary and Proper powers affirmed (1819).', '2025-03-06', 'system', NULL, 
 ARRAY['NecessaryAndProper', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Constitutional law content about federal powers and the Necessary and Proper Clause.", "practice_areas": ["Constitutional", "Federal Courts"]}'),

('Crawford v. Washington decided', 'Confrontation Clause standards reshaped in Crawford (2004).', '2025-03-08', 'system', NULL, 
 ARRAY['ConfrontationClause', 'SixthAmendment', 'SCOTUS'], '{"suggestions": "Criminal procedure content about confrontation rights and testimonial evidence.", "practice_areas": ["Criminal Procedure", "Constitutional"]}'),

('New York Times Co. v. Sullivan decided', 'Landmark defamation and public‑figure ruling (1964).', '2025-03-09', 'system', NULL, 
 ARRAY['Defamation', 'ActualMalice', 'SCOTUS'], '{"suggestions": "First Amendment content about defamation law and the actual malice standard.", "practice_areas": ["First Amendment", "Media Law"]}'),

('Affordable Care Act signed', 'The ACA expanded access to health insurance (2010).', '2025-03-23', 'system', NULL, 
 ARRAY['ACA', 'HealthLaw', 'LegalHistory'], '{"suggestions": "Health law content about healthcare reform and regulatory compliance.", "practice_areas": ["Health Law", "Administrative"]}'),

('26th Amendment sent to the states', 'Congress approved the 18‑year‑old vote amendment (1971).', '2025-03-23', 'system', NULL, 
 ARRAY['26thAmendment', 'VotingRights', 'LegalHistory'], '{"suggestions": "Election law content about voting age requirements and constitutional amendments.", "practice_areas": ["Constitutional", "Election Law"]}'),

('Baker v. Carr decided', '''One person, one vote'' principle advanced (1962).', '2025-03-26', 'system', NULL, 
 ARRAY['Apportionment', 'VotingRights', 'SCOTUS'], '{"suggestions": "Election law content about legislative apportionment and voting rights.", "practice_areas": ["Election Law", "Constitutional"]}'),

('West Coast Hotel Co. v. Parrish decided', 'SCOTUS upheld minimum wage; end of Lochner era (1937).', '2025-03-29', 'system', NULL, 
 ARRAY['MinimumWage', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Employment law content about wage regulations and constitutional economic rights.", "practice_areas": ["Employment", "Constitutional"]}'),

('23rd Amendment ratified', 'D.C. gained presidential electors (1961).', '2025-03-29', 'system', NULL, 
 ARRAY['23rdAmendment', 'DCVotes', 'LegalHistory'], '{"suggestions": "Constitutional law content about D.C. representation and electoral rights.", "practice_areas": ["Constitutional", "Election Law"]}'),

('Slaughter‑House Cases decided', 'Narrowed Privileges or Immunities Clause (1873).', '2025-04-14', 'system', NULL, 
 ARRAY['FourteenthAmendment', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Constitutional law content about the Fourteenth Amendment and civil rights protections.", "practice_areas": ["Constitutional", "Civil Rights"]}'),

('Lochner v. New York decided', '''Liberty of contract'' era strengthened (1905).', '2025-04-17', 'system', NULL, 
 ARRAY['LochnerEra', 'DueProcess', 'SCOTUS'], '{"suggestions": "Constitutional law content about economic due process and liberty of contract.", "practice_areas": ["Employment", "Constitutional"]}'),

('Swann v. Charlotte‑Mecklenburg Board of Education decided', 'Court approved busing remedies for desegregation (1971).', '2025-04-20', 'system', NULL, 
 ARRAY['Desegregation', 'CivilRights', 'SCOTUS'], '{"suggestions": "Civil rights content about school desegregation and remedial measures.", "practice_areas": ["Civil Rights", "Education"]}'),

('Bankruptcy Abuse Prevention and Consumer Protection Act signed', 'Major reform to U.S. consumer bankruptcy law (2005).', '2025-04-20', 'system', NULL, 
 ARRAY['BankruptcyLaw', 'BAPCPA', 'LegalHistory'], '{"suggestions": "Bankruptcy law content about consumer protection and debt relief procedures.", "practice_areas": ["Bankruptcy", "Consumer"]}'),

('Erie Railroad Co. v. Tompkins decided', 'SCOTUS ended federal general common law (1938).', '2025-04-25', 'system', NULL, 
 ARRAY['ErieDoctrine', 'CivilProcedure', 'SCOTUS'], '{"suggestions": "Civil procedure content about federal-state law relationships and the Erie doctrine.", "practice_areas": ["Civil Procedure", "Federal Courts"]}'),

('United States v. Lopez decided', 'First modern case limiting Commerce Clause power (1995).', '2025-04-26', 'system', NULL, 
 ARRAY['CommerceClause', 'Federalism', 'SCOTUS'], '{"suggestions": "Constitutional law content about federalism and limits on congressional power.", "practice_areas": ["Constitutional", "Criminal"]}'),

('Batson v. Kentucky decided', 'Court restricted race‑based peremptory strikes (1986).', '2025-04-30', 'system', NULL, 
 ARRAY['JurySelection', 'EqualProtection', 'SCOTUS'], '{"suggestions": "Criminal procedure content about jury selection and equal protection rights.", "practice_areas": ["Criminal Procedure", "Civil Rights"]}'),

('Smith v. Allwright decided', 'Court struck down white‑primary restrictions (1944).', '2025-04-03', 'system', NULL, 
 ARRAY['VotingRights', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Election law content about voting rights and primary election access.", "practice_areas": ["Election Law", "Civil Rights"]}'),

('Civil Rights Act of 1960 signed', 'Law strengthened federal voting rights enforcement (1960).', '2025-05-06', 'system', NULL, 
 ARRAY['CivilRights', 'VotingRights', 'LegalHistory'], '{"suggestions": "Civil rights content about voting rights enforcement and federal oversight.", "practice_areas": ["Civil Rights", "Election Law"]}'),

('Standard Oil Co. v. United States decided', 'Antitrust ruling broke up Standard Oil (1911).', '2025-05-15', 'system', NULL, 
 ARRAY['Antitrust', 'StandardOil', 'SCOTUS'], '{"suggestions": "Antitrust law content about monopoly regulation and business competition.", "practice_areas": ["Antitrust", "Business"]}'),

('Emergency Quota Act signed', 'First major federal immigration quota law (1921).', '2025-05-19', 'system', NULL, 
 ARRAY['ImmigrationLaw', 'QuotaActs', 'LegalHistory'], '{"suggestions": "Immigration law content about quota systems and federal immigration policy.", "practice_areas": ["Immigration", "Government"]}'),

('Constitutional Convention achieved quorum and began', 'Delegates organized and began drafting the Constitution (1787).', '2025-05-25', 'system', NULL, 
 ARRAY['ConstitutionalConvention', 'FoundingEra', 'LegalHistory'], '{"suggestions": "Constitutional law content about the founding era and constitutional drafting process.", "practice_areas": ["Constitutional", "Government"]}'),

('A.L.A. Schechter Poultry Corp. v. United States decided', 'Court invalidated key New Deal codes (1935).', '2025-05-27', 'system', NULL, 
 ARRAY['NewDeal', 'SeparationOfPowers', 'SCOTUS'], '{"suggestions": "Administrative law content about separation of powers and congressional delegation.", "practice_areas": ["Administrative", "Constitutional"]}'),

('Wisconsin v. Yoder decided', 'Court protected Amish families from compulsory high school (1972).', '2025-05-15', 'system', NULL, 
 ARRAY['FreeExercise', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "Religious liberty content about free exercise rights and educational requirements.", "practice_areas": ["Religious Liberty", "Education"]}'),

('Near v. Minnesota decided', 'Prior restraint on the press limited (1931).', '2025-06-01', 'system', NULL, 
 ARRAY['FreedomOfPress', 'PriorRestraint', 'SCOTUS'], '{"suggestions": "First Amendment content about press freedom and prior restraint limitations.", "practice_areas": ["First Amendment", "Media Law"]}'),

('Indian Citizenship Act signed', 'Granted U.S. citizenship to Native Americans (1924).', '2025-06-02', 'system', NULL, 
 ARRAY['NativeAmericanHistory', 'Citizenship', 'LegalHistory'], '{"suggestions": "Tribal law content about citizenship and Native American legal status.", "practice_areas": ["Tribal Law", "Constitutional"]}'),

('USA FREEDOM Act signed', 'Reformed certain surveillance authorities (2015).', '2025-06-02', 'system', NULL, 
 ARRAY['USAFreedomAct', 'PrivacyLaw', 'LegalHistory'], '{"suggestions": "Privacy law content about surveillance reform and civil liberties protections.", "practice_areas": ["Privacy", "National Security"]}'),

('Securities Exchange Act signed (SEC created)', 'Established the Securities and Exchange Commission (1934).', '2025-06-06', 'system', NULL, 
 ARRAY['SEC', 'SecuritiesLaw', 'LegalHistory'], '{"suggestions": "Securities law content about market regulation and financial compliance.", "practice_areas": ["Securities", "Business"]}'),

('Madison proposed the Bill of Rights', 'James Madison introduced amendments that became the Bill of Rights (1789).', '2025-06-08', 'system', NULL, 
 ARRAY['BillOfRights', 'USConstitution', 'LegalHistory'], '{"suggestions": "Constitutional law content about the Bill of Rights and individual liberties.", "practice_areas": ["Constitutional", "Civil Liberties"]}'),

('Gitlow v. New York decided', 'Court applied First Amendment to the states (1925).', '2025-06-08', 'system', NULL, 
 ARRAY['Incorporation', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "Constitutional law content about incorporation doctrine and state application of rights.", "practice_areas": ["Constitutional", "Civil Liberties"]}'),

('Brandenburg v. Ohio decided', 'Modern incitement standard announced (1969).', '2025-06-09', 'system', NULL, 
 ARRAY['FreeSpeech', 'Incitement', 'SCOTUS'], '{"suggestions": "First Amendment content about speech restrictions and incitement standards.", "practice_areas": ["First Amendment", "Criminal"]}'),

('Equal Pay Act signed', 'Prohibited wage discrimination based on sex (1963).', '2025-06-10', 'system', NULL, 
 ARRAY['EqualPay', 'EmploymentLaw', 'LegalHistory'], '{"suggestions": "Employment law content about gender equality and wage discrimination.", "practice_areas": ["Employment", "Civil Rights"]}'),

('Terry v. Ohio decided', '''Stop and frisk'' standard defined (1968).', '2025-06-10', 'system', NULL, 
 ARRAY['FourthAmendment', 'StopAndFrisk', 'SCOTUS'], '{"suggestions": "Criminal procedure content about Fourth Amendment protections and police searches.", "practice_areas": ["Criminal Procedure", "Constitutional"]}'),

('Boumediene v. Bush decided', 'Detainees have habeas rights in federal court (2008).', '2025-06-12', 'system', NULL, 
 ARRAY['HabeasCorpus', 'SCOTUS', 'LegalHistory'], '{"suggestions": "National security law content about habeas corpus and detention rights.", "practice_areas": ["National Security", "Constitutional"]}'),

('West Virginia v. Barnette decided', 'Government cannot compel flag salute in schools (1943).', '2025-06-14', 'system', NULL, 
 ARRAY['CompelledSpeech', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "First Amendment content about compelled speech and religious liberty in schools.", "practice_areas": ["First Amendment", "Education"]}'),

('DACA policy announced', 'Deferred Action for Childhood Arrivals policy announced (2012).', '2025-06-15', 'system', NULL, 
 ARRAY['DACA', 'ImmigrationLaw', 'LegalHistory'], '{"suggestions": "Immigration law content about deferred action and administrative relief.", "practice_areas": ["Immigration", "Administrative"]}'),

('Bostock v. Clayton County decided', 'Title VII protects LGBTQ+ employees from discrimination (2020).', '2025-06-15', 'system', NULL, 
 ARRAY['TitleVII', 'LGBTQRights', 'SCOTUS'], '{"suggestions": "Employment law content about LGBTQ+ rights and workplace discrimination.", "practice_areas": ["Employment", "Civil Rights"]}'),

('Banking Act of 1933 (Glass‑Steagall) signed', 'Separated commercial and investment banking (1933).', '2025-06-16', 'system', NULL, 
 ARRAY['GlassSteagall', 'BankingLaw', 'LegalHistory'], '{"suggestions": "Banking law content about financial regulation and institutional separation.", "practice_areas": ["Banking", "Regulatory"]}'),

('Abington School District v. Schempp decided', 'School‑sponsored Bible readings unconstitutional (1963).', '2025-06-17', 'system', NULL, 
 ARRAY['EstablishmentClause', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "First Amendment content about establishment clause and religion in schools.", "practice_areas": ["First Amendment", "Education"]}'),

('Mapp v. Ohio decided', 'Exclusionary rule applied to the states (1961).', '2025-06-19', 'system', NULL, 
 ARRAY['ExclusionaryRule', 'FourthAmendment', 'SCOTUS'], '{"suggestions": "Criminal procedure content about the exclusionary rule and Fourth Amendment protections.", "practice_areas": ["Criminal Procedure", "Constitutional"]}'),

('Juneteenth (General Order No. 3)', 'Union forces announced freedom in Texas, marking Juneteenth (1865).', '2025-06-19', 'system', NULL, 
 ARRAY['Juneteenth', 'Emancipation', 'LegalHistory'], '{"suggestions": "Civil rights content about emancipation and the end of slavery.", "practice_areas": ["Civil Rights", "Constitutional"]}'),

('U.S. Constitution took effect (9th state ratified)', 'New Hampshire became the 9th state, making the Constitution operative (1788).', '2025-06-21', 'system', NULL, 
 ARRAY['USConstitution', 'Ratification', 'LegalHistory'], '{"suggestions": "Constitutional law content about ratification and the founding of federal government.", "practice_areas": ["Constitutional", "Government"]}'),

('Texas v. Johnson decided', 'Flag‑burning protected as free speech (1989).', '2025-06-21', 'system', NULL, 
 ARRAY['FreeSpeech', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "First Amendment content about symbolic speech and expressive conduct.", "practice_areas": ["First Amendment", "Criminal"]}'),

('Carpenter v. United States decided', 'Warrant generally required for cell‑site location data (2018).', '2025-06-22', 'system', NULL, 
 ARRAY['FourthAmendment', 'DigitalPrivacy', 'SCOTUS'], '{"suggestions": "Privacy law content about digital rights and Fourth Amendment protections.", "practice_areas": ["Privacy", "Criminal Procedure"]}'),

('Taft‑Hartley Act enacted', 'Amended NLRA; rebalanced labor‑management relations (1947).', '2025-06-23', 'system', NULL, 
 ARRAY['TaftHartley', 'LaborLaw', 'LegalHistory'], '{"suggestions": "Labor law content about collective bargaining and union-management relations.", "practice_areas": ["Labor", "Employment"]}'),

('Grutter v. Bollinger decided', 'Court upheld limited affirmative action in admissions (2003).', '2025-06-23', 'system', NULL, 
 ARRAY['AffirmativeAction', 'HigherEd', 'SCOTUS'], '{"suggestions": "Education law content about affirmative action and diversity in higher education.", "practice_areas": ["Education", "Civil Rights"]}'),

('Fair Labor Standards Act enacted', 'Established minimum wage, overtime, and child‑labor rules (1938).', '2025-06-25', 'system', NULL, 
 ARRAY['FLSA', 'EmploymentLaw', 'LegalHistory'], '{"suggestions": "Employment law content about wage and hour regulations and worker protections.", "practice_areas": ["Employment", "Labor"]}'),

('Engel v. Vitale decided', 'School‑sponsored prayer unconstitutional (1962).', '2025-06-25', 'system', NULL, 
 ARRAY['EstablishmentClause', 'FirstAmendment', 'SCOTUS'], '{"suggestions": "First Amendment content about establishment clause and prayer in schools.", "practice_areas": ["First Amendment", "Education"]}'),

('Shelby County v. Holder decided', 'Court invalidated VRA preclearance coverage formula (2013).', '2025-06-25', 'system', NULL, 
 ARRAY['VotingRightsAct', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Election law content about voting rights enforcement and federal oversight.", "practice_areas": ["Election Law", "Civil Rights"]}'),

('Riley v. California decided', 'Warrant required to search cell phones during arrest (2014).', '2025-06-25', 'system', NULL, 
 ARRAY['FourthAmendment', 'DigitalPrivacy', 'SCOTUS'], '{"suggestions": "Criminal procedure content about digital privacy and search warrant requirements.", "practice_areas": ["Criminal Procedure", "Privacy"]}'),

('Reno v. ACLU decided', 'Court struck down indecency provisions of the CDA (1997).', '2025-06-26', 'system', NULL, 
 ARRAY['FreeSpeech', 'InternetLaw', 'SCOTUS'], '{"suggestions": "First Amendment content about internet regulation and online speech protections.", "practice_areas": ["First Amendment", "Internet Law"]}'),

('Lawrence v. Texas decided', 'Court invalidated laws criminalizing same‑sex intimacy (2003).', '2025-06-26', 'system', NULL, 
 ARRAY['LGBTQRights', 'DueProcess', 'SCOTUS'], '{"suggestions": "Civil rights content about LGBTQ+ rights and privacy protections.", "practice_areas": ["Civil Rights", "Constitutional"]}'),

('District of Columbia v. Heller decided', 'Individual Second Amendment right recognized (2008).', '2025-06-26', 'system', NULL, 
 ARRAY['SecondAmendment', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Constitutional law content about Second Amendment rights and firearm regulations.", "practice_areas": ["Constitutional", "Firearms"]}'),

('United States v. Windsor decided', 'Court struck down DOMA''s federal definition of marriage (2013).', '2025-06-26', 'system', NULL, 
 ARRAY['MarriageEquality', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Civil rights content about marriage equality and federal recognition of same-sex marriage.", "practice_areas": ["Civil Rights", "Family Law"]}'),

('Whole Woman''s Health v. Hellerstedt decided', 'Undue burden standard strengthened in abortion rights case (2016).', '2025-06-27', 'system', NULL, 
 ARRAY['ReproductiveRights', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Health law content about reproductive rights and constitutional protections.", "practice_areas": ["Health Law", "Constitutional"]}'),

('Regents of the Univ. of California v. Bakke decided', 'Court limited use of racial quotas in admissions (1978).', '2025-06-28', 'system', NULL, 
 ARRAY['AffirmativeAction', 'HigherEd', 'SCOTUS'], '{"suggestions": "Education law content about affirmative action and racial considerations in admissions.", "practice_areas": ["Education", "Civil Rights"]}'),

('Hamdi v. Rumsfeld decided', 'Due process applies to U.S. citizens detained as enemy combatants (2004).', '2025-06-28', 'system', NULL, 
 ARRAY['DueProcess', 'WarPowers', 'SCOTUS'], '{"suggestions": "National security law content about due process and wartime detention.", "practice_areas": ["National Security", "Constitutional"]}'),

('NFIB v. Sebelius decided', 'Court upheld ACA''s individual mandate as a tax (2012).', '2025-06-28', 'system', NULL, 
 ARRAY['ACA', 'TaxingPower', 'SCOTUS'], '{"suggestions": "Health law content about the ACA and constitutional taxing power.", "practice_areas": ["Health Law", "Constitutional"]}'),

('Furman v. Georgia decided', 'Death penalty schemes struck down as arbitrary (1972).', '2025-06-29', 'system', NULL, 
 ARRAY['DeathPenalty', 'EighthAmendment', 'SCOTUS'], '{"suggestions": "Criminal law content about capital punishment and Eighth Amendment protections.", "practice_areas": ["Criminal", "Constitutional"]}'),

('New York Times Co. v. United States decided', 'Pentagon Papers decision strengthened press freedoms (1971).', '2025-06-30', 'system', NULL, 
 ARRAY['PentagonPapers', 'PressFreedom', 'SCOTUS'], '{"suggestions": "First Amendment content about press freedom and government secrecy.", "practice_areas": ["First Amendment", "Media Law"]}'),

('26th Amendment ratified', 'Lowered voting age to 18 (1971).', '2025-07-01', 'system', NULL, 
 ARRAY['26thAmendment', 'VotingRights', 'LegalHistory'], '{"suggestions": "Election law content about voting age and constitutional amendments.", "practice_areas": ["Constitutional", "Election Law"]}'),

('National Labor Relations Act signed', 'Wagner Act protected collective bargaining (1935).', '2025-07-05', 'system', NULL, 
 ARRAY['NLRA', 'LaborLaw', 'LegalHistory'], '{"suggestions": "Labor law content about collective bargaining rights and union organizing.", "practice_areas": ["Labor", "Employment"]}'),

('14th Amendment ratified', 'Equal protection and due process enshrined (1868).', '2025-07-09', 'system', NULL, 
 ARRAY['14thAmendment', 'EqualProtection', 'LegalHistory'], '{"suggestions": "Constitutional law content about equal protection and due process rights.", "practice_areas": ["Constitutional", "Civil Rights"]}'),

('Sedition Act of 1798 signed', 'Criminalized certain speech against the government (1798).', '2025-07-14', 'system', NULL, 
 ARRAY['SeditionAct', 'FreeSpeech', 'LegalHistory'], '{"suggestions": "First Amendment content about early speech restrictions and government criticism.", "practice_areas": ["First Amendment", "Criminal"]}'),

('Residence Act signed', 'Established the site of the U.S. capital (1790).', '2025-07-16', 'system', NULL, 
 ARRAY['WashingtonDC', 'ResidenceAct', 'LegalHistory'], '{"suggestions": "Government law content about federal district establishment and capital location.", "practice_areas": ["Government", "Administrative"]}'),

('National Minimum Drinking Age Act signed', 'Encouraged states to adopt 21 as the drinking age (1984).', '2025-07-17', 'system', NULL, 
 ARRAY['PublicSafety', 'HighwayFunding', 'LegalHistory'], '{"suggestions": "Administrative law content about federal-state cooperation and conditional funding.", "practice_areas": ["Administrative", "Public Safety"]}'),

('United States v. Nixon decided', 'Court ordered release of Watergate tapes (1974).', '2025-07-24', 'system', NULL, 
 ARRAY['Watergate', 'RuleOfLaw', 'SCOTUS'], '{"suggestions": "Constitutional law content about executive privilege and separation of powers.", "practice_areas": ["Constitutional", "Separation of Powers"]}'),

('Executive Order 9981 issued', 'President Truman desegregated the U.S. Armed Forces (1948).', '2025-07-26', 'system', NULL, 
 ARRAY['EO9981', 'Desegregation', 'LegalHistory'], '{"suggestions": "Civil rights content about military desegregation and executive authority.", "practice_areas": ["Civil Rights", "Military"]}'),

('Sarbanes‑Oxley Act signed', 'Corporate accountability and auditing reforms (2002).', '2025-07-30', 'system', NULL, 
 ARRAY['SarbanesOxley', 'CorporateLaw', 'LegalHistory'], '{"suggestions": "Corporate law content about financial reporting and accountability standards.", "practice_areas": ["Securities", "Corporate"]}'),

('Department of Foreign Affairs established', 'Predecessor to the Department of State created (1789).', '2025-07-27', 'system', NULL, 
 ARRAY['StateDepartment', 'FoundingEra', 'LegalHistory'], '{"suggestions": "Government law content about executive departments and foreign affairs.", "practice_areas": ["Government", "Administrative"]}'),

('Gulf of Tonkin Resolution passed', 'Congress authorized military action in Southeast Asia (1964).', '2025-08-04', 'system', NULL, 
 ARRAY['WarPowers', 'Congress', 'LegalHistory'], '{"suggestions": "Constitutional law content about war powers and congressional authorization.", "practice_areas": ["Government", "National Security"]}'),

('Civil Liberties Act signed', 'Formally apologized and provided redress for WWII incarceration (1988).', '2025-08-10', 'system', NULL, 
 ARRAY['CivilLibertiesAct', 'Redress', 'LegalHistory'], '{"suggestions": "Civil rights content about government accountability and reparations.", "practice_areas": ["Civil Rights", "Administrative"]}'),

('Social Security Act signed', 'Created Social Security and key safety‑net programs (1935).', '2025-08-14', 'system', NULL, 
 ARRAY['SocialSecurity', 'SafetyNet', 'LegalHistory'], '{"suggestions": "Administrative law content about social welfare programs and government benefits.", "practice_areas": ["Administrative", "Elder Law"]}'),

('Economic Opportunity Act signed', 'Launched War on Poverty programs (1964).', '2025-08-20', 'system', NULL, 
 ARRAY['WarOnPoverty', 'GreatSociety', 'LegalHistory'], '{"suggestions": "Administrative law content about social programs and government assistance.", "practice_areas": ["Administrative", "Government"]}'),

('Sacco and Vanzetti executed', 'Controversial case closed with executions (1927).', '2025-08-23', 'system', NULL, 
 ARRAY['SaccoVanzetti', 'CriminalLaw', 'LegalHistory'], '{"suggestions": "Criminal law content about due process and controversial cases.", "practice_areas": ["Criminal", "Appellate"]}'),

('19th Amendment certified (Women''s Equality Day)', 'Certification proclaimed the 19th Amendment''s adoption (1920).', '2025-08-26', 'system', NULL, 
 ARRAY['WomensEqualityDay', '19thAmendment', 'LegalHistory'], '{"suggestions": "Election law content about women''s suffrage and voting rights expansion.", "practice_areas": ["Election Law", "Civil Rights"]}'),

('U.S. Department of the Treasury established', 'Treasury Department created by Congress (1789).', '2025-09-02', 'system', NULL, 
 ARRAY['Treasury', 'FoundingEra', 'LegalHistory'], '{"suggestions": "Government law content about executive departments and financial administration.", "practice_areas": ["Government", "Administrative"]}'),

('Civil Rights Act of 1957 signed', 'First federal civil rights law since Reconstruction (1957).', '2025-09-09', 'system', NULL, 
 ARRAY['CivilRightsAct', 'VotingRights', 'LegalHistory'], '{"suggestions": "Civil rights content about federal enforcement and voting protections.", "practice_areas": ["Civil Rights", "Election Law"]}'),

('Violent Crime Control and Law Enforcement Act signed', 'Massive crime bill (incl. VAWA) signed into law (1994).', '2025-09-13', 'system', NULL, 
 ARRAY['CrimeBill', 'VAWA', 'LegalHistory'], '{"suggestions": "Criminal law content about federal crime legislation and violence prevention.", "practice_areas": ["Criminal", "Administrative"]}'),

('ADA Amendments Act signed', 'Broadened definition of disability under the ADA (2008).', '2025-09-25', 'system', NULL, 
 ARRAY['ADAAA', 'DisabilityRights', 'LegalHistory'], '{"suggestions": "Disability law content about accommodations and anti-discrimination protections.", "practice_areas": ["Disability Law", "Employment"]}'),

('Rehabilitation Act of 1973 signed', 'Section 504 banned disability discrimination in federally funded programs (1973).', '2025-09-26', 'system', NULL, 
 ARRAY['RehabAct', 'Section504', 'LegalHistory'], '{"suggestions": "Disability law content about federal funding and non-discrimination requirements.", "practice_areas": ["Disability Law", "Administrative"]}'),

('IIRIRA signed (Immigration Reform of 1996)', 'Overhauled immigration enforcement and removal procedures (1996).', '2025-09-30', 'system', NULL, 
 ARRAY['IIRIRA', 'ImmigrationLaw', 'LegalHistory'], '{"suggestions": "Immigration law content about enforcement mechanisms and removal procedures.", "practice_areas": ["Immigration", "Administrative"]}'),

('The Civil Rights Cases decided', 'Court limited federal power to prohibit private discrimination (1883).', '2025-10-15', 'system', NULL, 
 ARRAY['CivilRights', 'StateAction', 'SCOTUS'], '{"suggestions": "Civil rights content about state action doctrine and private discrimination.", "practice_areas": ["Civil Rights", "Constitutional"]}'),

('Clean Water Act enacted (over veto)', 'Cornerstone of U.S. water pollution control (1972).', '2025-10-18', 'system', NULL, 
 ARRAY['CleanWaterAct', 'EnvironmentalLaw', 'LegalHistory'], '{"suggestions": "Environmental law content about water protection and regulatory compliance.", "practice_areas": ["Environmental", "Administrative"]}'),

('Copyright Act of 1976 signed', 'Modernized U.S. copyright law (1976).', '2025-10-19', 'system', NULL, 
 ARRAY['Copyright', 'IPLaw', 'LegalHistory'], '{"suggestions": "Intellectual property content about copyright protection and creative works.", "practice_areas": ["Intellectual Property", "Business"]}'),

('Saturday Night Massacre', 'Watergate crisis: DOJ leadership resigned/removed (1973).', '2025-10-20', 'system', NULL, 
 ARRAY['Watergate', 'DOJ', 'LegalHistory'], '{"suggestions": "Constitutional law content about executive power and Department of Justice independence.", "practice_areas": ["Constitutional", "Government"]}'),

('Gun Control Act of 1968 signed', 'Regulated firearms commerce and categories (1968).', '2025-10-22', 'system', NULL, 
 ARRAY['GunControlAct', 'SecondAmendment', 'LegalHistory'], '{"suggestions": "Firearms law content about federal regulation and Second Amendment rights.", "practice_areas": ["Firearms", "Criminal"]}'),

('Volstead Act enacted over veto', 'National Prohibition Act enforced the 18th Amendment (1919).', '2025-10-28', 'system', NULL, 
 ARRAY['Prohibition', 'VolsteadAct', 'LegalHistory'], '{"suggestions": "Criminal law content about Prohibition enforcement and constitutional amendments.", "practice_areas": ["Criminal", "Administrative"]}'),

('Help America Vote Act signed', 'Reformed election administration after 2000 (2002).', '2025-10-29', 'system', NULL, 
 ARRAY['HAVA', 'ElectionLaw', 'LegalHistory'], '{"suggestions": "Election law content about voting technology and election administration.", "practice_areas": ["Election Law", "Government"]}'),

('O.J. Simpson criminal trial verdict', 'Jury delivered not‑guilty verdict in the high‑profile case (1995).', '2025-10-03', 'system', NULL, 
 ARRAY['OJSimpSON', 'CriminalTrial', 'LegalHistory'], '{"suggestions": "Criminal law content about high-profile trials and jury procedures.", "practice_areas": ["Criminal", "Trials"]}'),

('Bankruptcy Reform Act of 1978 signed', 'Modern U.S. Bankruptcy Code enacted (1978).', '2025-11-06', 'system', NULL, 
 ARRAY['BankruptcyCode', 'BusinessLaw', 'LegalHistory'], '{"suggestions": "Bankruptcy law content about debt relief and business reorganization.", "practice_areas": ["Bankruptcy", "Business"]}'),

('War Powers Resolution enacted over veto', 'Sought to limit presidential war‑making powers (1973).', '2025-11-07', 'system', NULL, 
 ARRAY['WarPowers', 'SeparationOfPowers', 'LegalHistory'], '{"suggestions": "Constitutional law content about war powers and congressional oversight.", "practice_areas": ["Constitutional", "National Security"]}'),

('Wickard v. Filburn decided', 'Broad reading of the Commerce Clause (1942).', '2025-11-09', 'system', NULL, 
 ARRAY['CommerceClause', 'SCOTUS', 'LegalHistory'], '{"suggestions": "Constitutional law content about federal commerce power and agricultural regulation.", "practice_areas": ["Constitutional", "Agricultural"]}'),

('Reed v. Reed decided', 'Court struck down sex‑based preference in estate administration (1971).', '2025-11-22', 'system', NULL, 
 ARRAY['EqualProtection', 'GenderEquality', 'SCOTUS'], '{"suggestions": "Civil rights content about gender equality and estate law.", "practice_areas": ["Civil Rights", "Probate"]}'),

('Homeland Security Act signed', 'Created the Department of Homeland Security (2002).', '2025-11-25', 'system', NULL, 
 ARRAY['DHS', 'NationalSecurity', 'LegalHistory'], '{"suggestions": "National security law content about federal reorganization and terrorism response.", "practice_areas": ["Administrative", "National Security"]}'),

('Immigration Act of 1990 signed', 'Comprehensive reform updated U.S. immigration system (1990).', '2025-11-29', 'system', NULL, 
 ARRAY['ImmigrationLaw', 'INA', 'LegalHistory'], '{"suggestions": "Immigration law content about comprehensive reform and legal immigration.", "practice_areas": ["Immigration", "Government"]}'),

('Brady Handgun Violence Prevention Act signed', 'Established background checks for handgun purchases (1993).', '2025-11-30', 'system', NULL, 
 ARRAY['BradyBill', 'BackgroundChecks', 'LegalHistory'], '{"suggestions": "Firearms law content about background checks and gun safety regulations.", "practice_areas": ["Firearms", "Public Safety"]}'),

('Clean Air Act Amendments of 1990 signed', 'Major update to U.S. air quality laws (1990).', '2025-11-15', 'system', NULL, 
 ARRAY['CleanAirAct', 'EnvironmentalLaw', 'LegalHistory'], '{"suggestions": "Environmental law content about air quality standards and pollution control.", "practice_areas": ["Environmental", "Administrative"]}'),

('Clinton v. Jones argued (decision 05/27/1997)', 'High Court later held a sitting president isn''t immune from civil litigation (1997).', '2025-11-04', 'system', NULL, 
 ARRAY['SeparationOfPowers', 'CivilProcedure', 'SCOTUS'], '{"suggestions": "Constitutional law content about presidential immunity and civil litigation.", "practice_areas": ["Civil Litigation", "Constitutional"]}'),

('Environmental Protection Agency (EPA) began operations', 'EPA opened its doors to protect human health and the environment (1970).', '2025-12-02', 'system', NULL, 
 ARRAY['EPA', 'EnvironmentalLaw', 'LegalHistory'], '{"suggestions": "Environmental law content about federal environmental protection and regulation.", "practice_areas": ["Environmental", "Administrative"]}'),

('21st Amendment ratified (Prohibition repealed)', 'Repeal of the 18th Amendment ended Prohibition (1933).', '2025-12-05', 'system', NULL, 
 ARRAY['21stAmendment', 'Prohibition', 'LegalHistory'], '{"suggestions": "Constitutional law content about amendment repeal and Prohibition end.", "practice_areas": ["Constitutional", "Criminal"]}'),

('Bush v. Gore decided', 'Supreme Court decision effectively resolved the 2000 election (2000).', '2025-12-12', 'system', NULL, 
 ARRAY['BushvGore', 'ElectionLaw', 'SCOTUS'], '{"suggestions": "Election law content about disputed elections and judicial intervention.", "practice_areas": ["Election Law", "Constitutional"]}'),

('Heart of Atlanta Motel v. United States decided', 'Upheld the Civil Rights Act''s Title II (1964).', '2025-12-14', 'system', NULL, 
 ARRAY['PublicAccommodations', 'CivilRights', 'SCOTUS'], '{"suggestions": "Civil rights content about public accommodations and federal commerce power.", "practice_areas": ["Civil Rights", "Business"]}'),

('Korematsu v. United States decided', 'Court upheld wartime exclusion orders (1944; later repudiated).', '2025-12-18', 'system', NULL, 
 ARRAY['Korematsu', 'CivilLiberties', 'SCOTUS'], '{"suggestions": "Civil liberties content about wartime restrictions and constitutional protections.", "practice_areas": ["National Security", "Civil Liberties"]}'),

('Katz v. United States decided', 'Fourth Amendment protects people, not places (1967).', '2025-12-18', 'system', NULL, 
 ARRAY['FourthAmendment', 'Privacy', 'SCOTUS'], '{"suggestions": "Criminal procedure content about privacy expectations and Fourth Amendment protections.", "practice_areas": ["Criminal Procedure", "Privacy"]}'),

('House approved articles of impeachment against President Clinton', 'House voted to impeach the President (1998).', '2025-12-19', 'system', NULL, 
 ARRAY['Impeachment', 'SeparationOfPowers', 'LegalHistory'], '{"suggestions": "Constitutional law content about impeachment process and separation of powers.", "practice_areas": ["Constitutional", "Government"]}'),

('Occupational Safety and Health Act signed', 'Created OSHA and set workplace safety standards (1970).', '2025-12-29', 'system', NULL, 
 ARRAY['OSHA', 'WorkplaceSafety', 'LegalHistory'], '{"suggestions": "Employment law content about workplace safety and regulatory compliance.", "practice_areas": ["Employment", "Administrative"]}'),

('O.J. Simpson civil judgment date (verdict 02/04/1997)', 'Civil case against O.J. Simpson culminated in a large damages award (1997).', '2025-12-12', 'system', NULL, 
 ARRAY['WrongfulDeath', 'CivilTrial', 'LegalHistory'], '{"suggestions": "Civil litigation content about wrongful death claims and burden of proof differences.", "practice_areas": ["Torts", "Civil Litigation"]}');