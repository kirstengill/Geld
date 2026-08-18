import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatUGXCompact } from '../utils/format';
import { X, TrendingUp, ShieldCheck, Clock, Sparkles, CheckCircle } from 'lucide-react';

export const InvestModal: React.FC = () => {
  const { selectedProjectForInvest, setSelectedProjectForInvest, investInProject, currentUser, setIsTopUpModalOpen } = useApp();

  const [amount, setAmount] = useState<string>('20000');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(14); // 14 days default
  const [isProcessing, setIsProcessing] = useState(false);
  const [justInvested, setJustInvested] = useState(false);

  if (!selectedProjectForInvest) return null;

  const project = selectedProjectForInvest;
  const numAmount = parseFloat(amount) || 0;
  const currentBalance = currentUser?.balance || 0;
  const hasSufficientBalance = currentBalance >= numAmount && numAmount >= project.minStake;

  const expectedReturn = Math.round((numAmount * project.expectedReturnRate) / 100);
  const totalPayout = numAmount + expectedReturn;

  const quickAmounts = [20000, 50000, 100000, 250000, 500000];

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSufficientBalance) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = investInProject(project.id, numAmount, selectedPeriod);
      setIsProcessing(false);
      if (res.success) {
        setJustInvested(true);
        setTimeout(() => {
          setJustInvested(false);
          setSelectedProjectForInvest(null);
        }, 1200);
      }
    }, 400);
  };

  return (
    <div
      id="invest-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        id="invest-modal-content"
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 my-auto max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header (Fixed) */}
        <div className="shrink-0 bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-violet-100">
                  {project.category}
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +{project.expectedReturnRate}% Return
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-bold truncate max-w-[200px] sm:max-w-[260px]">{project.title}</h3>
            </div>
          </div>
          <button
            id="close-invest-modal-btn"
            onClick={() => setSelectedProjectForInvest(null)}
            aria-label="Close Invest Modal"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* User Balance Header (Fixed) */}
        <div className="shrink-0 bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-500 font-medium">Your Wallet Balance:</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">{formatUGX(currentBalance)}</span>
            {currentBalance < numAmount && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectForInvest(null);
                  setIsTopUpModalOpen(true);
                }}
                className="text-xs font-bold text-violet-700 hover:underline bg-violet-50 px-2 py-0.5 rounded cursor-pointer"
              >
                Top Up
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <form onSubmit={handleInvest} className="space-y-4 sm:space-y-5">
            {/* Quick Amounts */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Choose Stake Amount
                </label>
                <span className="text-xs text-slate-400">Min: {formatUGX(project.minStake)}</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2.5">
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                      amount === val.toString()
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {formatUGXCompact(val)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">UGX</span>
                <input
                  id="custom-invest-amount-input"
                  type="number"
                  min={project.minStake}
                  step="1000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  placeholder="Custom Amount"
                  className="w-full pl-14 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Investment Period
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { days: 14, label: '14 Days Lockup', rateBonus: '7.1% Daily Return' },
                  { days: 30, label: '1 Month', rateBonus: 'Standard' },
                  { days: 90, label: '3 Months', rateBonus: 'Quarterly' }
                ].map(item => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setSelectedPeriod(item.days)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      selectedPeriod === item.days
                        ? 'border-violet-600 bg-violet-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.rateBonus}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Return Calculator Card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50/50 border border-violet-100 rounded-xl p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Stake Amount:</span>
                <span className="font-semibold text-slate-900">{formatUGX(numAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Daily Return (7.1% / 24h):</span>
                <span className="font-bold text-emerald-600">+{formatUGX(Math.round(numAmount * 0.071))} / day</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Lockup Period:</span>
                <span className="font-semibold text-slate-900">{selectedPeriod} Days</span>
              </div>
              <div className="border-t border-violet-200/60 pt-2 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-violet-900">Total Expected Payout:</span>
                <span className="text-sm sm:text-base font-extrabold text-violet-700">
                  {formatUGX(totalPayout)} <span className="text-xs font-normal text-emerald-600">(+{formatUGX(expectedReturn)})</span>
                </span>
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
              <span>Your investment is backed by inventory production and locked for {selectedPeriod} days.</span>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                id="confirm-invest-btn"
                type="submit"
                disabled={isProcessing || !hasSufficientBalance || justInvested}
                className={`w-full min-h-[44px] py-3 sm:py-3.5 px-4 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm ${
                  justInvested
                    ? 'bg-emerald-600 text-white'
                    : hasSufficientBalance
                    ? 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-violet-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {justInvested ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5" /> Investment Successful!
                  </span>
                ) : isProcessing ? (
                  <span>Confirming Stake...</span>
                ) : hasSufficientBalance ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Invest {formatUGX(numAmount)} Now
                  </span>
                ) : (
                  <span>Insufficient Wallet Balance ({formatUGX(currentBalance)})</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
