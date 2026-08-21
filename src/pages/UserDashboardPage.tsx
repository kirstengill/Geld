import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatUGXCompact } from '../utils/format';
import { UserInvestment } from '../types';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  LogOut,
  ArrowDownCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Bell,
  Flame,
  Layers,
  Calendar,
  FastForward,
  Sparkles,
  ChevronRight,
  Filter,
  CreditCard,
  Clock,
  Shirt,
  Info,
  Gift
} from 'lucide-react';
import { ReferralCard } from '../components/ReferralCard';
import { RewardsCard } from '../components/RewardsCard';
import { FaWhatsapp } from 'react-icons/fa';

export const UserDashboardPage: React.FC = () => {
  const {
    currentUser,
    projects,
    investments,
    transactions,
    dashboardTab,
    setDashboardTab,
    setIsTopUpModalOpen,
    setIsWithdrawModalOpen,
    setSelectedProjectForInvest,
    investInProject,
    advanceSimulationDay,
    simulatedDay,
    logout,
    setCurrentView,
    showToast
  } = useApp();

  // Selected project for the inline showcase in Dashboard tab
  const [activeShowcaseProjectId, setActiveShowcaseProjectId] = useState<string>(
    projects[0]?.id || 'proj-urban-wear'
  );

  // Inline investment form state
  const [inlineStakeAmount, setInlineStakeAmount] = useState<string>('20000');
  const [inlinePeriodDays, setInlinePeriodDays] = useState<number>(14);
  const [isSubmittingStake, setIsSubmittingStake] = useState(false);

  // Filter state for investments and transactions
  const [investmentFilter, setInvestmentFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'topup' | 'withdraw' | 'investment'>('all');

  const showcaseProject = projects.find(p => p.id === activeShowcaseProjectId) || projects[0];

  // Calculations for user portfolio
  const userInvestments = investments.filter(inv => inv.userId === currentUser?.id);
  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
  const completedInvestments = userInvestments.filter(inv => inv.status === 'completed');
  const totalInvestedAmount = userInvestments.reduce((acc, inv) => acc + inv.amountInvested, 0);
  const totalExpectedReturns = userInvestments.reduce((acc, inv) => acc + inv.expectedReturnAmount, 0);
  const returnPercentage = totalInvestedAmount > 0
    ? ((totalExpectedReturns / totalInvestedAmount) * 100).toFixed(1)
    : '15.0';

  const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
  const pendingTransactions = userTransactions.filter(t => t.status === 'pending');

  // Real-time tick for 24-hour countdown display
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTimerTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const get24hCycleInfo = (inv: UserInvestment) => {
    if (inv.status === 'completed') return '100% Lockup Completed';
    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const created = inv.createdAtTimestamp || (inv.startDate ? new Date(inv.startDate).getTime() : now);
    const msElapsed = Math.max(0, now - created);
    const msIntoCurrent24h = msElapsed % DAY_MS;
    const msRemaining = DAY_MS - msIntoCurrent24h;

    const hours = Math.floor(msRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m until next 24h cycle increment (+${inv.dailyIncrementRate}%)`;
  };

  const filteredInvestments = userInvestments.filter(inv => {
    if (investmentFilter === 'active') return inv.status === 'active';
    if (investmentFilter === 'completed') return inv.status === 'completed';
    return true;
  });

  const filteredTransactions = userTransactions.filter(tx => {
    if (transactionFilter === 'all') return true;
    return tx.type === transactionFilter;
  });

  const numStake = parseFloat(inlineStakeAmount) || 0;
  const expectedReturnForInline = showcaseProject
    ? Math.round((numStake * showcaseProject.expectedReturnRate) / 70)
    : 0;

  const handleInlineInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseProject) return;
    if (numStake > (currentUser?.balance || 0)) {
      showToast('error', 'Insufficient Funds', 'Please top up your wallet with MTN MoMo or Airtel Money first.');
      return;
    }
    setIsSubmittingStake(true);
    try {
      const res = await investInProject(showcaseProject.id, numStake, inlinePeriodDays);
      if (res.success) {
        setDashboardTab('investments');
      }
    } finally {
      setIsSubmittingStake(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 pb-24 md:pb-0">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Hidden on mobile devices for a clean, realistic layout) */}
      {/* ========================================================================= */}
      <aside
        id="user-dashboard-desktop-sidebar"
        className="hidden md:flex md:w-64 bg-white border-r border-slate-200/90 flex-col shrink-0 p-5 justify-between sticky top-0 h-screen overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-violet-200 group-hover:scale-105 transition">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.8l6 3.3v6.7l-6-3.3V9.8zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-lg font-black text-slate-900 tracking-tight">Thread</span>
                <span className="text-lg font-black text-violet-600 tracking-tight">Invest</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                UGX Platform
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <button
              id="sidebar-tab-dashboard"
              onClick={() => setDashboardTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                dashboardTab === 'dashboard'
                  ? 'bg-violet-50 text-violet-700 shadow-xs border border-violet-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard / Balance</span>
            </button>

            <button
              id="sidebar-tab-investments"
              onClick={() => setDashboardTab('investments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                dashboardTab === 'investments'
                  ? 'bg-violet-50 text-violet-700 shadow-xs border border-violet-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>Investments</span>
              </div>
              {activeInvestments.length > 0 && (
                <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {activeInvestments.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-tab-wallet"
              onClick={() => setDashboardTab('wallet')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                dashboardTab === 'wallet'
                  ? 'bg-violet-50 text-violet-700 shadow-xs border border-violet-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4" />
                <span>Transactions / Wallet</span>
              </div>
              {pendingTransactions.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {pendingTransactions.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-tab-referral"
              onClick={() => setDashboardTab('referral')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                dashboardTab === 'referral'
                  ? 'bg-violet-50 text-violet-700 shadow-xs border border-violet-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Refer &amp; Earn</span>
            </button>

            <button
              id="sidebar-tab-rewards"
              onClick={() => setDashboardTab('rewards')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                dashboardTab === 'rewards'
                  ? 'bg-violet-50 text-violet-700 shadow-xs border border-violet-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Daily Rewards</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Promo Card + Simulation Day Tracker + Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          {/* Day Simulation Helper Tool (To demonstrate dynamic daily 14-day progress increment) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-violet-600" /> Day Tracker
              </span>
             
            </div>
           
            <p className="text-[10px] text-slate-400 leading-tight">
              Advances active 14-day lockup progress bars by 1 day increment.
            </p>
          </div>

          {/* User Account Info */}
          <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl flex items-center gap-3">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser?.fullName}
              className="w-9 h-9 rounded-full object-cover border border-violet-300"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser?.fullName}</div>
              <div className="text-[11px] text-violet-700 font-extrabold">{formatUGX(currentUser?.balance)}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE TOP BAR (Appears on small screens) */}
      {/* ========================================================================= */}
      <header className="md:hidden bg-white border-b border-slate-200/90 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            T
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 tracking-tight leading-tight flex items-center">
              Thread<span className="text-violet-600">Invest</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold -mt-0.5">UGX Account</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Simulation Trigger Pill on Mobile */}
          <button
            onClick={()=>{
              window.open("https://chat.whatsapp.com/LRgK4jC7cJ5CqiXa7At1YN?s=hd&p=i&mlu=4")
            }}
            title="our help line"
            className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-[11px] font-bold cursor-pointer"
          >
            <FaWhatsapp className="w-3 h-3 text-violet-600" />
            <span>helpLine</span>
          </button>

          {/* Logout on Mobile */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN DASHBOARD CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Desktop Top Header Bar */}
        <div className="hidden md:flex bg-white border-b border-slate-200/90 px-6 py-4 items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, categories, transactions..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open(
                "https://chat.whatsapp.com/LRgK4jC7cJ5CqiXa7At1YN?s=hd&p=i&mlu=4"
              )}
              title="help line "
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <FaWhatsapp size={20} className="w-3.5 h-3.5 text-violet-600" />
              <span>Join WhatsApp group</span>
            </button>

            <button
              onClick={() => setDashboardTab('wallet')}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {pendingTransactions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-violet-600 absolute top-2 right-2 ring-2 ring-white" />
              )}
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser?.fullName}
                className="w-9 h-9 rounded-full object-cover border border-violet-200"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">{currentUser?.fullName}</div>
                <div className="text-[11px] text-violet-600 font-bold">{formatUGX(currentUser?.balance)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          {/* Welcome Greeting Card */}
          <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-violet-200 text-[11px] font-bold tracking-wide">
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Ugandan Apparel Micro-Investing</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Welcome, {currentUser?.fullName}!
                </h1>
                <p className="text-xs text-violet-200 max-w-lg">
                  Track your clothing production batches, monitor daily lockup maturation, and top up seamlessly with MTN MoMo & Airtel Money.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:self-end shrink-0">
                <button
                  id="welcome-topup-btn"
                  onClick={() => setIsTopUpModalOpen(true)}
                  className="px-4 py-2 bg-white text-violet-950 hover:bg-violet-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ArrowDownCircle className="w-4 h-4 text-violet-700" />
                  <span>Top Up Balance</span>
                </button>
                <button
                  id="welcome-withdraw-btn"
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="px-4 py-2 bg-violet-800/80 hover:bg-violet-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top 4 Stats Metric Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Balance Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Available Balance</span>
                  <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                    {formatUGX(currentUser?.balance)}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-1 border-t border-slate-100">
                <CheckCircle2 className="w-3 h-3" /> Ready to invest
              </div>
            </div>

            {/* Total Invested */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Total Invested</span>
                  <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                    {formatUGX(totalInvestedAmount)}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                In {userInvestments.length} apparel drops
              </div>
            </div>

            {/* Total Returns */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Total Returns</span>
                  <div className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5">
                    +{formatUGX(totalExpectedReturns)}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-[10px] text-rose-600 font-bold pt-1 border-t border-slate-100">
                +{returnPercentage}% avg yield
              </div>
            </div>

            {/* Active Lockups */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Active Lockups</span>
                  <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                    {activeInvestments.length}
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-[10px] text-blue-600 font-medium pt-1 border-t border-slate-100">
                14-day daily increments
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW & FEATURED APPAREL DROP */}
          {/* ===================================================================== */}
          {dashboardTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Featured Clothing Business Project Showcase + Investment Form */}
              <div
                id="clothing-business-project-showcase"
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 lg:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {showcaseProject?.title || 'Clothing Business Project'}
                    </h2>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Active Drop
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setActiveShowcaseProjectId(p.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                          activeShowcaseProjectId === p.id
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                  {/* Left: Project Image Gallery & Stats */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Visual Gallery */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2 aspect-4/3 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={showcaseProject?.imageUrl}
                          alt={showcaseProject?.title}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        {(showcaseProject?.galleryImages.slice(1, 4) || []).map((img, idx) => (
                          <div key={idx} className="flex-1 rounded-xl overflow-hidden bg-slate-100">
                            <img
                              src={img}
                              alt="Batch detail"
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Funding Progress Bar in UGX */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>
                          {formatUGX(showcaseProject?.raisedAmount)} raised of {formatUGX(showcaseProject?.targetGoal)} goal
                        </span>
                        <span className="text-violet-600 font-extrabold">
                          {((showcaseProject?.raisedAmount / showcaseProject?.targetGoal) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-violet-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (showcaseProject?.raisedAmount / showcaseProject?.targetGoal) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Story Description & Key Specs Grid in UGX */}
                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {showcaseProject?.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                          <span className="font-bold text-slate-800">{showcaseProject?.category}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Lockup Period</span>
                          <span className="font-bold text-slate-800">{showcaseProject?.lockupPeriodDays} Days Cycle</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Return</span>
                          <span className="font-bold text-emerald-600">+{showcaseProject?.expectedReturnRate}%</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Min Stake</span>
                          <span className="font-bold text-slate-800">{formatUGX(showcaseProject?.minStake)}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Goal</span>
                          <span className="font-bold text-slate-800">{formatUGXCompact(showcaseProject?.targetGoal)}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Left</span>
                          <span className="font-bold text-slate-800">{showcaseProject?.daysLeft} Days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Invest in this Project Widget Form */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-5">
                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Invest in this Project</h3>
                        <div className="text-xs text-slate-500">
                          Balance: <span className="font-bold text-violet-700">{formatUGX(currentUser?.balance)}</span>
                        </div>
                      </div>

                      <form onSubmit={handleInlineInvest} className="space-y-4 pt-3.5">
                        {/* Choose Amount */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Choose Stake Amount</label>
                          <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {['20000', '50000', '100000', '250000'].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setInlineStakeAmount(val)}
                                className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                                  inlineStakeAmount === val
                                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {formatUGXCompact(parseInt(val, 10))}
                              </button>
                            ))}
                          </div>

                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            Custom Amount (UGX)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">UGX</span>
                            <input
                              id="inline-stake-amount-input"
                              type="number"
                              min={showcaseProject?.minStake || 20000}
                              step="1000"
                              value={inlineStakeAmount}
                              onChange={e => setInlineStakeAmount(e.target.value)}
                              placeholder="20000"
                              className="w-full pl-14 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                        </div>

                        {/* Select Period */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Lockup Period</label>
                          <select
                            value={inlinePeriodDays}
                            onChange={e => setInlinePeriodDays(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            <option value={14}>14 Days Lockup (Daily Yield Increment)</option>
                            <option value={30}>30 Days Lockup</option>
                            <option value={60}>60 Days Lockup</option>
                          </select>
                        </div>

                        {/* Expected Return Calculation */}
                        <div className="space-y-1.5 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-600">Daily Return (12.5% / 24h):</span>
                            <span className="font-extrabold text-emerald-600">
                              +{formatUGX(Math.round(numStake * 0.125))} / day
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="font-semibold text-slate-600">Total Return ({showcaseProject?.expectedReturnRate}%):</span>
                            <span className="font-extrabold text-violet-700 text-sm">
                              +{formatUGX(expectedReturnForInline)}
                            </span>
                          </div>
                        </div>

                        {/* Invest Now Button */}
                        <button
                          id="inline-invest-now-btn"
                          type="submit"
                          disabled={isSubmittingStake || (currentUser?.balance || 0) < numStake}
                          className="w-full py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold rounded-xl shadow-md shadow-violet-200 transition cursor-pointer text-sm disabled:opacity-50"
                        >
                          {isSubmittingStake ? 'Processing...' : `Invest ${formatUGX(numStake)} Now`}
                        </button>
                      </form>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
                      <span>Verified UGX clothing production batch.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Investments Overview on Dashboard */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Active Investments</h3>
                    <p className="text-xs text-slate-500">
                      14-day lockup daily increment progress tracking
                    </p>
                  </div>
                  <button
                    onClick={() => setDashboardTab('investments')}
                    className="text-xs text-violet-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({userInvestments.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {userInvestments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No investments made yet. Choose a clothing project above to start!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {userInvestments.slice(0, 2).map(inv => (
                      <div
                        key={inv.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-violet-300 transition space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={inv.projectImageUrl}
                              alt={inv.projectTitle}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">{inv.projectTitle}</h4>
                              <div className="text-[11px] text-slate-500">{formatUGX(inv.amountInvested)} staked</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            Day {inv.daysElapsed}/{inv.lockupDaysTotal}
                          </span>
                        </div>

                        {/* Progress & 24h Cycle Tracking Info */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold text-slate-600">
                            <span>Maturity Progress</span>
                            <span className="text-violet-600 font-extrabold">{inv.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-600 rounded-full transition-all duration-500"
                              style={{ width: `${inv.progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium pt-0.5 flex items-center justify-between">
                            <span>{get24hCycleInfo(inv)}</span>
                            <span className="font-bold text-slate-700">+{inv.dailyIncrementRate}% / 24h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: MY INVESTMENTS (Detailed Portfolio List) */}
          {/* ===================================================================== */}
          {dashboardTab === 'investments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">My Investments</h2>
                    <p className="text-xs text-slate-500">
                      Real-time daily yield tracking and 14-day lockup maturity progress in UGX
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setInvestmentFilter('all')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        investmentFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({userInvestments.length})
                    </button>
                    <button
                      onClick={() => setInvestmentFilter('active')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        investmentFilter === 'active'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Active ({activeInvestments.length})
                    </button>
                    <button
                      onClick={() => setInvestmentFilter('completed')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        investmentFilter === 'completed'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Completed ({completedInvestments.length})
                    </button>
                  </div>
                </div>

                {filteredInvestments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                    <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-sm font-bold text-slate-600">No investments in this view</div>
                    <button
                      onClick={() => setDashboardTab('dashboard')}
                      className="px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Explore & Invest in Drops
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredInvestments.map(inv => (
                      <div
                        key={inv.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-xs transition space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={inv.projectImageUrl}
                              alt={inv.projectTitle}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                                {inv.projectCategory}
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 mt-1">{inv.projectTitle}</h4>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              inv.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-violet-100 text-violet-700'
                            }`}
                          >
                            {inv.status === 'completed' ? 'Matured' : 'Active'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                          <div>
                            <div className="text-slate-400 text-[10px]">Invested</div>
                            <div className="font-bold text-slate-900">{formatUGX(inv.amountInvested)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[10px]">Profit (+{inv.expectedReturnRate}%)</div>
                            <div className="font-bold text-emerald-600">+{formatUGX(inv.expectedReturnAmount)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[10px]">Lockup</div>
                            <div className="font-bold text-slate-800">{inv.daysElapsed}/{inv.lockupDaysTotal} Days</div>
                          </div>
                        </div>

                        {/* 24-Hour Increment Progress Bar & Live Cycle Info */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Lockup Maturity Progress</span>
                            <span className="text-violet-600 font-extrabold">{inv.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                inv.status === 'completed' ? 'bg-emerald-500' : 'bg-violet-600'
                              }`}
                              style={{ width: `${inv.progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-violet-500" />
                              {get24hCycleInfo(inv)}
                            </span>
                            <span className="font-bold text-slate-700">+{inv.dailyIncrementRate}% per 24h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: WALLET & MOBILE MONEY TRANSACTIONS */}
          {/* ===================================================================== */}
          {dashboardTab === 'wallet' && (
            <div className="space-y-6">
              {/* Wallet Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mobile Money Wallet (UGX)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {formatUGX(currentUser?.balance)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct deposits & payouts via MTN MoMo & Airtel Money Uganda
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      id="wallet-topup-trigger-btn"
                      onClick={() => setIsTopUpModalOpen(true)}
                      className="px-4 sm:px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs shadow-md shadow-violet-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      <span>Top Up</span>
                    </button>

                    <button
                      id="wallet-withdraw-trigger-btn"
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>

                {/* Important Approval Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 my-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Pending Request Verification:</p>
                    <p>
                      Top Up deposits and Mobile Money withdrawals are queued as <strong>Pending</strong> and approved by the platform Admin.
                    </p>
                  </div>
                </div>

                {/* Transactions Filter & Table */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h3 className="text-base font-bold text-slate-900">Transaction History</h3>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                      <button
                        onClick={() => setTransactionFilter('all')}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          transactionFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTransactionFilter('topup')}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          transactionFilter === 'topup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Deposits
                      </button>
                      <button
                        onClick={() => setTransactionFilter('withdraw')}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          transactionFilter === 'withdraw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Withdrawals
                      </button>
                      <button
                        onClick={() => setTransactionFilter('investment')}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          transactionFilter === 'investment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Stakes
                      </button>
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No transactions recorded for this filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                            <th className="pb-3">Reference / Type</th>
                            <th className="pb-3">Network / Details</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3.5">
                                <div className="font-bold text-slate-900">
                                {tx.type === 'topup' && 'Deposit / Top Up'}
                                {tx.type === 'withdraw' && 'Payout / Withdrawal'}
                                {tx.type === 'investment' && 'Project Stake'}
                                {tx.type === 'return_payout' && 'Maturity Payout'}
                                {tx.type === 'signup_bonus' && 'Signup Bonus'}
                                {tx.type === 'referral_reward' && 'Referral Reward'}
                                {tx.type === 'daily_reward' && 'Daily Reward'}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{tx.referenceId}</div>
                              </td>
                              <td className="py-3.5">
                                {tx.operator ? (
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                        tx.operator === 'MTN'
                                          ? 'bg-amber-400 text-slate-900'
                                          : 'bg-red-600 text-white'
                                      }`}
                                    >
                                      {tx.operator}
                                    </span>
                                    <span className="text-slate-600 font-medium">{tx.phoneNumber}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500">{tx.notes || 'Internal Ledger'}</span>
                                )}
                              </td>
                              <td className="py-3.5 font-extrabold text-slate-900">
                                {tx.type === 'withdraw' || tx.type === 'investment' ? '-' : '+'}
                                {formatUGX(tx.amount)}
                              </td>
                              <td className="py-3.5 text-slate-500">{tx.createdAt}</td>
                              <td className="py-3.5 text-right">
                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                    tx.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : tx.status === 'rejected'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-amber-100 text-amber-800 animate-pulse'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* TAB: REFERRAL — Refer & Earn */}
        {/* ===================================================================== */}
        {dashboardTab === 'referral' && (
          <div className="space-y-6">
            <ReferralCard />
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB: REWARDS — Daily Rewards */}
        {/* ===================================================================== */}
        {dashboardTab === 'rewards' && (
          <div className="space-y-6">
            <RewardsCard />
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on small devices) */}
      {/* ========================================================================= */}
      <nav
        id="mobile-bottom-navigation-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-4 flex items-center justify-around shadow-lg shadow-slate-900/10"
      >
        {/* Dashboard Tab */}
        <button
          id="mobile-nav-dashboard-tab"
          onClick={() => setDashboardTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            dashboardTab === 'dashboard'
              ? 'text-violet-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {dashboardTab === 'dashboard' && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[10px] mt-1">Dashboard</span>
        </button>

        {/* My Investments Tab */}
        <button
          id="mobile-nav-investments-tab"
          onClick={() => setDashboardTab('investments')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            dashboardTab === 'investments'
              ? 'text-violet-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <TrendingUp className="w-5 h-5" />
            {activeInvestments.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-violet-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeInvestments.length}
              </span>
            )}
            {dashboardTab === 'investments' && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[10px] mt-1">Investments</span>
        </button>

        {/* Wallet / Transactions Tab */}
        <button
          id="mobile-nav-wallet-tab"
          onClick={() => setDashboardTab('wallet')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            dashboardTab === 'wallet'
              ? 'text-violet-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Wallet className="w-5 h-5" />
            {pendingTransactions.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {pendingTransactions.length}
              </span>
            )}
            {dashboardTab === 'wallet' && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[10px] mt-1">Wallet</span>
        </button>

        {/* Referral Tab */}
        <button
          id="mobile-nav-referral-tab"
          onClick={() => setDashboardTab('referral')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            dashboardTab === 'referral'
              ? 'text-violet-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Gift className="w-5 h-5" />
            {dashboardTab === 'referral' && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[10px] mt-1">Refer</span>
        </button>

        {/* Rewards Tab */}
        <button
          id="mobile-nav-rewards-tab"
          onClick={() => setDashboardTab('rewards')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
            dashboardTab === 'rewards'
              ? 'text-violet-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            {dashboardTab === 'rewards' && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[10px] mt-1">Rewards</span>
        </button>
      </nav>
    </div>
  );
};
