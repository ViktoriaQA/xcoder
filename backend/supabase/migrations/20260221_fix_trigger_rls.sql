-- Fix trigger and RLS policies for user registration

-- Temporarily disable the trigger that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update RLS policies to allow service role to bypass restrictions
DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
CREATE POLICY "Allow profile creation on signup"
  ON public.profiles FOR INSERT
  TO service_role, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow role creation on signup" ON public.user_roles;
CREATE POLICY "Allow role creation on signup"
  ON public.user_roles FOR INSERT
  TO service_role, authenticated
  WITH CHECK (true);

-- Recreate the trigger with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.user_metadata ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data ->> 'avatar_url'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the user creation
  RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
