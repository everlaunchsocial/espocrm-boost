-- Create calendar_bookings table for demo booking system
CREATE TABLE public.calendar_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_id UUID REFERENCES public.demos(id) ON DELETE SET NULL,
  prospect_name TEXT NOT NULL,
  prospect_email TEXT NOT NULL,
  prospect_phone TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies - public can insert bookings, public read/update for now (no auth yet)
CREATE POLICY "Allow public insert on calendar_bookings"
  ON public.calendar_bookings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on calendar_bookings"
  ON public.calendar_bookings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public update on calendar_bookings"
  ON public.calendar_bookings
  FOR UPDATE
  USING (true);

-- Create index for demo lookups
CREATE INDEX idx_calendar_bookings_demo_id ON public.calendar_bookings(demo_id);
CREATE INDEX idx_calendar_bookings_date ON public.calendar_bookings(booking_date);

-- Create trigger for updated_at
CREATE TRIGGER update_calendar_bookings_updated_at
  BEFORE UPDATE ON public.calendar_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();