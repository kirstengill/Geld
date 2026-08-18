import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, TransactionRequest } from '../types';
import { formatUGX } from '../utils/format';
import { buildReferralLink } from '../utils/referral';
import {
  Gift, Copy, Share2, Check, Globe, Clock, Users, Tag
} from 'lucide-react';
import { REFERRAL_REWARD_UGX } from '../config/rewards';

const formatDateLabel = (ts?: number, fallback?: string) => {
  if (!ts) return fallback || '';
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isToday = d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  const isYesterday = d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
  if (isToday) return `Today • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (isYesterday) return `Yesterday • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const ReferralCard: React.FC = () => {
  const {
    currentUser,
    users,
    transactions,
    referralRewardAmount,
    showToast
  } = useApp();

  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);

  if (!currentUser) return null;

  // Referral relationships are derived from the existing users collection
  // (the same authority that stores wallet balances/accounts).
  const referralsMade: User[] = users.filter(u => u.referredBy === currentUser.id);

  // History of referral rewards credited to the current user (as the referrer).
  const referralHistory: TransactionRequest[] = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'referral_reward')
    .sort((a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0));

  const referralLink = buildReferralLink(currentUser.referralCode || '');

  const copyToClipboard = (text: string, field: 'code' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
      showToast('success', 'Copied!', field === 'code' ? 'Referral code copied to clipboard.' : 'Referral link copied to clipboard.');
    });
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on ThreadInvest',
          text: `Sign up with my referral link and we both earn rewards:`,
          url: referralLink
        });
      } else {
        copyToClipboard(referralLink, 'link');
      }
    } catch {
      copyToClipboard(referralLink, 'link');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Refer &amp; Earn</h2>
          <p className="text-xs text-slate-500">Invite friends to ThreadInvest and earn UGX rewards when they join.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Referral Code */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Your Referral Code
          </label>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-base sm:text-lg font-extrabold text-violet-700 tracking-wider break-all">
              {currentUser.referralCode || '—'}
            </div>
            <button
              id="referral-copy-code-btn"
              type="button"
              onClick={() => copyToClipboard(currentUser.referralCode || '', 'code')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                copiedField === 'code'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700'
              }`}
              title="Copy referral code"
            >
              {copiedField === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Referral Link
          </label>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-600 break-all">
              {referralLink || 'Link unavailable'}
            </div>
            <button
              id="referral-share-link-btn"
              type="button"
              onClick={shareReferralLink}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700 font-bold transition cursor-pointer shrink-0 text-xs flex items-center gap-1"
              title="Share referral link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
            <Globe className="w-3 h-3" />
            <span>Uses your app's configured domain. Directs to the existing signup page.</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
            <div className="text-2xl font-black text-slate-900">{referralsMade.length}</div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-violet-600" />
              <span>Successful Referrals</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
            <div className="text-2xl font-black text-emerald-600">{formatUGX(referralRewardAmount)}</div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <Tag className="w-3 h-3 text-amber-500" />
              <span>Per Referral</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
            <div className="text-2xl font-black text-violet-700">{formatUGX(currentUser.balance)}</div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-violet-600" />
              <span>Current Balance</span>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Referral History</h3>
            <span className="text-[10px] text-slate-400">{referralHistory.length} records</span>
          </div>

          {referralHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Users className="w-6 h-6 text-slate-200 mx-auto mb-1.5" />
              <div className="font-semibold">No referrals yet</div>
              <div className="text-[11px] mt-0.5">Share your link above to start earning referral rewards.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {referralHistory.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Gift className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {tx.notes || 'Referral reward'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>{formatDateLabel(tx.createdAtTimestamp, tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-emerald-600 text-xs shrink-0">
                    +{formatUGX(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
