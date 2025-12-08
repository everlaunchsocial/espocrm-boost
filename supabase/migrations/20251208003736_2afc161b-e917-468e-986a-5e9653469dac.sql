-- PHASE A: EverLaunch.ai Platform Tables

-- 1. commission_plans (create first as it's referenced by affiliates)
CREATE TABLE public.commission_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level1_rate NUMERIC NOT NULL DEFAULT 0.30,
  level2_rate NUMERIC NOT NULL DEFAULT 0.15,
  level3_rate NUMERIC NOT NULL DEFAULT 0.05,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. affiliates
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  commission_plan_id UUID REFERENCES public.commission_plans(id),
  username TEXT NOT NULL UNIQUE,
  parent_affiliate_id UUID REFERENCES public.affiliates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. genealogy
CREATE TABLE public.genealogy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  upline_level1 UUID REFERENCES public.affiliates(id),
  upline_level2 UUID REFERENCES public.affiliates(id),
  upline_level3 UUID REFERENCES public.affiliates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. customer_profiles
CREATE TABLE public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  affiliate_id UUID REFERENCES public.affiliates(id),
  plan_name TEXT,
  minutes_included INTEGER NOT NULL DEFAULT 0,
  minutes_used INTEGER NOT NULL DEFAULT 0,
  overage_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. affiliate_commissions
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  commission_level INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 6. billing_subscriptions
CREATE TABLE public.billing_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. billing_usage
CREATE TABLE public.billing_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  usage_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. usage_logs
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. voice_settings
CREATE TABLE public.voice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  voice_gender TEXT DEFAULT 'female',
  voice_speed NUMERIC DEFAULT 1.0,
  voice_pitch NUMERIC DEFAULT 1.0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. chat_settings
CREATE TABLE public.chat_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tone TEXT DEFAULT 'professional',
  instructions TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. twilio_numbers
CREATE TABLE public.twilio_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
  twilio_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. payouts
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. Add converted_at to existing demos table
ALTER TABLE public.demos ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on all new tables (policies will be added in Phase B)
ALTER TABLE public.commission_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genealogy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twilio_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;