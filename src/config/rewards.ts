/**
 * Reward & Referral Configuration for ThreadInvest.
 *
 * All gamification amounts and rule thresholds live here so they can be changed
 * in a single place without rewriting the feature logic.
 */

// One-time welcome bonus credited to every genuinely new account on signup.
export const SIGNUP_BONUS_UGX = 3500;

// Daily login-style reward claimed once every 24 hours.
export const DAILY_REWARD_UGX = 500;

// Reward paid to the referring user when someone they referred signs up.
export const REFERRAL_REWARD_UGX = 1000;

// Prefix used when generating human-readable referral codes (e.g. NEST-8F42K).
export const REFERRAL_CODE_PREFIX = 'NEST';

// How often (ms) a user may claim the daily reward.
export const DAILY_REWARD_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Rewards eligibility window label for display.
export const DAILY_REWARD_WINDOW_LABEL = 'Every 24 hours';

// Session-storage key used to carry the referral code through the signup flow.
export const REFERRAL_SIGNUP_STORAGE_KEY = 'threadinvest_referral_signup_code';

// Minimum withdrawal amount in UGX.
export const MIN_WITHDRAWAL_UGX = 15000;
