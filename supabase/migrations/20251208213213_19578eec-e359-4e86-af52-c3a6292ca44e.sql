-- Add UPDATE policy for customers to update their own profile
CREATE POLICY "customer_profiles_customer_self_update" 
ON public.customer_profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());