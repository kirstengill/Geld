-- Geld Supabase Migration
-- Creates tables, RLS policies, and RPC functions for the Geld application.

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.geld_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  balance BIGINT NOT NULL DEFAULT 0,
  joined_date TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.geld_profiles(id),
  signup_bonus_given BOOLEAN NOT NULL DEFAULT FALSE,
  last_daily_reward_claim BIGINT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clothing projects
CREATE TABLE IF NOT EXISTS public.geld_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery_images TEXT[] NOT NULL DEFAULT '{}',
  target_goal BIGINT NOT NULL,
  raised_amount BIGINT NOT NULL DEFAULT 0,
  min_stake BIGINT NOT NULL,
  expected_return_rate NUMERIC NOT NULL,
  lockup_period_days INTEGER NOT NULL,
  period_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  days_left INTEGER NOT NULL DEFAULT 0,
  investors_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User investments
CREATE TABLE IF NOT EXISTS public.geld_investments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.geld_profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.geld_projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  project_category TEXT NOT NULL,
  project_image_url TEXT NOT NULL,
  amount_invested BIGINT NOT NULL,
  expected_return_rate NUMERIC NOT NULL,
  expected_return_amount BIGINT NOT NULL,
  lockup_days_total INTEGER NOT NULL,
  days_elapsed INTEGER NOT NULL DEFAULT 0,
  daily_increment_rate NUMERIC NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  maturity_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  period_label TEXT NOT NULL,
  created_at_timestamp BIGINT,
  days_credited INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions (deposits, withdrawals, investments, rewards, returns)
CREATE TABLE IF NOT EXISTS public.geld_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.geld_profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_username TEXT NOT NULL,
  type TEXT NOT NULL,
  operator TEXT,
  phone_number TEXT,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  processed_at TEXT,
  notes TEXT,
  reference_id TEXT NOT NULL,
  created_at_timestamp BIGINT,
  created_at_db TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_geld_investments_user_id ON public.geld_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_geld_investments_project_id ON public.geld_investments(project_id);
CREATE INDEX IF NOT EXISTS idx_geld_transactions_user_id ON public.geld_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_geld_transactions_status ON public.geld_transactions(status);
CREATE INDEX IF NOT EXISTS idx_geld_profiles_username ON public.geld_profiles(username);
CREATE INDEX IF NOT EXISTS idx_geld_profiles_referral_code ON public.geld_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_geld_profiles_email ON public.geld_profiles(email);

-- =============================================================================
-- ENABLE RLS
-- =============================================================================
ALTER TABLE public.geld_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geld_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geld_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geld_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES: geld_profiles
-- =============================================================================
CREATE POLICY "Users can create own profile"
  ON public.geld_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON public.geld_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.geld_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.geld_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.geld_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- RLS POLICIES: geld_projects
-- =============================================================================
CREATE POLICY "Everyone can view projects"
  ON public.geld_projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert projects"
  ON public.geld_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update projects"
  ON public.geld_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete projects"
  ON public.geld_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- RLS POLICIES: geld_investments
-- =============================================================================
CREATE POLICY "Users can view own investments"
  ON public.geld_investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON public.geld_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments"
  ON public.geld_investments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- RLS POLICIES: geld_transactions
-- =============================================================================
CREATE POLICY "Users can view own transactions"
  ON public.geld_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.geld_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.geld_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update transactions"
  ON public.geld_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.geld_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get current user's profile with admin flag
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS public.geld_profiles AS $$
BEGIN
  RETURN (
    SELECT * FROM public.geld_profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- FINANCIAL RPC FUNCTIONS (SECURITY DEFINER for atomic operations)
-- =============================================================================

-- Approve a topup deposit and credit user balance
CREATE OR REPLACE FUNCTION public.approve_topup(p_tx_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_tx RECORD;
  v_caller_id UUID := auth.uid();
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.geld_profiles WHERE id = v_caller_id;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can approve transactions';
  END IF;

  SELECT * INTO v_tx FROM public.geld_transactions
  WHERE id = p_tx_id AND status = 'pending' AND type = 'topup';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or not pending topup';
  END IF;

  UPDATE public.geld_transactions
  SET status = 'approved', processed_at = now()::text
  WHERE id = p_tx_id;

  UPDATE public.geld_profiles
  SET balance = balance + v_tx.amount, updated_at = now()
  WHERE id = v_tx.user_id;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve a withdrawal and debit user balance
CREATE OR REPLACE FUNCTION public.approve_withdraw(p_tx_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_tx RECORD;
  v_caller_id UUID := auth.uid();
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.geld_profiles WHERE id = v_caller_id;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can approve transactions';
  END IF;

  SELECT * INTO v_tx FROM public.geld_transactions
  WHERE id = p_tx_id AND status = 'pending' AND type = 'withdraw';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or not pending withdraw';
  END IF;

  UPDATE public.geld_transactions
  SET status = 'approved', processed_at = now()::text
  WHERE id = p_tx_id;

  UPDATE public.geld_profiles
  SET balance = balance - v_tx.amount, updated_at = now()
  WHERE id = v_tx.user_id AND balance >= v_tx.amount;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject a transaction
CREATE OR REPLACE FUNCTION public.reject_transaction(p_tx_id TEXT, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.geld_profiles WHERE id = v_caller_id;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can reject transactions';
  END IF;

  UPDATE public.geld_transactions
  SET status = 'rejected',
      notes = COALESCE(p_reason, 'Declined by Admin review'),
      processed_at = now()::text
  WHERE id = p_tx_id AND status = 'pending';

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically create an investment, deduct balance, update project, and record transaction
CREATE OR REPLACE FUNCTION public.create_investment_atomic(
  p_investment_id TEXT,
  p_user_id UUID,
  p_project_id TEXT,
  p_project_title TEXT,
  p_project_category TEXT,
  p_project_image_url TEXT,
  p_amount_invested BIGINT,
  p_expected_return_rate NUMERIC,
  p_expected_return_amount BIGINT,
  p_lockup_days_total INTEGER,
  p_start_date TEXT,
  p_maturity_date TEXT,
  p_period_label TEXT,
  p_created_at_timestamp BIGINT
)
RETURNS VOID AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_balance BIGINT;
BEGIN
  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Cannot create investment for another user';
  END IF;

  SELECT balance INTO v_balance FROM public.geld_profiles WHERE id = p_user_id FOR UPDATE;
  IF v_balance < p_amount_invested THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.geld_profiles
  SET balance = balance - p_amount_invested, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.geld_investments (
    id, user_id, project_id, project_title, project_category, project_image_url,
    amount_invested, expected_return_rate, expected_return_amount, lockup_days_total,
    days_elapsed, daily_increment_rate, progress_percentage, start_date, maturity_date,
    status, period_label, created_at_timestamp
  ) VALUES (
    p_investment_id, p_user_id, p_project_id, p_project_title, p_project_category, p_project_image_url,
    p_amount_invested, p_expected_return_rate, p_expected_return_amount, p_lockup_days_total,
    0, 7.1, 0, p_start_date, p_maturity_date,
    'active', p_period_label, p_created_at_timestamp
  );

  UPDATE public.geld_projects
  SET raised_amount = raised_amount + p_amount_invested,
      investors_count = investors_count + 1,
      status = CASE WHEN raised_amount + p_amount_invested >= target_goal THEN 'funded' ELSE 'active' END,
      updated_at = now()
  WHERE id = p_project_id;

  INSERT INTO public.geld_transactions (
    id, user_id, user_name, user_username, type, amount, status, created_at, notes, reference_id
  )
  SELECT p_investment_id, p_user_id, full_name, username, 'investment', p_amount_invested, 'approved', now()::text, '', ''
  FROM public.geld_profiles WHERE id = p_user_id;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Credit daily reward atomically
CREATE OR REPLACE FUNCTION public.claim_daily_reward(p_user_id UUID)
RETURNS TABLE(new_balance BIGINT, claimed BOOLEAN) AS $$
DECLARE
  v_now BIGINT;
  v_profile RECORD;
BEGIN
  v_now = EXTRACT(EPOCH FROM now())::BIGINT * 1000;

  SELECT * INTO v_profile FROM public.geld_profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot claim reward for another user';
  END IF;

  IF v_profile.last_daily_reward_claim IS NOT NULL
     AND (v_now - v_profile.last_daily_reward_claim) < 86400000 THEN
    claimed := FALSE;
    new_balance := v_profile.balance;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.geld_profiles
  SET balance = balance + 500,
      last_daily_reward_claim = v_now,
      updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.geld_transactions (
    id, user_id, user_name, user_username, type, amount, status, created_at, notes, reference_id, created_at_timestamp
  )
  SELECT 'tx-daily-' || v_now, p_user_id, full_name, username, 'daily_reward', 500, 'approved', now()::text, '', '', v_now
  FROM public.geld_profiles WHERE id = p_user_id;

  SELECT balance INTO new_balance FROM public.geld_profiles WHERE id = p_user_id;
  claimed := TRUE;
  RETURN NEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Credit investment returns atomically
CREATE OR REPLACE FUNCTION public.credit_investment_returns(
  p_investment_id TEXT,
  p_days_to_credit INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_inv RECORD;
  v_daily_yield BIGINT;
  v_total_yield BIGINT;
  v_principal_refund BIGINT;
  v_caller_id UUID := auth.uid();
BEGIN
  SELECT * INTO v_inv FROM public.geld_investments WHERE id = p_investment_id FOR UPDATE;
  IF NOT FOUND OR v_inv.status != 'active' THEN
    RETURN;
  END IF;

  IF v_caller_id != v_inv.user_id THEN
    RAISE EXCEPTION 'Cannot credit returns for another user''s investment';
  END IF;

  v_daily_yield = ROUND(v_inv.amount_invested * 0.071);
  v_total_yield = v_daily_yield * p_days_to_credit;

  IF v_inv.days_elapsed + p_days_to_credit >= v_inv.lockup_days_total THEN
    v_principal_refund = v_inv.amount_invested;
  END IF;

  UPDATE public.geld_investments SET
    days_elapsed = LEAST(v_inv.lockup_days_total, v_inv.days_elapsed + p_days_to_credit),
    days_credited = v_inv.days_elapsed + p_days_to_credit,
    progress_percentage = ROUND(LEAST(100, (LEAST(v_inv.lockup_days_total, v_inv.days_elapsed + p_days_to_credit)::NUMERIC / v_inv.lockup_days_total) * 100)),
    status = CASE WHEN v_inv.days_elapsed + p_days_to_credit >= v_inv.lockup_days_total THEN 'completed' ELSE 'active' END,
    updated_at = now()
  WHERE id = p_investment_id;

  IF v_total_yield + v_principal_refund > 0 THEN
    UPDATE public.geld_profiles
    SET balance = balance + v_total_yield + v_principal_refund, updated_at = now()
    WHERE id = v_inv.user_id;

    IF v_total_yield > 0 THEN
      INSERT INTO public.geld_transactions (
        id, user_id, user_name, user_username, type, amount, status, created_at, notes, reference_id, created_at_timestamp
      )
      SELECT 'tx-daily-' || p_investment_id || '-' || (v_inv.days_elapsed + p_days_to_credit) || '-' || EXTRACT(EPOCH FROM now())::BIGINT,
             v_inv.user_id, full_name, username, 'return_payout', v_total_yield, 'approved', now()::text,
             'Daily Return (+7.1% for Day ' || (v_inv.days_elapsed + p_days_to_credit) || ' on ' || v_inv.project_title || ')', '', EXTRACT(EPOCH FROM now())::BIGINT * 1000
      FROM public.geld_profiles WHERE id = v_inv.user_id;
    END IF;

    IF v_principal_refund > 0 THEN
      INSERT INTO public.geld_transactions (
        id, user_id, user_name, user_username, type, amount, status, created_at, notes, reference_id, created_at_timestamp
      )
      SELECT 'tx-matured-' || p_investment_id || '-' || EXTRACT(EPOCH FROM now())::BIGINT,
             v_inv.user_id, full_name, username, 'return_payout', v_principal_refund, 'approved', now()::text,
             'Principal Unlocked (' || v_inv.project_title || ' 14-day lockup completed)', '', EXTRACT(EPOCH FROM now())::BIGINT * 1000
      FROM public.geld_profiles WHERE id = v_inv.user_id;
    END IF;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
