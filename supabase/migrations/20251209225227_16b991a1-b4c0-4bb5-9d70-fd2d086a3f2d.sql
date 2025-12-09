-- Add referrer tracking and read status to signup_events
ALTER TABLE public.signup_events 
ADD COLUMN IF NOT EXISTS referrer_affiliate_id uuid REFERENCES public.affiliates(id),
ADD COLUMN IF NOT EXISTS viewed_by_affiliate boolean DEFAULT false;

-- Create index for efficient affiliate-specific queries
CREATE INDEX IF NOT EXISTS idx_signup_events_referrer_affiliate_id ON public.signup_events(referrer_affiliate_id);

-- Allow affiliates to read their own referral events
CREATE POLICY "affiliates_read_own_referrals" ON public.signup_events
FOR SELECT USING (
  referrer_affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);

-- Allow affiliates to update viewed_by_affiliate on their own events
CREATE POLICY "affiliates_update_own_viewed" ON public.signup_events
FOR UPDATE USING (
  referrer_affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
) WITH CHECK (
  referrer_affiliate_id IN (
    SELECT id FROM affiliates WHERE user_id = auth.uid()
  )
);