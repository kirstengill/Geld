import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminTab, ClothingProject, NetworkOperator } from '../types';
import { formatUGX, formatUGXCompact } from '../utils/format';
import {
  LayoutDashboard,
  Users,
  Layers,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlusCircle,
  ArrowLeft,
  ShieldAlert,
  Check,
  X,
  Sparkles,
  FolderPlus,
  Coins
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    setCurrentView,
    transactions,
    approveTransaction,
    rejectTransaction,
    users,
    projects,
    investments,
    createClothingProject,
    updateUserBalanceDirect,
    showToast,
    currentUser,
    loading
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      const profile = currentUser as any;
      if (!profile.isAdmin) {
        // Non-admin users should not access admin dashboard
      }
    }
  }, [currentUser, loading]);

  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const { signIn } = useApp();

  const handleAdminSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const success = await signIn(adminUsernameInput, adminPasswordInput);
    if (!success) {
      setAuthError('Invalid Admin Credentials. Username: byte & Password: byte required.');
    }
  };

  const isAdminActive = !!currentUser?.isAdmin;

  if (!isAdminActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Admin Portal Access</h1>
            <p className="text-slate-400 text-xs">Enter credentials to access platform administration and user approvals.</p>
          </div>

          <form onSubmit={handleAdminSignInSubmit} className="space-y-4">
            {authError && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Username
              </label>
              <input
                id="admin-login-username"
                type="text"
                value={adminUsernameInput}
                onChange={e => setAdminUsernameInput(e.target.value)}
                placeholder="byte"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <input
                id="admin-login-password"
                type="password"
                value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value)}
                placeholder="byte"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Access Admin Dashboard
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              ← Back to Main App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New Project Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Streetwear' | 'Hoodies' | 'Denim' | 'Summer Line' | 'Jackets' | 'Accessories'>('Streetwear');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80');
  const [newTargetGoal, setNewTargetGoal] = useState('20000000');
  const [newMinStake, setNewMinStake] = useState('10000');
  const [newReturnRate, setNewReturnRate] = useState('16.5');
  const [newLockupDays, setNewLockupDays] = useState('14');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Quick preset image URLs for convenience
  const imagePresets = [
    { label: 'Tech Jacket', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80' },
    { label: 'Hoodie Drop', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80' },
    { label: 'Denim Batch', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80' },
    { label: 'Graphic Tees', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80' },
    { label: 'Summer Linen', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80' }
  ];

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalInvestedGlobal = investments.reduce((acc, i) => acc + i.amountInvested, 0) + 145000000;
  const totalReturnsPaidGlobal = 22400000 + investments.filter(i => i.status === 'completed').reduce((acc, i) => acc + i.expectedReturnAmount, 0);

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('error', 'Title Required', 'Please enter a project title.');
      return;
    }

    setIsCreatingProject(true);
    setTimeout(async () => {
      await createClothingProject({
        title: newTitle.trim(),
        category: newCategory,
        tagline: newTagline.trim() || `Exclusive ${newCategory} production release.`,
        description: newDescription.trim() || `High quality ${newCategory} collection produced with premium materials and ethical manufacturing standards in Uganda.`,
        imageUrl: newImageUrl,
        galleryImages: [
          newImageUrl,
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'
        ],
        targetGoal: parseFloat(newTargetGoal) || 20000000,
        minStake: parseFloat(newMinStake) || 10000,
        expectedReturnRate: parseFloat(newReturnRate) || 15.0,
        lockupPeriodDays: parseInt(newLockupDays, 10) || 14,
        periodLabel: `${newLockupDays || 14} Days Lockup`,
        daysLeft: 30
      });

      setNewTitle('');
      setNewTagline('');
      setNewDescription('');
      setIsCreatingProject(false);
      setAdminTab('overview');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-900/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white">Admin</span>
                <span className="font-black text-base text-red-500">Portal</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Platform Authority (UGX)
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setAdminTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                adminTab === 'overview'
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Metrics</span>
            </button>

            <button
              onClick={() => setAdminTab('approvals')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                adminTab === 'approvals'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Pending Approvals</span>
              </div>
              {pendingTransactions.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                  {pendingTransactions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </div>
              <span className="text-slate-500 text-[10px] font-mono">{users.length}</span>
            </button>

            <button
              onClick={() => setAdminTab('projects')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                adminTab === 'projects'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Clothing Drop</span>
            </button>
          </nav>
        </div>

        {/* Back to Client App */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => setCurrentView('landing')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User App</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Body */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-slate-900">
        {/* Admin Top Header */}
        <div className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-black text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Overview of platform activities & transaction verification in UGX</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-3.5 py-1.5 bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white rounded-xl text-xs font-bold border border-violet-500/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Switch to User View</span>
            </button>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Top 4 Admin Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Registered Users</span>
                <div className="text-2xl font-black text-white mt-1">{users.length}</div>
                <span className="text-[11px] text-emerald-400 font-bold">Active investors</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-950 text-violet-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Drops</span>
                <div className="text-2xl font-black text-white mt-1">{projects.length}</div>
                <span className="text-[11px] text-emerald-400 font-bold">Live clothing batches</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Invested</span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">{formatUGXCompact(totalInvestedGlobal)}</div>
                <span className="text-[11px] text-emerald-400 font-bold">Platform volume</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Returns Paid</span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">{formatUGXCompact(totalReturnsPaidGlobal)}</div>
                <span className="text-[11px] text-emerald-400 font-bold">Disbursed profits</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* DEDICATED PENDING TRANSACTION APPROVALS */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Pending Transaction Approvals</h2>
                  <p className="text-xs text-slate-400">
                    Approve or reject MTN & Airtel mobile money top-up and withdrawal requests in UGX.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-full">
                {pendingTransactions.length} Pending Actions
              </span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                ✨ No pending transactions awaiting audit. All mobile money requests are up to date!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <th className="pb-3">User Name</th>
                      <th className="pb-3">Operator</th>
                      <th className="pb-3">Phone Number</th>
                      <th className="pb-3">Amount (UGX)</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Requested At</th>
                      <th className="pb-3 text-right">Approve / Reject Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {pendingTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-900/60 transition">
                        <td className="py-4">
                          <div className="font-bold text-white">{tx.userName}</div>
                          <div className="text-[11px] text-slate-400">@{tx.userUsername}</div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              tx.operator === 'MTN'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {tx.operator || 'MOMO'}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-slate-300">{tx.phoneNumber || 'N/A'}</td>
                        <td className="py-4 font-black text-white text-sm">{formatUGX(tx.amount)}</td>
                        <td className="py-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              tx.type === 'topup'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {tx.type === 'topup' ? 'Top Up (+)' : 'Withdraw (-)'}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400">{tx.createdAt}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* APPROVE BUTTON (Auto updates user balance) */}
                            <button
                              id={`admin-approve-tx-${tx.id}`}
                              onClick={async () => {
                                setIsProcessing(true);
                                await approveTransaction(tx.id);
                                setIsProcessing(false);
                              }}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            {/* REJECT BUTTON */}
                            <button
                              id={`admin-reject-tx-${tx.id}`}
                              onClick={async () => {
                                setIsProcessing(true);
                                await rejectTransaction(tx.id);
                                setIsProcessing(false);
                              }}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/50 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* OVERVIEW SUB-TAB: Visual charts, registered users & investment lists */}
          {adminTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Investment Overview Curve & Top Projects */}
              <div className="lg:col-span-7 space-y-6">
                {/* Investment Overview Graph */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">Investment Performance Overview</h3>
                      <p className="text-xs text-slate-400">Total Invested vs Returns Disbursed (UGX)</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-violet-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Invested Volume
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Returns Paid
                      </span>
                    </div>
                  </div>

                  {/* Visual SVG Chart */}
                  <div className="h-44 w-full relative pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                      <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3 3" />

                      <path
                        d="M 0,90 Q 60,60 120,70 T 240,40 T 360,55 T 500,20"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                      />
                      <path
                        d="M 0,110 Q 60,95 120,90 T 240,80 T 360,65 T 500,50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                      />
                      <circle cx="120" cy="70" r="4" fill="#8b5cf6" />
                      <circle cx="240" cy="40" r="4" fill="#8b5cf6" />
                      <circle cx="360" cy="55" r="4" fill="#8b5cf6" />
                      <circle cx="500" cy="20" r="4" fill="#8b5cf6" />

                      <circle cx="120" cy="90" r="4" fill="#10b981" />
                      <circle cx="240" cy="80" r="4" fill="#10b981" />
                      <circle cx="360" cy="65" r="4" fill="#10b981" />
                      <circle cx="500" cy="50" r="4" fill="#10b981" />
                    </svg>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                      <span>May 1</span>
                      <span>May 8</span>
                      <span>May 15</span>
                      <span>May 22</span>
                      <span>May 29</span>
                    </div>
                  </div>
                </div>

                {/* Top Projects List */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">Live Platform Projects</h3>
                    <button
                      onClick={() => setAdminTab('projects')}
                      className="text-xs text-violet-400 hover:underline font-bold cursor-pointer"
                    >
                      + Add Project
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projects.map(proj => {
                      const pct = Math.min(100, Math.round((proj.raisedAmount / proj.targetGoal) * 100));
                      return (
                        <div key={proj.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-3">
                            <img src={proj.imageUrl} alt={proj.title} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-xs text-white">{proj.title}</div>
                              <div className="text-[10px] text-slate-400">{proj.category} • {proj.lockupPeriodDays}d lockup</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xs text-white">{formatUGX(proj.raisedAmount)}</div>
                            <div className="text-[10px] text-violet-400 font-semibold">{pct}% funded</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Registered Users */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">Registered Investors</h3>
                    <button
                      onClick={() => setAdminTab('users')}
                      className="text-xs text-violet-400 hover:underline font-bold cursor-pointer"
                    >
                      View All ({users.length})
                    </button>
                  </div>

                  {users.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No users registered yet. New user signups will appear here.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-violet-500/40"
                            />
                            <div>
                              <div className="font-bold text-xs text-white">{u.fullName}</div>
                              <div className="text-[10px] text-slate-400">@{u.username}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xs text-emerald-400">{formatUGX(u.balance)}</div>
                            <div className="text-[10px] text-slate-500">Joined {u.joinedDate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* USERS MANAGEMENT SUB-TAB */}
          {adminTab === 'users' && (
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Registered Users & Wallets</h3>
                  <p className="text-xs text-slate-400">Manage user balances and audit investor accounts in UGX.</p>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No users currently registered. When users sign up, their accounts and balances can be managed here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <th className="pb-3">User</th>
                        <th className="pb-3">Username / Email</th>
                        <th className="pb-3">Joined Date</th>
                        <th className="pb-3">Available Balance</th>
                        <th className="pb-3">Active Investments</th>
                        <th className="pb-3 text-right">Direct Balance Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map(u => {
                        const userInvs = investments.filter(inv => inv.userId === u.id);
                        return (
                          <tr key={u.id} className="hover:bg-slate-900/60 transition">
                            <td className="py-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                  alt={u.fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="font-bold text-white">{u.fullName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-slate-400 font-mono">@{u.username}</td>
                            <td className="py-3.5 text-slate-400">{u.joinedDate}</td>
                            <td className="py-3.5 font-bold text-emerald-400">{formatUGX(u.balance)}</td>
                            <td className="py-3.5 text-slate-300">{userInvs.length} ongoing</td>
                            <td className="py-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                 <button
                                   onClick={async () => {
                                     setIsProcessing(true);
                                     await updateUserBalanceDirect(u.id, u.balance + 50000);
                                     setIsProcessing(false);
                                   }}
                                   disabled={isProcessing}
                                   className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold cursor-pointer disabled:opacity-50"
                                 >
                                   +50k
                                 </button>
                                 <button
                                   onClick={async () => {
                                     setIsProcessing(true);
                                     await updateUserBalanceDirect(u.id, Math.max(0, u.balance - 50000));
                                     setIsProcessing(false);
                                   }}
                                   disabled={isProcessing}
                                   className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded text-[11px] font-bold cursor-pointer disabled:opacity-50"
                                 >
                                   -50k
                                 </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CREATE PROJECT FORM SUB-TAB */}
          {adminTab === 'projects' && (
            <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create & List New Clothing Drop</h2>
                  <p className="text-xs text-slate-400">
                    Publish brand-new clothing investment projects directly onto the live ThreadInvest platform in UGX.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateProjectSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Project Title *
                    </label>
                    <input
                      id="admin-new-project-title"
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      required
                      placeholder="e.g. Acid-Wash Vintage Denim Jacket"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="Streetwear">Streetwear</option>
                      <option value="Hoodies">Hoodies</option>
                      <option value="Denim">Denim</option>
                      <option value="Jackets">Jackets</option>
                      <option value="Summer Line">Summer Line</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                {/* Tagline & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Tagline / Short Summary
                    </label>
                    <input
                      type="text"
                      value={newTagline}
                      onChange={e => setNewTagline(e.target.value)}
                      placeholder="e.g. Premium oversized cuts for Kampala fashion week"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Target Funding Goal (UGX)
                    </label>
                    <input
                      type="number"
                      value={newTargetGoal}
                      onChange={e => setNewTargetGoal(e.target.value)}
                      placeholder="20000000"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Rates & Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Minimum Stake (UGX)
                    </label>
                    <input
                      type="number"
                      value={newMinStake}
                      onChange={e => setNewMinStake(e.target.value)}
                      placeholder="20000"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Expected Return Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={newReturnRate}
                      onChange={e => setNewReturnRate(e.target.value)}
                      placeholder="16.5"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Lockup Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={newLockupDays}
                      onChange={e => setNewLockupDays(e.target.value)}
                      placeholder="14"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Image URL & Presets */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Image URL (Streetwear or apparel collection)
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-violet-500 mb-2"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-500">Quick Presets:</span>
                    {imagePresets.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewImageUrl(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          newImageUrl === preset.url
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Detailed Brand & Project Story
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Describe materials, production timeline, boutique expansion, and sales channels across Uganda..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    id="admin-publish-project-btn"
                    type="submit"
                    disabled={isCreatingProject}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition cursor-pointer text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCreatingProject ? (
                      <span>Publishing Clothing Drop...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Publish Clothing Drop to Live Platform</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
