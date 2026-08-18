import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Gift } from 'lucide-react';
import { REFERRAL_SIGNUP_STORAGE_KEY } from '../config/rewards';

export const SignUpPage: React.FC = () => {
  const { signUp, setCurrentView, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Referral code carried through the signup flow.
  // Detected from the URL (?ref=...) or session storage so it survives refreshes.
  const [referralCode, setReferralCode] = useState<string>('');

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('ref') || '';
    const fromSession = sessionStorage.getItem(REFERRAL_SIGNUP_STORAGE_KEY) || '';
    const code = fromSession || fromUrl;
    if (code) {
      setReferralCode(code);
      sessionStorage.setItem(REFERRAL_SIGNUP_STORAGE_KEY, code);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('error', 'Full Name Required', 'Please enter your full name.');
      return;
    }
    if (!username.trim()) {
      showToast('error', 'Username Required', 'Please choose a username.');
      return;
    }
    if (!password) {
      showToast('error', 'Password Required', 'Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      showToast('error', 'Passwords Do Not Match', 'Please ensure both passwords match.');
      return;
    }
    if (!agreeTerms) {
      showToast('error', 'Terms & Conditions', 'You must agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const created = signUp(fullName, username, password, referralCode || undefined);
      if (created) {
        // Referral relationship is now recorded against this new account; clear it.
        sessionStorage.removeItem(REFERRAL_SIGNUP_STORAGE_KEY);
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      {/* Registration Card (Direct without back button to landing page) */}
      <div
        id="sign-up-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8 sm:p-10 space-y-6"
      >
        {/* Header / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200 mb-2">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.8l6 3.3v6.7l-6-3.3V9.8zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
            </svg>
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            Thread<span className="text-violet-600">Invest</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Investor Account</h2>
           <p className="text-xs text-slate-500">
             Join the community of verified apparel micro-investors in Uganda
           </p>
         </div>

         {/* Referral indicator (shown when signing up via a referral link) */}
         {referralCode && (
           <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-center gap-2.5 text-xs">
             <Gift className="w-4 h-4 text-violet-600 shrink-0" />
             <div className="text-slate-700">
               Signing up with referral code{' '}
               <span className="font-extrabold text-violet-700">{referralCode}</span>.
               Your referrer will receive a reward when your account is created.
             </div>
           </div>
         )}

        {/* Form strictly requires: Full Name, Username, Password, Confirm Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-fullname-input"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="e.g. Anthony Mugenyi"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="text-slate-400 font-bold text-xs absolute left-3.5 top-1/2 -translate-y-1/2">
                @
              </span>
              <input
                id="signup-username-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="anthonymugenyi"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
            <input
              id="signup-terms-checkbox"
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="signup-terms-checkbox" className="cursor-pointer">
              I agree to the{' '}
              <span className="text-violet-600 font-semibold underline">Terms of Service</span> and{' '}
              <span className="text-violet-600 font-semibold underline">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit Sign Up */}
          <div className="pt-2">
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition cursor-pointer text-sm disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        {/* Sign In Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <button
            id="switch-to-signin-btn"
            onClick={() => setCurrentView('signin')}
            className="text-violet-600 font-bold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-xs text-slate-400">
        © 2024 ThreadInvest. All rights reserved.
      </div>
    </div>
  );
};
