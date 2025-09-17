-- Fix foreign key on profiles.user_id to reference auth.users instead of (likely) public.users
-- This resolves FK violations when inserting profiles for newly created auth users

-- Drop existing FK constraint if present
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Recreate FK pointing to auth.users(id)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Optional: ensure one profile per user (idempotent if already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'uq_profiles_user_id'
  ) THEN
    CREATE UNIQUE INDEX uq_profiles_user_id ON public.profiles(user_id);
  END IF;
END $$;