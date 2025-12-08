
-- Add onboarding fields to customer_profiles
ALTER TABLE public.customer_profiles
ADD COLUMN IF NOT EXISTS onboarding_stage TEXT DEFAULT 'pending_portal_entry',
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS lead_capture_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lead_email TEXT,
ADD COLUMN IF NOT EXISTS lead_sms_number TEXT;

-- Add new fields to voice_settings
ALTER TABLE public.voice_settings
ADD COLUMN IF NOT EXISTS voice_style TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS greeting_text TEXT,
ADD COLUMN IF NOT EXISTS response_pace TEXT DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'en';

-- Add new fields to chat_settings
ALTER TABLE public.chat_settings
ADD COLUMN IF NOT EXISTS use_website_knowledge BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS use_uploaded_docs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS greeting_text TEXT;

-- Create customer_knowledge_sources table
CREATE TABLE IF NOT EXISTS public.customer_knowledge_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'document',
  file_name TEXT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customer_knowledge_sources
ALTER TABLE public.customer_knowledge_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_knowledge_sources
CREATE POLICY "customer_knowledge_sources_admin_all" ON public.customer_knowledge_sources
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.global_role IN ('super_admin', 'admin')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.global_role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "customer_knowledge_sources_customer_self" ON public.customer_knowledge_sources
FOR ALL USING (
  customer_id IN (
    SELECT id FROM customer_profiles
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  customer_id IN (
    SELECT id FROM customer_profiles
    WHERE user_id = auth.uid()
  )
);

-- Create calendar_integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'google',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  appointments_enabled BOOLEAN DEFAULT false,
  availability_json JSONB DEFAULT '{"monday": [], "tuesday": [], "wednesday": [], "thursday": [], "friday": []}'::jsonb,
  slot_length_minutes INTEGER DEFAULT 30,
  send_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on calendar_integrations
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_integrations
CREATE POLICY "calendar_integrations_admin_all" ON public.calendar_integrations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.global_role IN ('super_admin', 'admin')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.global_role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "calendar_integrations_customer_self" ON public.calendar_integrations
FOR ALL USING (
  customer_id IN (
    SELECT id FROM customer_profiles
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  customer_id IN (
    SELECT id FROM customer_profiles
    WHERE user_id = auth.uid()
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_knowledge_sources_customer_id ON public.customer_knowledge_sources(customer_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_customer_id ON public.calendar_integrations(customer_id);
