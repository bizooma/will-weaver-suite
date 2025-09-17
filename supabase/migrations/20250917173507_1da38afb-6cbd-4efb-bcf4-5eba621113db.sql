-- Drop the existing function
DROP FUNCTION IF EXISTS public.admin_create_user_with_subscription(_email text, _display_name text, _plan_type text);

-- Create updated function that creates actual auth users
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
  INSERT INTO public.profiles (user_id, email, display_name, account_status)
  VALUES (new_user_id, _email, _display_name, 'pending')
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

-- Create a new function to update user ID after auth creation
CREATE OR REPLACE FUNCTION public.admin_update_created_user(_temp_user_id uuid, _auth_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Update profile with actual auth user ID
  UPDATE public.profiles 
  SET user_id = _auth_user_id, account_status = 'active'
  WHERE user_id = _temp_user_id;
  
  -- Update subscription with actual auth user ID
  UPDATE public.user_subscriptions
  SET user_id = _auth_user_id
  WHERE user_id = _temp_user_id;
  
  -- Update user roles with actual auth user ID
  UPDATE public.user_roles
  SET user_id = _auth_user_id
  WHERE user_id = _temp_user_id;
$$;