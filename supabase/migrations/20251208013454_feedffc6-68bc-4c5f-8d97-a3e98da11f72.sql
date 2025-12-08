-- Add unique constraint to genealogy table if not exists
ALTER TABLE genealogy ADD CONSTRAINT genealogy_affiliate_id_unique UNIQUE (affiliate_id);

-- Create function to populate genealogy for a new affiliate
CREATE OR REPLACE FUNCTION public.populate_genealogy_for_affiliate(p_affiliate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_parent uuid;
  v_upline1 uuid;
  v_upline2 uuid;
  v_upline3 uuid;
BEGIN
  -- Get direct sponsor (parent)
  SELECT parent_affiliate_id INTO v_parent
  FROM affiliates
  WHERE id = p_affiliate_id;

  v_upline1 := v_parent;

  -- Get level 2 (sponsor's parent)
  IF v_upline1 IS NOT NULL THEN
    SELECT parent_affiliate_id INTO v_upline2
    FROM affiliates
    WHERE id = v_upline1;
  END IF;

  -- Get level 3 (sponsor's grandparent)
  IF v_upline2 IS NOT NULL THEN
    SELECT parent_affiliate_id INTO v_upline3
    FROM affiliates
    WHERE id = v_upline2;
  END IF;

  -- Insert or update genealogy row
  INSERT INTO genealogy (affiliate_id, upline_level1, upline_level2, upline_level3, created_at)
  VALUES (p_affiliate_id, v_upline1, v_upline2, v_upline3, now())
  ON CONFLICT (affiliate_id) DO UPDATE
  SET
    upline_level1 = EXCLUDED.upline_level1,
    upline_level2 = EXCLUDED.upline_level2,
    upline_level3 = EXCLUDED.upline_level3;

  RAISE NOTICE 'Populated genealogy for affiliate %: L1=%, L2=%, L3=%', 
    p_affiliate_id, v_upline1, v_upline2, v_upline3;
END;
$$;