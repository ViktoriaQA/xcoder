-- Fix RLS policies to allow service role to manage users

-- Drop existing policies and recreate with service role access
DROP POLICY IF EXISTS "Users can view own profile" ON custom_users;
DROP POLICY IF EXISTS "Users can update own profile" ON custom_users;

-- New policies that include service role access
CREATE POLICY "Users can view own profile" ON custom_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Service role full access to users" ON custom_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can update own profile" ON custom_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Fix user_sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role full access to sessions" ON user_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Also fix user_roles policies to allow service role
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role during onboarding" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role during onboarding"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role IN ('student', 'trainer'));

CREATE POLICY "Service role full access to user_roles" ON public.user_roles
  FOR ALL USING (auth.role() = 'service_role');
