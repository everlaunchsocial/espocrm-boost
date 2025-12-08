-- Add method column to payouts if not exists
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS method text DEFAULT 'manual';

-- Create payout generation function (admin-only via RPC check)
CREATE OR REPLACE FUNCTION public.generate_payouts_for_period(
  p_period_start date,
  p_period_end date
)
RETURNS TABLE(affiliates_paid integer, total_amount numeric) AS $$
DECLARE
  rec record;
  v_now timestamp := now();
  v_affiliates_paid integer := 0;
  v_total_amount numeric := 0;
BEGIN
  -- Security check: only admins can run this
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND global_role IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- For each affiliate, sum pending commissions in period
  FOR rec IN
    SELECT
      affiliate_id,
      SUM(amount) AS total_commission
    FROM affiliate_commissions
    WHERE status = 'pending'
      AND created_at::date >= p_period_start
      AND created_at::date <= p_period_end
    GROUP BY affiliate_id
  LOOP
    -- Insert payout row
    INSERT INTO payouts (
      affiliate_id,
      amount,
      period_start,
      period_end,
      paid_at,
      method
    ) VALUES (
      rec.affiliate_id,
      rec.total_commission,
      p_period_start,
      p_period_end,
      v_now,
      'manual'
    );

    -- Mark commissions as paid
    UPDATE affiliate_commissions
    SET status = 'paid',
        paid_at = v_now
    WHERE affiliate_id = rec.affiliate_id
      AND status = 'pending'
      AND created_at::date >= p_period_start
      AND created_at::date <= p_period_end;

    v_affiliates_paid := v_affiliates_paid + 1;
    v_total_amount := v_total_amount + rec.total_commission;
  END LOOP;

  RETURN QUERY SELECT v_affiliates_paid, v_total_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;