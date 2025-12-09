-- Allow affiliates to view their direct downline (Tier 1 recruits)
CREATE POLICY "affiliates_view_direct_downline"
ON public.affiliates
FOR SELECT
USING (
  parent_affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);