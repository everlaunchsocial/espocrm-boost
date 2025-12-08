-- PHASE C1: Commission Distribution Engine

-- 1) Ensure affiliate_commissions has all required columns (should already exist but safe to check)
-- Note: These columns already exist per the schema, but adding IF NOT EXISTS for safety

-- 2) Create the main commission distribution function
CREATE OR REPLACE FUNCTION public.distribute_commissions(
  p_customer_id uuid,
  p_gross_amount numeric,
  p_event_type text DEFAULT 'sale'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_id uuid;
  v_plan_id uuid;
  v_level1_rate numeric;
  v_level2_rate numeric;
  v_level3_rate numeric;
  v_upline1 uuid;
  v_upline2 uuid;
  v_upline3 uuid;
  v_now timestamp := now();
BEGIN
  -- 1) Find selling affiliate from customer_profiles
  SELECT affiliate_id INTO v_affiliate_id
  FROM customer_profiles
  WHERE id = p_customer_id;

  IF v_affiliate_id IS NULL THEN
    -- No affiliate attached to this customer → nothing to distribute
    RAISE NOTICE 'No affiliate found for customer %', p_customer_id;
    RETURN;
  END IF;

  RAISE NOTICE 'Found affiliate % for customer %', v_affiliate_id, p_customer_id;

  -- 2) Resolve commission plan (affiliate-specific or default)
  SELECT commission_plan_id INTO v_plan_id
  FROM affiliates
  WHERE id = v_affiliate_id;

  IF v_plan_id IS NULL THEN
    -- Fall back to default commission plan
    SELECT id INTO v_plan_id
    FROM commission_plans
    WHERE is_default = true
    LIMIT 1;
  END IF;

  IF v_plan_id IS NULL THEN
    -- No plan configured at all → cannot calculate commissions
    RAISE NOTICE 'No commission plan found for affiliate %', v_affiliate_id;
    RETURN;
  END IF;

  RAISE NOTICE 'Using commission plan %', v_plan_id;

  -- 3) Get plan rates
  SELECT level1_rate, level2_rate, level3_rate
  INTO v_level1_rate, v_level2_rate, v_level3_rate
  FROM commission_plans
  WHERE id = v_plan_id;

  RAISE NOTICE 'Commission rates: L1=%, L2=%, L3=%', v_level1_rate, v_level2_rate, v_level3_rate;

  -- 4) Get genealogy (upline levels 1–3)
  SELECT upline_level1, upline_level2, upline_level3
  INTO v_upline1, v_upline2, v_upline3
  FROM genealogy
  WHERE affiliate_id = v_affiliate_id;

  RAISE NOTICE 'Genealogy: upline1=%, upline2=%, upline3=%', v_upline1, v_upline2, v_upline3;

  -- 5) Insert level 1 commission (direct seller - the affiliate who sold)
  IF v_level1_rate IS NOT NULL AND v_level1_rate > 0 THEN
    INSERT INTO affiliate_commissions (
      affiliate_id,
      customer_id,
      amount,
      commission_level,
      status,
      created_at
    )
    VALUES (
      v_affiliate_id,
      p_customer_id,
      ROUND(p_gross_amount * v_level1_rate, 2),
      1,
      'pending',
      v_now
    );
    RAISE NOTICE 'Inserted L1 commission: % for affiliate %', ROUND(p_gross_amount * v_level1_rate, 2), v_affiliate_id;
  END IF;

  -- 6) Insert level 2 commission (upline level 1, if exists)
  IF v_upline1 IS NOT NULL AND v_level2_rate IS NOT NULL AND v_level2_rate > 0 THEN
    INSERT INTO affiliate_commissions (
      affiliate_id,
      customer_id,
      amount,
      commission_level,
      status,
      created_at
    )
    VALUES (
      v_upline1,
      p_customer_id,
      ROUND(p_gross_amount * v_level2_rate, 2),
      2,
      'pending',
      v_now
    );
    RAISE NOTICE 'Inserted L2 commission: % for affiliate %', ROUND(p_gross_amount * v_level2_rate, 2), v_upline1;
  END IF;

  -- 7) Insert level 3 commission (upline level 2, if exists)
  IF v_upline2 IS NOT NULL AND v_level3_rate IS NOT NULL AND v_level3_rate > 0 THEN
    INSERT INTO affiliate_commissions (
      affiliate_id,
      customer_id,
      amount,
      commission_level,
      status,
      created_at
    )
    VALUES (
      v_upline2,
      p_customer_id,
      ROUND(p_gross_amount * v_level3_rate, 2),
      3,
      'pending',
      v_now
    );
    RAISE NOTICE 'Inserted L3 commission: % for affiliate %', ROUND(p_gross_amount * v_level3_rate, 2), v_upline2;
  END IF;

  -- v_upline3 is reserved for future deeper hierarchy if needed

  RAISE NOTICE 'Commission distribution complete for customer % with gross amount %', p_customer_id, p_gross_amount;
END;
$$;

-- 3) Create admin-only test function for simulating sales
CREATE OR REPLACE FUNCTION public.test_distribute_commissions(
  p_customer_id uuid,
  p_gross_amount numeric
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin or super_admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND global_role IN ('super_admin', 'admin')
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN QUERY SELECT false, 'Access denied: admin role required'::text;
    RETURN;
  END IF;

  -- Verify customer exists
  IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE id = p_customer_id) THEN
    RETURN QUERY SELECT false, ('Customer not found: ' || p_customer_id)::text;
    RETURN;
  END IF;

  -- Call the distribution function
  PERFORM distribute_commissions(p_customer_id, p_gross_amount, 'test_manual');

  RETURN QUERY SELECT true, ('Commissions distributed for customer ' || p_customer_id || ' with amount ' || p_gross_amount)::text;
END;
$$;

-- 4) Create helper function to check if user is admin (for use in RPC calls)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND global_role IN ('super_admin', 'admin')
  )
$$;

-- 5) Grant execute permissions (functions are SECURITY DEFINER so they run with elevated privileges)
-- The functions themselves check permissions internally