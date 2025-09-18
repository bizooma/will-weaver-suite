-- Create profile for joe@bizooma.com platform owner account
INSERT INTO public.profiles (user_id, email, display_name, account_status)
VALUES ('7ea63858-cf76-484f-8715-6c4fb32fce31', 'joe@bizooma.com', 'Joe (Platform Owner)', 'active')
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  account_status = EXCLUDED.account_status;