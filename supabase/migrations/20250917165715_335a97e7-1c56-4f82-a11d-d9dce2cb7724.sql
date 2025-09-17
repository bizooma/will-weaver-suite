-- Add 'free' to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'free';

-- Update the handle_new_user function to assign 'free' role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email)
  );
  
  -- Assign 'free' role by default to all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'free');
  
  RETURN new;
END;
$function$