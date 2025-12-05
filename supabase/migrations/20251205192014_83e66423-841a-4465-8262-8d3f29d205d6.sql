-- Create demos table for Personalized AI Sales Demo Module
-- Architecture note: rep_id will reference a shared reps/users table (to be created)
-- This establishes a single canonical ownership model across all modules

CREATE TABLE public.demos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Ownership (single canonical rep identifier for all modules)
  rep_id UUID,
  
  -- Entity linkage (one must be non-null)
  lead_id UUID REFERENCES public.leads(id),
  contact_id UUID REFERENCES public.contacts(id),
  
  -- Business information (from scraping)
  business_name TEXT NOT NULL,
  website_url TEXT,
  screenshot_url TEXT,
  
  -- AI configuration
  ai_prompt TEXT,
  ai_persona_name TEXT DEFAULT 'AI Assistant',
  avatar_url TEXT,
  chat_primary_color TEXT DEFAULT '#6366f1',
  chat_title TEXT DEFAULT 'Chat with us',
  
  -- Voice provider configuration
  voice_provider TEXT NOT NULL DEFAULT 'openai',
  elevenlabs_agent_id TEXT,
  vapi_assistant_id TEXT,
  
  -- Status and tracking
  status TEXT NOT NULL DEFAULT 'draft',
  email_sent_at TIMESTAMP WITH TIME ZONE,
  first_viewed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER NOT NULL DEFAULT 0,
  chat_interaction_count INTEGER NOT NULL DEFAULT 0,
  voice_interaction_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure demo is always tied to an entity
  CONSTRAINT demo_must_have_entity CHECK (lead_id IS NOT NULL OR contact_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;

-- Allow public access (same pattern as other CRM tables)
CREATE POLICY "Allow public access on demos"
ON public.demos
FOR ALL
USING (true)
WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX idx_demos_lead_id ON public.demos(lead_id);
CREATE INDEX idx_demos_contact_id ON public.demos(contact_id);
CREATE INDEX idx_demos_rep_id ON public.demos(rep_id);
CREATE INDEX idx_demos_status ON public.demos(status);

-- Trigger for updated_at
CREATE TRIGGER update_demos_updated_at
BEFORE UPDATE ON public.demos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();