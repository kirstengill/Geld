import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  PlayCircle,
  Shirt,
  ShieldCheck,
  Smartphone,
  TrendingUp
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView } = useApp();

  const handleStartInvestingClick = () => {
    setCurrentView('signup');
  };

  const handleHowItWorksClick = () => {
    document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Hero Section with Apparel Photography Background */}
      <section id="hero-section" className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-slate-950 text-white overflow-hidden py-16 md:py-24">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1920&q=80"
            alt="Apparel Textiles Background"
            className="w-full h-full object-cover object-center scale-105 filter brightness-75"
          />
          {/* Multi-layer gradient overlays for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-violet-300 text-xs font-bold tracking-wide">
              <Shirt className="w-3.5 h-3.5" />
              <span>Ugandan Apparel Micro-Investing</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Invest in Clothing Businesses,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
                Grow Together.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
              ThreadInvest connects investors with quality clothing business projects. Invest your stake in UGX via MTN & Airtel Mobile Money, choose a period and earn great returns with daily progress tracking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                id="hero-start-investing-btn"
                onClick={handleStartInvestingClick}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-900/50 transition duration-200 flex items-center gap-2.5 text-base cursor-pointer hover:scale-[1.02]"
              >
                <span>Start Investing</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-how-it-works-btn"
                onClick={handleHowItWorksClick}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-md transition duration-200 flex items-center gap-2 text-base cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-violet-400" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-xl">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-violet-400 shrink-0" />
                <span>MTN & Airtel MoMo</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>UGX 20k Min Stake</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
                <span>14-Day Lockups</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              How ThreadInvest Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Start earning fixed inventory returns in UGX by backing quality clothing brands in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs relative hover:border-violet-300 transition">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm shadow-violet-200">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Browse Drops</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore trending streetwear, denim batches, and hoodie expansion drops inside your investor dashboard.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs relative hover:border-violet-300 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm shadow-purple-200">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Choose Stake</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Invest starting from UGX 20,000 using your MTN MoMo or Airtel Money wallet balance with a 14-day lockup period.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs relative hover:border-violet-300 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm shadow-indigo-200">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Track Daily Yield</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Watch dynamic progress bars increment every single day toward 100% maturity on your dashboard.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-xs relative hover:border-violet-300 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm shadow-emerald-200">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Collect Payouts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Withdraw your principal plus verified return gains in UGX directly back to your MTN or Airtel mobile money number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean About & Getting Started CTA Section */}
      <section id="about-section" className="py-20 bg-gradient-to-tr from-violet-950 via-purple-950 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Start Investing in Ugandan Apparel?
          </h2>
          <p className="text-base text-violet-200 max-w-xl mx-auto">
            Get started in seconds and manage clothing investments directly in UGX with mobile money.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setCurrentView('signup')}
              className="px-8 py-4 bg-white text-violet-950 hover:bg-violet-50 font-black text-base rounded-2xl shadow-xl transition cursor-pointer hover:scale-[1.02]"
            >
              Start Investing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
