-- Add account status to profiles table
ALTER TABLE public.profiles ADD COLUMN account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'paused', 'deleted'));

-- Create admin function to manage user accounts
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  _user_id uuid,
  _status text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles 
  SET account_status = _status, updated_at = now()
  WHERE user_id = _user_id;
$$;

-- Create admin function to create user with subscription
CREATE OR REPLACE FUNCTION public.admin_create_user_with_subscription(
  _email text,
  _display_name text,
  _plan_type text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  result jsonb;
BEGIN
  -- Generate a temporary user ID (will be replaced when user signs up)
  new_user_id := gen_random_uuid();
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, display_name, account_status)
  VALUES (new_user_id, _email, _display_name, 'active')
  RETURNING user_id INTO new_user_id;
  
  -- Insert subscription
  INSERT INTO public.user_subscriptions (user_id, plan_type, purchase_date)
  VALUES (new_user_id, _plan_type, now());
  
  -- Return the created user info
  SELECT jsonb_build_object(
    'user_id', new_user_id,
    'email', _email,
    'display_name', _display_name,
    'plan_type', _plan_type
  ) INTO result;
  
  RETURN result;
END;
$$;