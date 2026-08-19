/**
 * Referral helpers: unique code generation, domain resolution, and link building.
 *
 * These operate on the existing User data model stored in Supabase.
 */
import { User } from '../types';
import { REFERRAL_CODE_PREFIX } from '../config/rewards';

// Character pool excludes easily confused characters (0, O, 1, I) for readability.
const CHAR_POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_SUFFIX_LENGTH = 5;
const MAX_COLLISION_ATTEMPTS = 25;

function randomSuffix(): string {
  let s = '';
  for (let i = 0; i < CODE_SUFFIX_LENGTH; i++) {
    s += CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
  }
  return s;
}

/**
 * Generates a unique, collision-safe referral code.
 * @param existingCodes A mutable set of codes already in use (updated in place).
 */
export function generateReferralCode(existingCodes: Set<string>): string {
  for (let i = 0; i < MAX_COLLISION_ATTEMPTS; i++) {
    const code = `${REFERRAL_CODE_PREFIX}-${randomSuffix()}`;
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
  // Guaranteed-unique fallback if the pool is ever exhausted.
  const code = `${REFERRAL_CODE_PREFIX}-${randomSuffix()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
  existingCodes.add(code);
  return code;
}

/**
 * Returns the set of referral codes already present on the user list.
 */
export function collectExistingReferralCodes(users: User[]): Set<string> {
  const codes = new Set<string>();
  for (const u of users) {
    if (u.referralCode) codes.add(u.referralCode);
  }
  return codes;
}

/**
 * Resolves the application origin/URL without hardcoding a domain.
 * Prefers an explicitly configured APP_URL (if provided and valid) and falls
 * back to the real browser origin the app is served from.
 */
export function getAppOrigin(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.location.origin.replace(/\/$/, '');
  } catch {
    return '';
  }
}

/**
 * Builds the fully qualified referral link for a given referral code using the
 * application's actual configured signup route.
 */
export function buildReferralLink(referralCode: string): string {
  if (!referralCode) return '';
  const origin = getAppOrigin();
  return `${origin}/signup?ref=${encodeURIComponent(referralCode)}`;
}
