-- Update distribute_commissions to use per-affiliate plans for personal level only
-- Upline levels continue using the default plan rates

CREATE OR REPLACE FUNCTION public.distribute_commissions(p_customer_id uuid, p_gross_amount numeric, p_event_type text DEFAULT 'sale'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_affiliate_id uuid;
  v_affiliate_plan_id uuid;
  v_default_plan_id uuid;
  v_personal_rate numeric;
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
    RAISE NOTICE 'No affiliate found for customer %', p_customer_id;
    RETURN;
  END IF;

  RAISE NOTICE 'Found affiliate % for customer %', v_affiliate_id, p_customer_id;

  -- 2) Get the default commission plan (used for uplines and as fallback)
  SELECT id INTO v_default_plan_id
  FROM commission_plans
  WHERE is_default = true
  LIMIT 1;

  IF v_default_plan_id IS NULL THEN
    RAISE NOTICE 'No default commission plan configured';
    RETURN;
  END IF;

  -- 3) Get affiliate's assigned plan (for personal commission only)
  SELECT commission_plan_id INTO v_affiliate_plan_id
  FROM affiliates
  WHERE id = v_affiliate_id;

  -- 4) Get PERSONAL rate from affiliate's plan if assigned, else from default
  IF v_affiliate_plan_id IS NOT NULL THEN
    SELECT level1_rate INTO v_personal_rate
    FROM commission_plans
    WHERE id = v_affiliate_plan_id;
    
    -- Fallback to default if plan doesn't exist or rate is null
    IF v_personal_rate IS NULL THEN
      SELECT level1_rate INTO v_personal_rate
      FROM commission_plans
      WHERE id = v_default_plan_id;
    END IF;
    
    RAISE NOTICE 'Using affiliate plan % for personal rate: %', v_affiliate_plan_id, v_personal_rate;
  ELSE
    SELECT level1_rate INTO v_personal_rate
    FROM commission_plans
    WHERE id = v_default_plan_id;
    
    RAISE NOTICE 'Using default plan for personal rate: %', v_personal_rate;
  END IF;

  -- 5) Get UPLINE rates from DEFAULT plan only (not changed by affiliate's plan)
  SELECT level2_rate, level3_rate
  INTO v_level2_rate, v_level3_rate
  FROM commission_plans
  WHERE id = v_default_plan_id;

  RAISE NOTICE 'Commission rates: Personal=%, L2=%, L3=%', v_personal_rate, v_level2_rate, v_level3_rate;

  -- 6) Get genealogy (upline levels 1–3)
  SELECT upline_level1, upline_level2, upline_level3
  INTO v_upline1, v_upline2, v_upline3
  FROM genealogy
  WHERE affiliate_id = v_affiliate_id;

  RAISE NOTICE 'Genealogy: upline1=%, upline2=%, upline3=%', v_upline1, v_upline2, v_upline3;

  -- 7) Insert PERSONAL commission (level 1 - the affiliate who sold)
  IF v_personal_rate IS NOT NULL AND v_personal_rate > 0 THEN
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
      ROUND(p_gross_amount * v_personal_rate, 2),
      1,
      'pending',
      v_now
    );
    RAISE NOTICE 'Inserted personal commission: % for affiliate %', ROUND(p_gross_amount * v_personal_rate, 2), v_affiliate_id;
  END IF;

  -- 8) Insert level 2 commission (upline level 1) - uses DEFAULT rates
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

  -- 9) Insert level 3 commission (upline level 2) - uses DEFAULT rates
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

  RAISE NOTICE 'Commission distribution complete for customer % with gross amount %', p_customer_id, p_gross_amount;
END;
$function$;