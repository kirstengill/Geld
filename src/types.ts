export type NetworkOperator = 'MTN' | 'Airtel';

export type TransactionType =
  | 'topup'
  | 'withdraw'
  | 'investment'
  | 'return_payout'
  | 'signup_bonus'
  | 'referral_reward'
  | 'daily_reward';

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  avatarUrl?: string;
  balance: number;
  joinedDate: string;
  email?: string;
  // Referral & reward extensions (added by the referral/rewards feature)
  referralCode?: string;            // unique, permanent code for this user
  referredBy?: string;              // user id of the referrer (set once, immutable)
  signupBonusGiven?: boolean;       // idempotency guard for the welcome bonus
  lastDailyRewardClaim?: number;    // epoch ms of the last daily reward claim
}

export interface ClothingProject {
  id: string;
  title: string;
  category: 'Streetwear' | 'Hoodies' | 'Denim' | 'Summer Line' | 'Jackets' | 'Accessories';
  tagline: string;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  targetGoal: number;
  raisedAmount: number;
  minStake: number;
  expectedReturnRate: number; // e.g. 18 for 18%
  lockupPeriodDays: number; // e.g. 14, 30, 90, 180
  periodLabel: string; // e.g. "14 Days", "6 Months"
  status: 'active' | 'funded' | 'closed';
  daysLeft: number;
  investorsCount: number;
  featured?: boolean;
}

export interface UserInvestment {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectImageUrl: string;
  amountInvested: number;
  expectedReturnRate: number;
  expectedReturnAmount: number;
  lockupDaysTotal: number;
  daysElapsed: number;
  dailyIncrementRate: number; // percentage progress per day e.g. 7.14% for 14-day lockup
  progressPercentage: number; // 0 to 100
  startDate: string;
  maturityDate: string;
  status: 'active' | 'completed';
  periodLabel: string;
  createdAtTimestamp?: number; // timestamp in milliseconds when investment was made
  daysCredited?: number; // count of daily 2% returns already paid to user balance
}

export interface TransactionRequest {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  type: TransactionType;
  operator?: NetworkOperator;
  phoneNumber?: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  notes?: string;
  referenceId: string;
  createdAtTimestamp?: number; // epoch ms for precise ordering / cooldown math
}

export type AppView = 'landing' | 'signin' | 'signup' | 'dashboard' | 'admin';

export type DashboardTab =
  | 'dashboard'
  | 'investments'
  | 'wallet'
  | 'referral'
  | 'rewards';

export type AdminTab = 'overview' | 'approvals' | 'users' | 'projects';
