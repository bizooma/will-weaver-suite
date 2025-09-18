-- Create profile for free@bizooma.com account
INSERT INTO public.profiles (user_id, email, display_name, account_status)
VALUES ('9e863fa6-8a4b-4b3b-ab28-a50cf9449b45', 'free@bizooma.com', 'Free User Demo', 'active')
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  account_status = EXCLUDED.account_status;