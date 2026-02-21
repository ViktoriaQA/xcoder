-- Update RLS policies to allow service role operations during registration
-- This migration is optional if the initial migration already includes these policies

-- Safely drop and recreate policies for profiles table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow profile creation on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Safely drop and recreate policies for user_roles table
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert own role during onboarding" ON public.user_roles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow role creation on signup" ON public.user_roles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can insert own role during onboarding"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role IN ('student', 'trainer'));

CREATE POLICY "Allow role creation on signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (true);


