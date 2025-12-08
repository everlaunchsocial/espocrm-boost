-- Create affiliate_plans table
CREATE TABLE IF NOT EXISTS public.affiliate_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  monthly_price numeric NOT NULL,
  demo_credits_per_month int,
  stripe_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active plans
CREATE POLICY "affiliate_plans_read_active" ON public.affiliate_plans
FOR SELECT USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "affiliate_plans_admin_all" ON public.affiliate_plans
FOR ALL USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Seed the four affiliate plans
INSERT INTO public.affiliate_plans (name, code, monthly_price, demo_credits_per_month)
VALUES 
  ('Free', 'free', 0, 5),
  ('Basic', 'basic', 29, 20),
  ('Pro', 'pro', 99, 50),
  ('Agency', 'agency', 299, -1)
ON CONFLICT (code) DO NOTHING;

-- Add columns to affiliates table
ALTER TABLE public.affiliates
ADD COLUMN IF NOT EXISTS affiliate_plan_id uuid REFERENCES public.affiliate_plans(id),
ADD COLUMN IF NOT EXISTS demo_credits_balance int,
ADD COLUMN IF NOT EXISTS demo_credits_reset_at timestamp with time zone;

-- Default existing affiliates to free plan with initial credits
UPDATE public.affiliates
SET affiliate_plan_id = (
  SELECT id FROM public.affiliate_plans WHERE code = 'free' LIMIT 1
)
WHERE affiliate_plan_id IS NULL;

UPDATE public.affiliates
SET demo_credits_balance = (
  SELECT demo_credits_per_month
  FROM public.affiliate_plans
  WHERE public.affiliate_plans.id = public.affiliates.affiliate_plan_id
)
WHERE demo_credits_balance IS NULL;

UPDATE public.affiliates
SET demo_credits_reset_at = now() + interval '30 days'
WHERE demo_credits_reset_at IS NULL;

-- Extend billing_subscriptions for affiliate subscriptions
ALTER TABLE public.billing_subscriptions
ADD COLUMN IF NOT EXISTS subscription_type text,
ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id);

-- Update existing subscriptions to be customer type
UPDATE public.billing_subscriptions
SET subscription_type = 'customer'
WHERE subscription_type IS NULL;