-- Add pipeline_status to leads table for tracking lead progression through sales funnel
-- Default to 'new_lead' so existing inserts continue to work

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS pipeline_status TEXT NOT NULL DEFAULT 'new_lead';

-- Add index for filtering by pipeline status
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_status ON public.leads(pipeline_status);

-- Update any existing leads to have a sensible default based on current status
-- Leads with status 'converted' or 'sold' become 'customer_won'
-- Leads with status 'not-interested' or 'closed' become 'lost_closed'
-- All others keep 'new_lead' default
UPDATE public.leads 
SET pipeline_status = 'customer_won' 
WHERE status IN ('converted', 'sold', 'client', 'customer');

UPDATE public.leads 
SET pipeline_status = 'lost_closed' 
WHERE status IN ('not-interested', 'closed', 'lost');

UPDATE public.leads 
SET pipeline_status = 'contact_attempted' 
WHERE status IN ('contacted', 'sent-email', 'left-voicemail', 'contact-later');

UPDATE public.leads 
SET pipeline_status = 'ready_to_buy' 
WHERE status IN ('appointment-set', 'qualified');