-- Drop the problematic affiliates_admin_all policy that causes infinite recursion
-- (is_admin() queries profiles table, which triggers RLS evaluation, causing loop)
DROP POLICY IF EXISTS affiliates_admin_all ON affiliates;