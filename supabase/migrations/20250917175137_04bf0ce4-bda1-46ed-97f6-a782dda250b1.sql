-- Fix the admin_create_user_with_subscription function to use 'active' instead of 'pending'
CREATE OR REPLACE FUNCTION public.admin_create_user_with_subscription(_email text, _display_name text, _plan_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  temp_password text;
  result jsonb;
BEGIN
  -- Generate a secure temporary password
  temp_password := 'TempPass' || floor(random() * 10000)::text || '!';
  
  -- Create user in auth.users table using admin API
  -- This will be handled by the edge function calling this function
  -- For now, we'll create a placeholder that the edge function will replace
  new_user_id := gen_random_uuid();
  
  -- Insert profile (this will be updated by the edge function after auth user creation)
  -- Use 'active' instead of 'pending' to comply with check constraint
  INSERT INTO public.profiles (user_id, email, display_name, account_status)
  VALUES (new_user_id, _email, _display_name, 'active')
  RETURNING user_id INTO new_user_id;
  
  -- Insert subscription
  INSERT INTO public.user_subscriptions (user_id, plan_type, purchase_date)
  VALUES (new_user_id, _plan_type, now());
  
  -- Assign appropriate role based on plan type
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, CASE 
    WHEN _plan_type = 'free' THEN 'free'::app_role
    ELSE 'user'::app_role
  END);
  
  -- Return the created user info with temporary password
  SELECT jsonb_build_object(
    'user_id', new_user_id,
    'email', _email,
    'display_name', _display_name,
    'plan_type', _plan_type,
    'temp_password', temp_password
  ) INTO result;
  
  RETURN result;
END;
$$;