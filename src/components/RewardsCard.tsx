import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionRequest } from '../types';
import { formatUGX, formatDuration } from '../utils/format';
import {
  Sparkles, Gift, CheckCircle2, Clock, Calendar, Coins, ArrowDownCircle, Loader2
} from 'lucide-react';
import {
  DAILY_REWARD_UGX,
  SIGNUP_BONUS_UGX,
  DAILY_REWARD_COOLDOWN_MS,
  DAILY_REWARD_WINDOW_LABEL,
  REFERRAL_REWARD_UGX
} from '../config/rewards';

const REWARD_TX_TYPES = ['daily_reward', 'signup_bonus', 'referral_reward'] as const;

const formatDateLabel = (ts?: number, fallback?: string) => {
  if (!ts) return fallback || '';
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isToday = d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  const isYesterday = d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() && d.getFullYear() === today.getFullYear();
  if (isToday) return `Today • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (isYesterday) return `Yesterday • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const typeLabel = (type: string) => {
  switch (type) {
    case 'daily_reward': return 'Daily Reward';
    case 'signup_bonus': return 'Signup Bonus';
    case 'referral_reward': return 'Referral Reward';
    default: return type;
  }
};

const typeIcon = (type: string) => {
  switch (type) {
    case 'daily_reward': return <Gift className="w-3.5 h-3.5 text-violet-600" />;
    case 'signup_bonus': return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    case 'referral_reward': return <Coins className="w-3.5 h-3.5 text-emerald-600" />;
    default: return <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />;
  }
};

export const RewardsCard: React.FC = () => {
  const { currentUser, transactions, claimDailyReward, showToast } = useApp();

  const [isClaiming, setIsClaiming] = useState(false);
  // Local tick keeps the countdown live without relying solely on browser time for
  // the UI display (eligibility is always re-verified server-side in claimDailyReward).
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!currentUser) return null;

  const now = Date.now();
  // tick referenced so the interval is wired into React state.
  void tick;

  const lastClaim = currentUser.lastDailyRewardClaim ?? 0;
  const msSinceClaim = lastClaim > 0 ? now - lastClaim : Infinity;
  const available = lastClaim === 0 || msSinceClaim >= DAILY_REWARD_COOLDOWN_MS;
  const remainingMs = lastClaim > 0 ? Math.max(0, DAILY_REWARD_COOLDOWN_MS - msSinceClaim) : 0;

  const rewardHistory: TransactionRequest[] = transactions
    .filter(t => t.userId === currentUser.id && REWARD_TX_TYPES.includes(t.type as (typeof REWARD_TX_TYPES)[number]))
    .sort((a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0));

  const totalRewardsClaimed = rewardHistory.reduce((acc, t) => acc + t.amount, 0);

  const handleClaim = () => {
    if (!available || isClaiming) return;
    setIsClaiming(true);
    const res = claimDailyReward();
    if (!res.success) {
      showToast('warning', 'Cannot Claim Yet', res.error || 'Daily reward is not yet available.');
    }
    setIsClaiming(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Daily Rewards</h2>
          <p className="text-xs text-slate-500">Log in and claim your daily reward. Credited directly to your wallet.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-5">
        {/* Daily Reward Snapshot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Today's Reward
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {formatUGX(DAILY_REWARD_UGX)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Available every {DAILY_REWARD_WINDOW_LABEL}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-700">Your Balance</div>
            <div className="text-xl font-black text-violet-700">{formatUGX(currentUser.balance)}</div>
          </div>
        </div>

        {/* Availability / Countdown */}
        <div
          className={`rounded-2xl p-4 border flex items-center justify-between gap-3 ${
            available
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              available ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold ${
                available ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {available ? 'Reward Available' : 'On Cooldown'}
              </div>
              <div className={`text-xs mt-0.5 ${
                available ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {available
                  ? 'Claim now to credit UGX to your wallet.'
                  : `Next reward available in ${formatDuration(remainingMs)}`}
              </div>
            </div>
          </div>

          <button
            id="claim-daily-reward-btn"
            type="button"
            onClick={handleClaim}
            disabled={!available || isClaiming}
            className={`min-w-[130px] min-h-[38px] px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              available
                ? 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-md shadow-violet-200'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Claiming...</span>
              </>
            ) : available ? (
              <>
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>Claim Reward</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Claimed</span>
              </>
            )}
          </button>
        </div>

        {/* Total Rewards Summary */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">Total Rewards Claimed</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{formatUGX(totalRewardsClaimed)}</div>
        </div>

        {/* Reward History */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Reward History</h3>
            <span className="text-[10px] text-slate-400">{rewardHistory.length} records</span>
          </div>

          {rewardHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Sparkles className="w-6 h-6 text-slate-200 mx-auto mb-1.5" />
              <div className="font-semibold">No rewards yet</div>
              <div className="text-[11px] mt-0.5">Claim your first daily reward or sign-up bonus to see history here.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rewardHistory.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      {typeIcon(tx.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{typeLabel(tx.type)}</span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.25 rounded">
                          {tx.notes ? 'Recorded' : 'Approved'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{formatDateLabel(tx.createdAtTimestamp, tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-extrabold text-xs shrink-0 ${
                    tx.type === 'signup_bonus' ? 'text-amber-600'
                      : tx.type === 'referral_reward' ? 'text-emerald-600'
                      : 'text-violet-700'
                  }`}>
                    +{formatUGX(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.764-1.36 2.457-1.36 3.221 0l5.714 10.077c.764 1.36.145 3.023-1.16 3.023H4.286c-1.305 0-1.924-1.663-1.16-3.023L8.257 3.1zM11 8a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-[10px] sm:text-xs text-amber-800 leading-relaxed">
          <strong>Security note:</strong> Daily reward eligibility is verified on the
          platform side using the persisted claim history — not browser time alone.
          Rewards are credited exactly once every {DAILY_REWARD_WINDOW_LABEL}.
        </p>
      </div>

      <div className="text-xs text-slate-400">
        Signup bonus: <span className="font-semibold text-slate-600">{formatUGX(SIGNUP_BONUS_UGX)}</span> ·
        Daily reward: <span className="font-semibold text-slate-600">{formatUGX(DAILY_REWARD_UGX)}</span> ·
        Referral reward: <span className="font-semibold text-slate-600">{formatUGX(REFERRAL_REWARD_UGX)}</span>
      </div>
    </div>
  );
};
