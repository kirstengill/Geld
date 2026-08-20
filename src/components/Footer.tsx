import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { RedDotAdminTrigger } from './RedDotAdminTrigger';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer id="main-site-footer" className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg">
                T
              </div>
              <div className="text-white text-lg font-black tracking-tight">
                Thread<span className="text-violet-400">Invest</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering independent clothing designers, streetwear labels, and apparel brands through community micro-stakes and dynamic daily yield tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Apparel Verification Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Invest</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="hover:text-white transition"
                >
                  Featured Drops
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="hover:text-white transition"
                >
                  14-Day Lockup Stakes
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="hover:text-white transition"
                >
                  Return Rates & Yields
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="hover:text-white transition"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('signin')}
                  className="hover:text-white transition"
                >
                  Investor Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('signup')}
                  className="hover:text-white transition"
                >
                  Create Account
                </button>
              </li>
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Payment Integrations</h4>
            <p className="text-xs text-slate-400 mb-3">
              Fast, direct deposits and withdrawals via authorized mobile money networks:
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-md shadow-xs">
                MTN MoMo
              </span>
              <span className="px-2.5 py-1 bg-red-600 text-white font-extrabold text-xs rounded-md shadow-xs">
                Airtel Money
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2024 ThreadInvest, All rights reserved.</span>
           
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
