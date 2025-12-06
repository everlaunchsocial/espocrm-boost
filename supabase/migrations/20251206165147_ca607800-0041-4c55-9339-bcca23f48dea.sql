-- Add passcode column to demos table for phone demo lookup
ALTER TABLE public.demos ADD COLUMN passcode TEXT UNIQUE;

-- Create index for faster passcode lookups
CREATE INDEX idx_demos_passcode ON public.demos (passcode);

-- Backfill existing demos with unique passcodes
DO $$
DECLARE
  demo_record RECORD;
  new_passcode TEXT;
  is_unique BOOLEAN;
BEGIN
  FOR demo_record IN SELECT id FROM public.demos WHERE passcode IS NULL LOOP
    is_unique := FALSE;
    WHILE NOT is_unique LOOP
      new_passcode := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
      -- Check if this passcode already exists
      IF NOT EXISTS (SELECT 1 FROM public.demos WHERE passcode = new_passcode) THEN
        is_unique := TRUE;
        UPDATE public.demos SET passcode = new_passcode WHERE id = demo_record.id;
      END IF;
    END LOOP;
  END LOOP;
END $$;