-- Investment maturity returns (idempotent) and persistence helpers

ALTER TABLE public.geld_investments
  ADD COLUMN IF NOT EXISTS return_credited BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.geld_projects
  ADD COLUMN IF NOT EXISTS return_multiplier NUMERIC;

-- Users can update their own investments (progress tracking)
CREATE POLICY "Users can update own investments"
  ON public.geld_investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all investments"
  ON public.geld_investments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Complete investment at maturity: credit principal + commission once (idempotent)
CREATE OR REPLACE FUNCTION public.complete_investment_maturity(p_investment_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_inv RECORD;
  v_total_payout BIGINT;
  v_caller_id UUID := auth.uid();
BEGIN
  SELECT * INTO v_inv FROM public.geld_investments
  WHERE id = p_investment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_caller_id IS NOT NULL AND v_caller_id != v_inv.user_id THEN
    IF NOT EXISTS (SELECT 1 FROM public.geld_profiles WHERE id = v_caller_id AND is_admin = TRUE) THEN
      RAISE EXCEPTION 'Cannot complete investment for another user';
    END IF;
  END IF;

  IF v_inv.return_credited OR v_inv.status = 'completed' THEN
    RETURN;
  END IF;

  IF v_inv.days_elapsed < v_inv.lockup_days_total THEN
    RETURN;
  END IF;

  v_total_payout := v_inv.amount_invested + v_inv.expected_return_amount;

  UPDATE public.geld_investments SET
    status = 'completed',
    return_credited = TRUE,
    progress_percentage = 100,
    updated_at = now()
  WHERE id = p_investment_id;

  UPDATE public.geld_profiles
  SET balance = balance + v_total_payout, updated_at = now()
  WHERE id = v_inv.user_id;

  INSERT INTO public.geld_transactions (
    id, user_id, user_name, user_username, type, amount, status,
    created_at, processed_at, notes, reference_id, created_at_timestamp
  )
  SELECT
    'tx-complete-' || p_investment_id,
    v_inv.user_id,
    p.full_name,
    p.username,
    'return_payout',
    v_total_payout,
    'approved',
    now()::text,
    now()::text,
    'Investment Maturity Payout (' || v_inv.project_title || '): ' ||
      v_inv.amount_invested || ' principal + ' || v_inv.expected_return_amount || ' return',
    'MAT-' || p_investment_id,
    EXTRACT(EPOCH FROM now())::BIGINT * 1000
  FROM public.geld_profiles p
  WHERE p.id = v_inv.user_id
  ON CONFLICT (id) DO NOTHING;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
