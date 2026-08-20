import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NetworkOperator } from '../types';
import { formatUGX, formatUGXCompact } from '../utils/format';
import { X, Smartphone, ArrowDownCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TopUpModal: React.FC = () => {
  const { isTopUpModalOpen, setIsTopUpModalOpen, submitTopUpRequest, currentUser } = useApp();

  const [operator, setOperator] = useState<NetworkOperator>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('+256 772 ');
  const [amount, setAmount] = useState<string>('50000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTopUpModalOpen) return null;

  const quickAmounts = [20000, 50000, 100000, 250000, 500000];

  const handleOperatorChange = (op: NetworkOperator) => {
    setOperator(op);
    if (op === 'MTN') {
      if (!phoneNumber.startsWith('+256 77') && !phoneNumber.startsWith('+256 78')) {
        setPhoneNumber('+256 772 ');
      }
    } else {
      if (!phoneNumber.startsWith('+256 70') && !phoneNumber.startsWith('+256 75')) {
        setPhoneNumber('+256 701 ');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      await submitTopUpRequest(operator, phoneNumber, numAmount);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div
      id="top-up-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        id="top-up-modal-content"
        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 my-auto max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header (Fixed at top of modal) */}
        <div className="shrink-0 bg-gradient-to-r from-violet-600 to-purple-700 px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs shrink-0">
              <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Top Up Wallet</h3>
              <p className="text-[11px] sm:text-xs text-violet-100">Deposit funds via Mobile Money in UGX</p>
            </div>
          </div>
          <button
            id="close-top-up-modal-btn"
            onClick={() => setIsTopUpModalOpen(false)}
            aria-label="Close Top Up Modal"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* Current Balance Banner (Fixed below header) */}
        <div className="shrink-0 bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-500 font-medium">Current Available Balance:</span>
          <span className="font-extrabold text-slate-800">{formatUGX(currentUser?.balance)}</span>
        </div>
    {/*heheheh*/}
    <div className ="ml-[32%]"> Deposit on: <span className="font-bold">0706403754 </span> </div>
    <div className="ml-5 text-red-500">Deposit on the above contact after you submitting your request!</div>
        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Step 1: Mobile Network Operator */}
            <div>
              {/*PAY PAY PAY*/}
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Mobile Network Operator
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* MTN */}
                <button
                  type="button"
                  id="select-operator-mtn-btn"
                  onClick={() => handleOperatorChange('MTN')}
                  className={`relative flex items-center p-3 rounded-xl border-2 transition text-left cursor-pointer ${
                    operator === 'MTN'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-400 font-extrabold text-slate-900 text-xs flex items-center justify-center shrink-0 mr-3 shadow-inner">
                    MTN
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">MTN MoMo</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Fast Mobile Money</div>
                  </div>
                  {operator === 'MTN' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 ml-1" />
                  )}
                </button>

                {/* Airtel */}
                <button
                  type="button"
                  id="select-operator-airtel-btn"
                  onClick={() => handleOperatorChange('Airtel')}
                  className={`relative flex items-center p-3 rounded-xl border-2 transition text-left cursor-pointer ${
                    operator === 'Airtel'
                      ? 'border-red-500 bg-red-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-red-600 font-extrabold text-white text-xs flex items-center justify-center shrink-0 mr-3 shadow-inner">
                    airtel
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">Airtel Money</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Instant Deposit</div>
                  </div>
                  {operator === 'Airtel' && (
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                2. Mobile Phone Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="top-up-phone-input"
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                  placeholder="+256 7XX XXX XXX"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">A payment prompt will be simulated on your {operator} phone</p>
            </div>

            {/* Step 3: Amount in UGX */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                3. Deposit Amount (UGX)
              </label>
              <div className="relative mb-2.5">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">UGX</span>
                <input
                  id="top-up-amount-input"
                  type="number"
                  min="5000"
                  step="1000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  placeholder="50000"
                  className="w-full pl-14 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
              </div>

              {/* Quick Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition cursor-pointer text-center ${
                      amount === val.toString()
                        ? 'bg-violet-50 border-violet-400 text-violet-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    +{formatUGXCompact(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Verification Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Instant Verification:</strong> Submitting logs a verified deposit request for your {operator} account. Your balance updates upon instant confirmation.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submit-top-up-request-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-3 sm:py-3.5 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold rounded-xl shadow-md shadow-violet-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <span>Submit Top Up Request</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                      {formatUGX(parseFloat(amount || '0'))}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
