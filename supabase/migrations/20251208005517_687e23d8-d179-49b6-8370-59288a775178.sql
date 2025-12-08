-- Add affiliate_id to leads table for attribution tracking
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- Create index for efficient affiliate lead lookups
CREATE INDEX IF NOT EXISTS idx_leads_affiliate_id ON public.leads(affiliate_id);
