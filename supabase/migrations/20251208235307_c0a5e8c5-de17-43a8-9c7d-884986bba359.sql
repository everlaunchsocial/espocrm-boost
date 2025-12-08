-- Create a security definer function to check if current user is super_admin
-- This avoids recursive RLS issues when checking admin status
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND global_role = 'super_admin'
  )
$$;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Create a simple self-select policy for users to read their own profile
CREATE POLICY "profiles_self_select" ON public.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Create admin policy using the security definer function for all operations
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid())
WITH CHECK (public.is_super_admin() OR user_id = auth.uid());