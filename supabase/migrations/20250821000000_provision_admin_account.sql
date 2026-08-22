-- =============================================================================
-- Provision the platform administrator account entirely inside Supabase.
-- Supabase is the SINGLE source of truth for authentication & authorization:
--  - Auth:      auth.users (email: byte@geld.local / password: byte)
--  - Authorization: public.geld_profiles.is_admin = TRUE
-- No client-side (localStorage) session or admin flags are used anywhere.
-- =============================================================================

-- 1. Ensure the admin auth user exists
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'byte@geld.local',
  crypt('byte', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"byte","full_name":"System Administrator"}'::jsonb,
  now(), now(),
  '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'byte@geld.local');

-- 2. Ensure the email identity exists so password sign-in works
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
SELECT u.id, u.id, 'email',
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       now(), now(), now()
FROM auth.users u
WHERE u.email = 'byte@geld.local'
ON CONFLICT (provider_id, uid) DO NOTHING;

-- 3. Create/update the admin profile with is_admin = TRUE (authorization source of truth)
INSERT INTO public.geld_profiles (
  id, full_name, username, email, balance, joined_date,
  referral_code, signup_bonus_given, is_admin
)
SELECT
  u.id, 'System Administrator', 'byte', 'byte@geld.local',
  1000000000, to_char(now(), 'YYYY-MM-DD'),
  'ADMIN-BYTE', TRUE, TRUE
FROM auth.users u
WHERE u.email = 'byte@geld.local'
ON CONFLICT (id) DO UPDATE
SET is_admin = TRUE,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    updated_at = now();
