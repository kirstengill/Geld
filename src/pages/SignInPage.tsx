import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { signIn, setCurrentView, showToast } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('error', 'Username Required', 'Please enter your username.');
      return;
    }
    if (!password) {
      showToast('error', 'Password Required', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      signIn(username, password);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      {/* Card (Direct without back button to landing page) */}
      <div
        id="sign-in-card"
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
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
          <p className="text-xs text-slate-500">Sign in to continue to your investment account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signin-username-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signin-password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => showToast('info', 'Password Access', 'Enter your username and password to log in.')}
              className="text-violet-600 hover:underline font-semibold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Sign In */}
          <div className="pt-2">
            <button
              id="signin-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition cursor-pointer text-sm disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Sign Up Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <button
            id="switch-to-signup-btn"
            onClick={() => setCurrentView('signup')}
            className="text-violet-600 font-bold hover:underline cursor-pointer"
          >
            Create Account
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
