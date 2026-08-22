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
  Coins,
  Pencil,
  Sliders,
  Eye,
  RotateCcw,
  Image as ImageIcon,
  Save,
  CheckCheck,
  Tag,
  DollarSign,
  Calendar,
  Layers as LayersIcon
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
    updateClothingProject,
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
    setIsProcessing(true);
    try {
      const success = await signIn(adminUsernameInput, adminPasswordInput);
      if (!success) {
        setAuthError('Authentication failed. Please verify your Supabase admin credentials.');
      } else if (currentUser && !currentUser.isAdmin) {
        setAuthError('Access Denied: This account is authenticated in Supabase, but does not have administrator authorization.');
      }
    } catch {
      setAuthError('An error occurred while communicating with Supabase.');
    } finally {
      setIsProcessing(false);
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
            <p className="text-slate-400 text-xs">Enter your Supabase administrator credentials to access platform management.</p>
          </div>

          <form onSubmit={handleAdminSignInSubmit} className="space-y-4">
            {authError && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-xl leading-relaxed">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Username or Email
              </label>
              <input
                id="admin-login-username"
                type="text"
                value={adminUsernameInput}
                onChange={e => setAdminUsernameInput(e.target.value)}
                placeholder="admin username or email"
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
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              {isProcessing ? 'Authenticating with Supabase...' : 'Access Admin Dashboard'}
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

  // Selected Project to Edit & Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => projects[0]?.id || '');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ClothingProject['category']>('Streetwear');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editGalleryImagesText, setEditGalleryImagesText] = useState('');
  const [editTargetGoal, setEditTargetGoal] = useState('20000000');
  const [editRaisedAmount, setEditRaisedAmount] = useState('0');
  const [editMinStake, setEditMinStake] = useState('10000');
  const [editExpectedReturnRate, setEditExpectedReturnRate] = useState('50');
  const [editReturnMultiplier, setEditReturnMultiplier] = useState('1.5');
  const [editLockupPeriodDays, setEditLockupPeriodDays] = useState('14');
  const [editPeriodLabel, setEditPeriodLabel] = useState('14 Days Lockup');
  const [editStatus, setEditStatus] = useState<ClothingProject['status']>('active');
  const [editDaysLeft, setEditDaysLeft] = useState('30');
  const [editInvestorsCount, setEditInvestorsCount] = useState('0');
  const [editFeatured, setEditFeatured] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Quick preset image URLs for convenience when editing
  const imagePresets = [
    { label: 'Tech Jacket', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80' },
    { label: 'Hoodie Drop', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80' },
    { label: 'Denim Batch', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80' },
    { label: 'Graphic Tees', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80' },
    { label: 'Summer Linen', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80' },
    { label: 'Urban Coat', url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80' }
  ];

  const populateFormWithProject = (proj: ClothingProject) => {
    setSelectedProjectId(proj.id);
    setEditTitle(proj.title || '');
    setEditCategory(proj.category || 'Streetwear');
    setEditTagline(proj.tagline || '');
    setEditDescription(proj.description || '');
    setEditImageUrl(proj.imageUrl || '');
    const gallery = proj.galleryImages && proj.galleryImages.length > 0 ? proj.galleryImages : [proj.imageUrl || ''];
    setEditGalleryImagesText(gallery.join('\n'));
    setEditTargetGoal(String(proj.targetGoal || 20000000));
    setEditRaisedAmount(String(proj.raisedAmount || 0));
    setEditMinStake(String(proj.minStake || 10000));
    setEditExpectedReturnRate(String(proj.expectedReturnRate || 50));
    setEditReturnMultiplier(proj.returnMultiplier ? String(proj.returnMultiplier) : '1.5');
    setEditLockupPeriodDays(String(proj.lockupPeriodDays || 14));
    setEditPeriodLabel(proj.periodLabel || `${proj.lockupPeriodDays || 14} Days Lockup`);
    setEditStatus(proj.status || 'active');
    setEditDaysLeft(String(proj.daysLeft || 30));
    setEditInvestorsCount(String(proj.investorsCount || 0));
    setEditFeatured(Boolean(proj.featured));
  };

  // Sync form when projects change or on mount
  useEffect(() => {
    if (projects.length > 0) {
      const current = projects.find(p => p.id === selectedProjectId);
      if (current) {
        if (!editTitle) {
          populateFormWithProject(current);
        }
      } else {
        populateFormWithProject(projects[0]);
      }
    }
  }, [projects, selectedProjectId]);

  const handleSelectProjectToEdit = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      populateFormWithProject(proj);
    }
  };

  const handleResetForm = () => {
    const proj = projects.find(p => p.id === selectedProjectId);
    if (proj) {
      populateFormWithProject(proj);
      showToast('info', 'Form Reset', 'Reverted form back to current saved project state.');
    }
  };

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalInvestedGlobal = investments.reduce((acc, i) => acc + i.amountInvested, 0) + 145000000;
  const totalReturnsPaidGlobal = 22400000 + investments.filter(i => i.status === 'completed').reduce((acc, i) => acc + i.expectedReturnAmount, 0);

  const handleSaveProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showToast('error', 'Title Required', 'Please enter a project title.');
      return;
    }

    const currentProject = projects.find(p => p.id === selectedProjectId);
    if (!currentProject) {
      showToast('error', 'Project Not Found', 'Could not find the project being edited.');
      return;
    }

    setIsSavingProject(true);
    try {
      const parsedGallery = editGalleryImagesText
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const updatedProject: ClothingProject = {
        id: selectedProjectId,
        title: editTitle.trim(),
        category: editCategory,
        tagline: editTagline.trim(),
        description: editDescription.trim(),
        imageUrl: editImageUrl.trim() || currentProject.imageUrl,
        galleryImages: parsedGallery.length > 0 ? parsedGallery : [editImageUrl.trim() || currentProject.imageUrl],
        targetGoal: parseFloat(editTargetGoal) || 20000000,
        raisedAmount: parseFloat(editRaisedAmount) || 0,
        minStake: parseFloat(editMinStake) || 10000,
        expectedReturnRate: parseFloat(editExpectedReturnRate) || 50,
        returnMultiplier: editReturnMultiplier ? parseFloat(editReturnMultiplier) : undefined,
        lockupPeriodDays: parseInt(editLockupPeriodDays, 10) || 14,
        periodLabel: editPeriodLabel.trim() || `${editLockupPeriodDays || 14} Days Lockup`,
        status: editStatus,
        daysLeft: parseInt(editDaysLeft, 10) || 0,
        investorsCount: parseInt(editInvestorsCount, 10) || 0,
        featured: editFeatured,
      };

      const success = await updateClothingProject(updatedProject);
      if (success) {
        // Updated state will reflect across the site
      }
    } finally {
      setIsSavingProject(false);
    }
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
              id="admin-nav-edit-projects"
              onClick={() => setAdminTab('projects')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                adminTab === 'projects'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Pencil className="w-4 h-4 text-emerald-400" />
                <span>Edit Existing Projects</span>
              </div>
              <span className="text-slate-500 text-[10px] font-mono">{projects.length}</span>
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
                    <h3 className="font-bold text-sm text-white">Live Platform Projects ({projects.length})</h3>
                    <button
                      id="admin-overview-edit-projects-btn"
                      onClick={() => setAdminTab('projects')}
                      className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Projects</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projects.map(proj => {
                      const pct = Math.min(100, Math.round((proj.raisedAmount / proj.targetGoal) * 100));
                      return (
                        <div key={proj.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                          <div className="flex items-center gap-3">
                            <img src={proj.imageUrl} alt={proj.title} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-xs text-white">{proj.title}</div>
                              <div className="text-[10px] text-slate-400">
                                {proj.category} • Min: {formatUGX(proj.minStake)} • {proj.lockupPeriodDays}d ({proj.expectedReturnRate}% return)
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-bold text-xs text-white">{formatUGX(proj.raisedAmount)}</div>
                              <div className="text-[10px] text-emerald-400 font-semibold">{pct}% funded</div>
                            </div>
                            <button
                              id={`admin-edit-project-btn-${proj.id}`}
                              onClick={() => {
                                handleSelectProjectToEdit(proj.id);
                                setAdminTab('projects');
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-500/30"
                              title="Edit this project"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
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

          {/* EDIT EXISTING PROJECTS TAB */}
          {adminTab === 'projects' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Pencil className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white tracking-tight">Edit Existing Projects</h2>
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {projects.length} Total Drops
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Select any existing clothing drop to modify its title, minimum stake, return rate, funding goals, images, lockup duration, and live status.
                      </p>
                    </div>
                  </div>

                  {/* Top action: Jump to live user app preview */}
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Eye className="w-4 h-4 text-violet-400" />
                    <span>View Live Site</span>
                  </button>
                </div>

                {/* Project Selector Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <span>Select Project to Edit</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Editing: <span className="text-emerald-400 font-bold">{projects.find(p => p.id === selectedProjectId)?.title || 'None'}</span>
                    </span>
                  </div>

                  {/* Dropdown Selector */}
                  <div className="relative">
                    <select
                      id="admin-project-selector-dropdown"
                      value={selectedProjectId}
                      onChange={e => handleSelectProjectToEdit(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {projects.map(proj => (
                        <option key={proj.id} value={proj.id}>
                          {proj.title} — [{proj.category}] • Min: {formatUGX(proj.minStake)} • {proj.expectedReturnRate}% return ({proj.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Card Pickers */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                    {projects.map(proj => {
                      const isSelected = proj.id === selectedProjectId;
                      return (
                        <button
                          key={proj.id}
                          type="button"
                          onClick={() => handleSelectProjectToEdit(proj.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] text-white truncate">{proj.title}</div>
                              <div className="text-[9px] text-slate-400">{proj.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                            <span className="font-mono text-emerald-400">{formatUGXCompact(proj.minStake)} min</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                              proj.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {proj.status}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main Editing Area & Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Edit Form (8 cols on large screens) */}
                <div className="lg:col-span-7 xl:col-span-8 bg-slate-950 p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        Modify Project Parameters
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold cursor-pointer transition"
                      title="Reset form to saved project values"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Changes</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveProjectSubmit} className="space-y-6">
                    {/* SECTION 1: Identity & Categorization */}
                    <div className="space-y-4">
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>1. Project Identity & Classification</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Title */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Project Title / Name *
                          </label>
                          <input
                            id="admin-edit-project-title"
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            required
                            placeholder="e.g. Acid-Wash Vintage Denim Jacket"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Category *
                          </label>
                          <select
                            id="admin-edit-project-category"
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tagline */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Tagline / Short Pitch
                          </label>
                          <input
                            id="admin-edit-project-tagline"
                            type="text"
                            value={editTagline}
                            onChange={e => setEditTagline(e.target.value)}
                            placeholder="e.g. Premium oversized cuts for Kampala fashion week"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Period Label */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Period Label / Tag
                          </label>
                          <input
                            id="admin-edit-project-period-label"
                            type="text"
                            value={editPeriodLabel}
                            onChange={e => setEditPeriodLabel(e.target.value)}
                            placeholder="14 Days Lockup"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Financial Terms & Stakes */}
                    <div className="space-y-4 pt-4 border-t border-slate-800/80">
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        <span>2. Financial Terms, Minimum Stake & Yields</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Minimum Stake */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Minimum Stake (UGX) *
                          </label>
                          <input
                            id="admin-edit-project-min-stake"
                            type="number"
                            value={editMinStake}
                            onChange={e => setEditMinStake(e.target.value)}
                            required
                            step="1000"
                            placeholder="10000"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Expected Return Rate */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Expected Return Rate (%) *
                          </label>
                          <input
                            id="admin-edit-project-return-rate"
                            type="number"
                            step="0.1"
                            value={editExpectedReturnRate}
                            onChange={e => setEditExpectedReturnRate(e.target.value)}
                            required
                            placeholder="50"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-violet-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Return Multiplier */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Return Multiplier (e.g. 1.5)
                          </label>
                          <input
                            id="admin-edit-project-return-multiplier"
                            type="number"
                            step="0.05"
                            value={editReturnMultiplier}
                            onChange={e => setEditReturnMultiplier(e.target.value)}
                            placeholder="1.5"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Target Funding Goal */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Target Funding Goal (UGX) *
                          </label>
                          <input
                            id="admin-edit-project-target-goal"
                            type="number"
                            value={editTargetGoal}
                            onChange={e => setEditTargetGoal(e.target.value)}
                            required
                            step="100000"
                            placeholder="20000000"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Raised Amount */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Currently Raised (UGX)
                          </label>
                          <input
                            id="admin-edit-project-raised-amount"
                            type="number"
                            value={editRaisedAmount}
                            onChange={e => setEditRaisedAmount(e.target.value)}
                            step="10000"
                            placeholder="0"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Duration, Metrics & Status */}
                    <div className="space-y-4 pt-4 border-t border-slate-800/80">
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>3. Lockup Duration, Metrics & Visibility Status</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Lockup Duration */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Lockup Duration (Days) *
                          </label>
                          <input
                            id="admin-edit-project-lockup-days"
                            type="number"
                            value={editLockupPeriodDays}
                            onChange={e => setEditLockupPeriodDays(e.target.value)}
                            required
                            placeholder="14"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Days Left */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Days Left / Remaining
                          </label>
                          <input
                            id="admin-edit-project-days-left"
                            type="number"
                            value={editDaysLeft}
                            onChange={e => setEditDaysLeft(e.target.value)}
                            placeholder="30"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Investors Count */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Investors / Backers Count
                          </label>
                          <input
                            id="admin-edit-project-investors-count"
                            type="number"
                            value={editInvestorsCount}
                            onChange={e => setEditInvestorsCount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Project Lifecycle Status *
                          </label>
                          <select
                            id="admin-edit-project-status"
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="active">Active (Accepting Investments)</option>
                            <option value="funded">Funded (Goal Met / In Production)</option>
                            <option value="closed">Closed / Completed</option>
                          </select>
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 mt-2 sm:mt-0">
                          <div>
                            <div className="text-xs font-bold text-white">Featured Project</div>
                            <div className="text-[10px] text-slate-400">Show highlighted badge on showcase</div>
                          </div>
                          <input
                            id="admin-edit-project-featured"
                            type="checkbox"
                            checked={editFeatured}
                            onChange={e => setEditFeatured(e.target.checked)}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Media & Image URLs */}
                    <div className="space-y-4 pt-4 border-t border-slate-800/80">
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>4. Media, Cover Photo & Gallery Images</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Primary Cover Image URL *
                        </label>
                        <input
                          id="admin-edit-project-image-url"
                          type="url"
                          value={editImageUrl}
                          onChange={e => setEditImageUrl(e.target.value)}
                          required
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                        />

                        {/* Image Presets */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-semibold">Quick Photo Presets:</span>
                          {imagePresets.map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setEditImageUrl(preset.url)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                editImageUrl === preset.url
                                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gallery Images */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Gallery Images (One URL per line)
                        </label>
                        <textarea
                          id="admin-edit-project-gallery"
                          rows={2}
                          value={editGalleryImagesText}
                          onChange={e => setEditGalleryImagesText(e.target.value)}
                          placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* SECTION 5: Description & Story */}
                    <div className="space-y-4 pt-4 border-t border-slate-800/80">
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>5. Project Description & Brand Story</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Full Project Description
                        </label>
                        <textarea
                          id="admin-edit-project-description"
                          rows={4}
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          placeholder="Describe materials, production timeline, distribution, boutique expansion, and sales channels across Uganda..."
                          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Submit and Save Actions */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        id="admin-save-project-btn"
                        type="submit"
                        disabled={isSavingProject}
                        className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-950/50 transition cursor-pointer text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSavingProject ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes & Update Live Platform</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        disabled={isSavingProject}
                        className="w-full sm:w-auto py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Revert</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Live Card Preview (4 cols on large screens) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  {/* Real-time Preview Container */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 sticky top-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Live Platform Preview
                        </h4>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        ID: {selectedProjectId}
                      </span>
                    </div>

                    {/* Preview Project Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                      {/* Image Preview */}
                      <div className="relative aspect-video bg-slate-950">
                        <img
                          src={editImageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80'}
                          alt={editTitle || 'Drop Preview'}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80';
                          }}
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-950/80 text-white backdrop-blur-xs border border-white/10">
                            {editCategory}
                          </span>
                          {editFeatured && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            editStatus === 'active'
                              ? 'bg-emerald-500 text-slate-950'
                              : editStatus === 'funded'
                              ? 'bg-violet-500 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {editStatus}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-violet-600/90 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                          +{editExpectedReturnRate}% Return
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-black text-sm text-white leading-snug">
                            {editTitle || 'Untitled Clothing Drop'}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {editTagline || editDescription || 'No description provided yet.'}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          {(() => {
                            const goal = parseFloat(editTargetGoal) || 20000000;
                            const raised = parseFloat(editRaisedAmount) || 0;
                            const pct = Math.min(100, Math.round((raised / goal) * 100));
                            return (
                              <>
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-400">Raised: {formatUGX(raised)}</span>
                                  <span className="text-emerald-400">{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-slate-500 text-right">
                                  Target: {formatUGX(goal)}
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-slate-500 block text-[10px]">Min Stake</span>
                            <span className="font-extrabold text-emerald-400 font-mono">
                              {formatUGX(parseFloat(editMinStake) || 10000)}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-slate-500 block text-[10px]">Lockup Period</span>
                            <span className="font-extrabold text-white">
                              {editLockupPeriodDays || 14} Days
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span>{editDaysLeft} days remaining</span>
                          <span>{editInvestorsCount} investors staked</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Edits saved here immediately update across User Dashboards, Drop Showcases, and investment calculation modals.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
