-- Ensure RLS is enabled on chat_settings
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "chat_settings_customer_insert" ON chat_settings;

-- Allow customers to insert their own chat settings
CREATE POLICY "chat_settings_customer_insert" 
ON chat_settings FOR INSERT 
TO authenticated
WITH CHECK (
  customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  )
);