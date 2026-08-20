import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  ClothingProject,
  UserInvestment,
  TransactionRequest,
  NetworkOperator,
  AppView,
  DashboardTab,
  AdminTab
} from '../types';
import { formatUGX, formatDuration } from '../utils/format';
import {
  generateReferralCode,
  collectExistingReferralCodes
} from '../utils/referral';
import {
  SIGNUP_BONUS_UGX,
  DAILY_REWARD_UGX,
  REFERRAL_REWARD_UGX,
  DAILY_REWARD_COOLDOWN_MS,
  DAILY_REWARD_WINDOW_LABEL,
  REFERRAL_SIGNUP_STORAGE_KEY
} from '../config/rewards';
import { supabase } from '../lib/supabase';
import { INITIAL_PROJECTS } from '../mockData';
import {
  getCurrentProfile,
  getAllProfiles,
  getAllProjects,
  createProject,
  getUserInvestments,
  saveUserInvestments,
  getAllInvestments,
  getUserTransactions,
  saveUserTransactions,
  getAllTransactions,
  createTransaction,
  signInWithUsername,
  signUpWithUsername,
  getProfileByReferralCode,
  updateUserBalanceDirect,
  seedInitialProjects,
  ADMIN_USER,
} from '../lib/geldDb';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: ClothingProject[];
  investments: UserInvestment[];
  transactions: TransactionRequest[];
  currentView: AppView;
  dashboardTab: DashboardTab;
  adminTab: AdminTab;
  isTopUpModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  selectedProjectForInvest: ClothingProject | null;
  toasts: ToastMessage[];
  simulatedDay: number;
  loading: boolean;

  setCurrentView: (view: AppView) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setIsTopUpModalOpen: (open: boolean) => void;
  setIsWithdrawModalOpen: (open: boolean) => void;
  setSelectedProjectForInvest: (project: ClothingProject | null) => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  dismissToast: (id: string) => void;

  signIn: (username: string, password?: string) => Promise<boolean>;
  signUp: (fullName: string, username: string, password?: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;

  submitTopUpRequest: (operator: NetworkOperator, phoneNumber: string, amount: number) => Promise<boolean>;
  submitWithdrawRequest: (operator: NetworkOperator, phoneNumber: string, amount: number) => Promise<{ success: boolean; error?: string }>;

  investInProject: (projectId: string, amount: number, lockupDays?: number) => Promise<{ success: boolean; error?: string }>;
  advanceSimulationDay: () => Promise<void>;

  approveTransaction: (transactionId: string) => Promise<void>;
  rejectTransaction: (transactionId: string, reason?: string) => Promise<void>;
  createClothingProject: (projectData: Omit<ClothingProject, 'id' | 'raisedAmount' | 'investorsCount' | 'status'>) => Promise<void>;
  updateUserBalanceDirect: (userId: string, newBalance: number) => Promise<void>;

  claimDailyReward: () => Promise<{ success: boolean; error?: string; newBalance?: number }>;

  referralRewardAmount: number;
  signupBonusAmount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const claimingUsers = new Set<string>();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ClothingProject[]>(INITIAL_PROJECTS);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        sessionStorage.setItem(REFERRAL_SIGNUP_STORAGE_KEY, ref);
      }
      if (window.location.pathname.includes('/signup') || ref) {
        return 'signup';
      }
    } catch {
      // ignore
    }
    return 'landing';
  });
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedProjectForInvest, setSelectedProjectForInvest] = useState<ClothingProject | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [simulatedDay, setSimulatedDay] = useState<number>(() => {
    const saved = localStorage.getItem('threadinvest_sim_day_ugx');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [loading, setLoading] = useState(true);

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadUserData = async (userId: string) => {
    const [profile, userInvestments, allTxs, allProfiles] = await Promise.all([
      getCurrentProfile(),
      getUserInvestments(userId),
      getAllTransactions(),
      getAllProfiles(),
    ]);

    if (profile) {
      setCurrentUser(profile);
    }
    setInvestments(userInvestments);
    setTransactions(allTxs);
    setUsers(allProfiles);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allProjects, allInvestments, allTransactions, allProfiles] = await Promise.all([
        getAllProjects(),
        getAllInvestments(),
        getAllTransactions(),
        getAllProfiles(),
      ]);
      setProjects(allProjects.length > 0 ? allProjects : INITIAL_PROJECTS);
      setInvestments(allInvestments);
      setTransactions(allTransactions);
      setUsers(allProfiles);

      if (localStorage.getItem('geld_admin_session') === 'true') {
        setCurrentUser(ADMIN_USER);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = allProfiles.find(p => p.id === session.user.id) || null;
          setCurrentUser(profile);
          if (profile) {
            const userInvestments = await getUserInvestments(profile.id);
            setInvestments(userInvestments);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await seedInitialProjects();
      if (!mounted) return;
      await loadAllData();
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (localStorage.getItem('geld_admin_session') === 'true') {
        setCurrentUser(ADMIN_USER);
        return;
      }
      if (event === 'SIGNED_IN' && session?.user) {
        const [allProfiles, allTxs] = await Promise.all([
          getAllProfiles(),
          getAllTransactions(),
        ]);
        const profile = allProfiles.find(p => p.id === session.user.id) || null;
        setCurrentUser(profile);
        if (profile) {
          const userInvestments = await getUserInvestments(profile.id);
          setInvestments(userInvestments);
          setTransactions(allTxs);
          setUsers(allProfiles);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setInvestments([]);
        setUsers([]);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const allProfiles = await getAllProfiles();
        const profile = allProfiles.find(p => p.id === session.user.id) || null;
        setCurrentUser(profile);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, _password?: string): Promise<boolean> => {
    const password = _password || '';
    const cleanU = username.trim().toLowerCase();
    const cleanP = password.trim().toLowerCase();

    if (cleanU === 'byte' && cleanP === 'byte') {
      localStorage.setItem('geld_admin_session', 'true');
      setCurrentUser(ADMIN_USER);
      const [allTxs, allProfiles] = await Promise.all([
        getAllTransactions(),
        getAllProfiles(),
      ]);
      setTransactions(allTxs);
      setUsers(allProfiles);
      setCurrentView('admin');
      showToast('success', 'Admin Portal Activated', 'Welcome System Administrator');
      return true;
    }

    const result = await signInWithUsername(username, password);
    if (result.user) {
      if (result.user.isAdmin) {
        localStorage.setItem('geld_admin_session', 'true');
      }
      setCurrentUser(result.user);
      const [userInvestments, allTxs, allProfiles] = await Promise.all([
        getUserInvestments(result.user.id),
        getAllTransactions(),
        getAllProfiles(),
      ]);
      setInvestments(userInvestments);
      setTransactions(allTxs);
      setUsers(allProfiles);
      if (result.user.isAdmin) {
        setCurrentView('admin');
        showToast('success', 'Admin Portal Activated', 'Welcome System Administrator');
      } else {
        setCurrentView('dashboard');
        showToast('success', 'Welcome Back!', `Signed in as ${result.user.fullName}`);
      }
      return true;
    }
    showToast('error', 'Sign In Failed', result.error || 'Invalid credentials');
    return false;
  };

  const signUp = async (fullName: string, username: string, password?: string, referralCode?: string): Promise<boolean> => {
    if (!password) {
      showToast('error', 'Password Required', 'Please enter a password.');
      return false;
    }

    const result = await signUpWithUsername(fullName, username, password, referralCode);
    if (result.user) {
      setCurrentUser(result.user);
      setInvestments([]);
      const bonusTx: TransactionRequest = {
        id: `tx-bonus-${Date.now()}`,
        userId: result.user.id,
        userName: result.user.fullName,
        userUsername: result.user.username,
        type: 'signup_bonus',
        amount: SIGNUP_BONUS_UGX,
        status: 'approved',
        createdAt: new Date().toLocaleString(),
        notes: 'Welcome signup bonus — first-time account credit',
        referenceId: `BONUS-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAtTimestamp: Date.now(),
      };
      setTransactions(prev => [bonusTx, ...prev]);
      setUsers(prev => [...prev.filter(u => u.id !== result.user!.id), result.user!]);
      setCurrentView('dashboard');
      showToast(
        'success',
        'Account Created!',
        `Welcome to Geld, ${result.user.fullName}! ${formatUGX(SIGNUP_BONUS_UGX)} signup bonus added to your wallet. Your referral code: ${result.user.referralCode}`
      );
      return true;
    }
    showToast('error', 'Sign Up Failed', result.error || 'Could not create account');
    return false;
  };

  const logout = async () => {
    localStorage.removeItem('geld_admin_session');
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('info', 'Logged Out', 'You have been signed out.');
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast('info', 'Switched User', `Now viewing as ${found.fullName}`);
    }
  };

  const submitTopUpRequest = async (operator: NetworkOperator, phoneNumber: string, amount: number): Promise<boolean> => {
    if (!currentUser) return false;
    if (amount <= 0 || isNaN(amount)) {
      showToast('error', 'Invalid Amount', 'Please enter a valid deposit amount greater than UGX 0.');
      return false;
    }

    const now = Date.now();
    const newReq: TransactionRequest = {
      id: `tx-${now}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userUsername: currentUser.username,
      type: 'topup',
      operator,
      phoneNumber: phoneNumber.trim(),
      amount,
      status: 'pending',
      createdAt: new Date(now).toLocaleString(),
      referenceId: `REQ-${operator.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAtTimestamp: now,
    };

    const saved = await createTransaction(newReq);
    const updatedTx = [saved || newReq, ...transactions];
    setTransactions(updatedTx);
    await saveUserTransactions(currentUser.id, updatedTx);

    setIsTopUpModalOpen(false);
    showToast(
      'info',
      'Top-Up Request Submitted',
      `Your request for ${formatUGX(amount)} via ${operator} (${phoneNumber}) is Pending Admin Approval. Balance will update once approved.`
    );
    return true;
  };

  const submitWithdrawRequest = async (
    operator: NetworkOperator,
    phoneNumber: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'User not logged in' };
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: 'Please enter a valid amount greater than UGX 0.' };
    }
    if (amount > currentUser.balance) {
      return { success: false, error: `Insufficient available balance (${formatUGX(currentUser.balance)}).` };
    }

    const now = Date.now();
    const newReq: TransactionRequest = {
      id: `tx-${now}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userUsername: currentUser.username,
      type: 'withdraw',
      operator,
      phoneNumber: phoneNumber.trim(),
      amount,
      status: 'pending',
      createdAt: new Date(now).toLocaleString(),
      referenceId: `REQ-${operator.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAtTimestamp: now,
    };

    const saved = await createTransaction(newReq);
    const updatedTx = [saved || newReq, ...transactions];
    setTransactions(updatedTx);
    await saveUserTransactions(currentUser.id, updatedTx);

    setIsWithdrawModalOpen(false);
    showToast(
      'info',
      'Withdrawal Request Submitted',
      `Your payout request for ${formatUGX(amount)} to ${operator} (${phoneNumber}) is Pending Admin Approval.`
    );
    return { success: true };
  };

  const claimDailyReward = async (): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
    if (!currentUser) {
      return { success: false, error: 'You must be signed in to claim a reward.' };
    }
    if (claimingUsers.has(currentUser.id)) {
      return { success: false, error: 'Reward claim is already being processed.' };
    }

    const now = Date.now();
    const last = currentUser.lastDailyRewardClaim ?? 0;
    if (last > 0 && (now - last) < DAILY_REWARD_COOLDOWN_MS) {
      const remaining = DAILY_REWARD_COOLDOWN_MS - (now - last);
      return {
        success: false,
        error: `Next reward available in ${formatDuration(remaining)}`
      };
    }

    claimingUsers.add(currentUser.id);
    try {
      const newBalance = (currentUser.balance || 0) + DAILY_REWARD_UGX;
      await updateUserBalanceDirect(currentUser.id, newBalance);

      try {
        await supabase
          .from('geld_profiles')
          .update({ last_daily_reward_claim: now, updated_at: new Date().toISOString() })
          .eq('id', currentUser.id);
      } catch {
        // ignore
      }

      setCurrentUser(prev => prev ? { ...prev, balance: newBalance, lastDailyRewardClaim: now } : null);

      const newTx: TransactionRequest = {
        id: `tx-daily-${now}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userUsername: currentUser.username,
        type: 'daily_reward',
        amount: DAILY_REWARD_UGX,
        status: 'approved',
        createdAt: new Date(now).toLocaleString(),
        createdAtTimestamp: now,
        notes: `Daily reward (${DAILY_REWARD_WINDOW_LABEL})`,
        referenceId: `DAILY-${Math.floor(10000 + Math.random() * 90000)}`
      };

      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);
      await saveUserTransactions(currentUser.id, updatedTx);

      showToast(
        'success',
        'Daily Reward Claimed! 🎉',
        `${formatUGX(DAILY_REWARD_UGX)} added to your wallet.`
      );
      return { success: true, newBalance };
    } finally {
      claimingUsers.delete(currentUser.id);
    }
  };

  const investInProject = async (
    projectId: string,
    amount: number,
    lockupDays = 14
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      setCurrentView('signup');
      return { success: false, error: 'Please sign up or sign in first to invest.' };
    }
    const project = projects.find(p => p.id === projectId) || INITIAL_PROJECTS.find(p => p.id === projectId);
    if (!project) return { success: false, error: 'Project not found' };

    if (amount < project.minStake) {
      return { success: false, error: `Minimum stake for this project is ${formatUGX(project.minStake)}.` };
    }
    if (amount > currentUser.balance) {
      return { success: false, error: `Insufficient balance (${formatUGX(currentUser.balance)}). Please top up first.` };
    }

    const now = Date.now();
    const investmentId = `inv-${now}`;
    const expectedReturnAmount = Math.round(amount * (project.expectedReturnRate / 100));
    const dailyRate = Number((project.expectedReturnRate / lockupDays).toFixed(1)) || 7.1;
    const newBalance = currentUser.balance - amount;

    try {
      // 1. Deduct user balance in database
      await updateUserBalanceDirect(currentUser.id, newBalance);

      // 2. Construct persistent UserInvestment object
      const newInvestment: UserInvestment = {
        id: investmentId,
        userId: currentUser.id,
        projectId: project.id,
        projectTitle: project.title,
        projectCategory: project.category,
        projectImageUrl: project.imageUrl,
        amountInvested: amount,
        expectedReturnRate: project.expectedReturnRate,
        expectedReturnAmount,
        lockupDaysTotal: lockupDays,
        daysElapsed: 0,
        daysCredited: 0,
        dailyIncrementRate: dailyRate,
        progressPercentage: 0,
        startDate: new Date(now).toISOString().split('T')[0],
        maturityDate: new Date(now + lockupDays * 86400000).toISOString().split('T')[0],
        status: 'active',
        periodLabel: project.periodLabel || `${lockupDays} Days Lockup (${dailyRate}% Daily)`,
        createdAtTimestamp: now,
      };

      // 3. Construct transaction entry
      const txRecord: TransactionRequest = {
        id: investmentId,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userUsername: currentUser.username,
        type: 'investment',
        amount,
        status: 'approved',
        createdAt: new Date(now).toLocaleString(),
        processedAt: new Date(now).toLocaleString(),
        notes: `${project.title} Stake (${dailyRate}% Daily Return)`,
        referenceId: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAtTimestamp: now,
      };

      const updatedInvestments = [newInvestment, ...investments];
      const updatedTransactions = [txRecord, ...transactions];

      setInvestments(updatedInvestments);
      setTransactions(updatedTransactions);
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);

      // Update project raisedAmount and investorsCount in state
      setProjects(prev => prev.map(p => {
        if (p.id === project.id) {
          const raisedAmount = p.raisedAmount + amount;
          return {
            ...p,
            raisedAmount,
            investorsCount: p.investorsCount + 1,
            status: raisedAmount >= p.targetGoal ? 'funded' : p.status,
          };
        }
        return p;
      }));

      // 4. Save to Supabase cloud to persist across all devices & sessions
      await Promise.all([
        saveUserInvestments(currentUser.id, updatedInvestments),
        saveUserTransactions(currentUser.id, updatedTransactions),
      ]);

      setSelectedProjectForInvest(null);
      showToast(
        'success',
        'Investment Confirmed!',
        `Successfully invested ${formatUGX(amount)} in ${project.title}. You will earn ${dailyRate}% (${formatUGX(Math.round(amount * (dailyRate / 100)))}) credited directly to your wallet every 24 hours!`
      );

      return { success: true };
    } catch (err) {
      console.error('Investment failed:', err);
      return { success: false, error: 'Investment failed. Please try again.' };
    }
  };

  useEffect(() => {
    const DAY_MS = 24 * 60 * 60 * 1000;

    const updateProgress = async () => {
      if (!currentUser) return;
      const now = Date.now();
      let hasUpdates = false;
      const updatedInvestments = [...investments];
      const newTransactions: TransactionRequest[] = [];
      const notificationMessages: string[] = [];
      let totalDailyReturnsToCredit = 0;
      let totalPrincipalRefund = 0;

      for (let i = 0; i < updatedInvestments.length; i++) {
        const inv = updatedInvestments[i];
        if (inv.status !== 'active' || inv.userId !== currentUser.id) continue;

        const createdTime = inv.createdAtTimestamp || (inv.startDate ? new Date(inv.startDate).getTime() : now);
        const msPassed = Math.max(0, now - createdTime);
        const full24hDaysElapsed = Math.floor(msPassed / DAY_MS);
        const daysElapsed = Math.min(inv.lockupDaysTotal, full24hDaysElapsed);
        const progressPercentage = Math.min(100, Math.round((daysElapsed / inv.lockupDaysTotal) * 100));
        const isMatured = daysElapsed >= inv.lockupDaysTotal;
        const currentCredited = inv.daysCredited || 0;
        const uncreditedDays = Math.max(0, daysElapsed - currentCredited);

        if (
          daysElapsed !== inv.daysElapsed ||
          progressPercentage !== inv.progressPercentage ||
          uncreditedDays > 0 ||
          (isMatured && inv.status === 'active')
        ) {
          hasUpdates = true;

          if (uncreditedDays > 0) {
            const dailyRateFraction = (inv.dailyIncrementRate || 7.1) / 100;
            const dailyYieldAmount = uncreditedDays * Math.round(inv.amountInvested * dailyRateFraction);
            totalDailyReturnsToCredit += dailyYieldAmount;

            newTransactions.push({
              id: `tx-daily-${inv.id}-${daysElapsed}-${Date.now()}`,
              userId: inv.userId,
              userName: currentUser.fullName,
              userUsername: currentUser.username,
              type: 'return_payout',
              amount: dailyYieldAmount,
              status: 'approved',
              createdAt: new Date().toLocaleString(),
              createdAtTimestamp: Date.now(),
              notes: `Daily Return (+${inv.dailyIncrementRate || 7.1}% for Day ${daysElapsed} on ${inv.projectTitle})`,
              referenceId: `RET-${Math.floor(10000 + Math.random() * 90000)}`
            });

            notificationMessages.push(
              `+${formatUGX(dailyYieldAmount)} (${inv.dailyIncrementRate || 7.1}% daily return for ${inv.projectTitle}) credited to your wallet!`
            );
          }

          if (isMatured && inv.status === 'active') {
            totalPrincipalRefund += inv.amountInvested;

            newTransactions.push({
              id: `tx-matured-${inv.id}-${Date.now()}`,
              userId: inv.userId,
              userName: currentUser.fullName,
              userUsername: currentUser.username,
              type: 'return_payout',
              amount: inv.amountInvested,
              status: 'approved',
              createdAt: new Date().toLocaleString(),
              createdAtTimestamp: Date.now(),
              notes: `Principal Unlocked (${inv.projectTitle} lockup completed)`,
              referenceId: `PRI-${Math.floor(10000 + Math.random() * 90000)}`
            });
          }

          updatedInvestments[i] = {
            ...inv,
            createdAtTimestamp: createdTime,
            daysElapsed,
            daysCredited: daysElapsed,
            progressPercentage,
            status: isMatured ? 'completed' : 'active'
          };
        }
      }

      if (hasUpdates) {
        setInvestments(updatedInvestments);

        const totalCredit = totalDailyReturnsToCredit + totalPrincipalRefund;
        const newBalance = currentUser.balance + totalCredit;
        if (totalCredit > 0) {
          setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
          await updateUserBalanceDirect(currentUser.id, newBalance);

          if (newTransactions.length > 0) {
            const allTx = [...newTransactions, ...transactions];
            setTransactions(allTx);
            await saveUserTransactions(currentUser.id, allTx);
          }

          await saveUserInvestments(currentUser.id, updatedInvestments);

          if (totalPrincipalRefund > 0) {
            showToast(
              'success',
              'Investment Matured! 🎉',
              `Lockup period completed! Principal of ${formatUGX(totalPrincipalRefund)} unlocked and daily returns credited to your wallet.`
            );
          } else if (notificationMessages.length > 0) {
            showToast(
              'success',
              'Daily Return Credited 📈',
              notificationMessages.join(' | ')
            );
          }
        } else {
          await saveUserInvestments(currentUser.id, updatedInvestments);
        }
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 10000);
    return () => clearInterval(interval);
  }, [currentUser, investments, transactions]);

  const advanceSimulationDay = async () => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const nextSimDay = simulatedDay + 1;
    setSimulatedDay(nextSimDay);
    localStorage.setItem('threadinvest_sim_day_ugx', nextSimDay.toString());

    if (!currentUser) return;

    let totalDailyReturnsToCredit = 0;
    let totalPrincipalRefund = 0;
    const newTransactions: TransactionRequest[] = [];
    const updatedInvestments = [...investments];

    for (let i = 0; i < updatedInvestments.length; i++) {
      const inv = updatedInvestments[i];
      if (inv.status !== 'active' || inv.userId !== currentUser.id) continue;

      const updatedCreatedTime = (inv.createdAtTimestamp || Date.now()) - DAY_MS;
      const nextDaysElapsed = Math.min(inv.lockupDaysTotal, inv.daysElapsed + 1);
      const nextProgress = Math.min(100, Math.round((nextDaysElapsed / inv.lockupDaysTotal) * 100));
      const isMatured = nextDaysElapsed >= inv.lockupDaysTotal;
      const currentCredited = inv.daysCredited || 0;
      const uncreditedDays = Math.max(0, nextDaysElapsed - currentCredited);

      if (uncreditedDays > 0) {
        const dailyRateFraction = (inv.dailyIncrementRate || 7.1) / 100;
        const dailyYieldAmount = uncreditedDays * Math.round(inv.amountInvested * dailyRateFraction);
        totalDailyReturnsToCredit += dailyYieldAmount;

        newTransactions.push({
          id: `tx-daily-${inv.id}-${nextDaysElapsed}-${Date.now()}`,
          userId: inv.userId,
          userName: currentUser.fullName,
          userUsername: currentUser.username,
          type: 'return_payout',
          amount: dailyYieldAmount,
          status: 'approved',
          createdAt: new Date().toLocaleString(),
          createdAtTimestamp: Date.now(),
          notes: `Daily Return (+${inv.dailyIncrementRate || 7.1}% for Day ${nextDaysElapsed} on ${inv.projectTitle})`,
          referenceId: `RET-${Math.floor(10000 + Math.random() * 90000)}`
        });
      }

      if (isMatured) {
        totalPrincipalRefund += inv.amountInvested;

        newTransactions.push({
          id: `tx-matured-${inv.id}-${Date.now()}`,
          userId: inv.userId,
          userName: currentUser.fullName,
          userUsername: currentUser.username,
          type: 'return_payout',
          amount: inv.amountInvested,
          status: 'approved',
          createdAt: new Date().toLocaleString(),
          createdAtTimestamp: Date.now(),
          notes: `Principal Unlocked (${inv.projectTitle} lockup completed)`,
          referenceId: `PRI-${Math.floor(10000 + Math.random() * 90000)}`
        });
      }

      updatedInvestments[i] = {
        ...inv,
        createdAtTimestamp: updatedCreatedTime,
        daysElapsed: nextDaysElapsed,
        daysCredited: nextDaysElapsed,
        progressPercentage: nextProgress,
        status: isMatured ? 'completed' : 'active'
      };
    }

    const totalCredit = totalDailyReturnsToCredit + totalPrincipalRefund;
    if (totalCredit > 0) {
      const newBalance = currentUser.balance + totalCredit;
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
      setInvestments(updatedInvestments);
      await updateUserBalanceDirect(currentUser.id, newBalance);

      const allTx = newTransactions.length > 0 ? [...newTransactions, ...transactions] : transactions;
      if (newTransactions.length > 0) {
        setTransactions(allTx);
      }

      await Promise.all([
        saveUserInvestments(currentUser.id, updatedInvestments),
        saveUserTransactions(currentUser.id, allTx),
      ]);

      if (totalPrincipalRefund > 0) {
        showToast(
          'success',
          'Investment Matured! 🎉',
          `Lockup completed! Principal of ${formatUGX(totalPrincipalRefund)} returned and daily returns credited.`
        );
      } else {
        showToast(
          'success',
          'Day Elapsed (+Yield Credited) 📈',
          `24h cycle elapsed: +${formatUGX(totalDailyReturnsToCredit)} credited to your wallet balance!`
        );
      }
    } else {
      setInvestments(updatedInvestments);
      await saveUserInvestments(currentUser.id, updatedInvestments);
      showToast(
        'info',
        'Fast-Forwarded 24 Hours (+1 Day)',
        '24 hours elapsed. Progress updated.'
      );
    }
  };

 const approveTransaction = async (transactionId: string) => {
  const tx = transactions.find(t => t.id === transactionId);
  if (!tx || tx.status !== 'pending') return;

  try {
    if (tx.type === 'topup') {
      const { error } = await supabase.rpc('approve_topup', {
        p_tx_id: transactionId
      });

      if (error) throw error;
    } else if (tx.type === 'withdraw') {
      const { error } = await supabase.rpc('approve_withdraw', {
        p_tx_id: transactionId
      });

      if (error) throw error;
    }

    showToast(
      'success',
      'Transaction Approved ✅',
      `Approved ${tx.type === 'topup' ? 'Top-Up' : 'Withdrawal'} of ${formatUGX(tx.amount)} for ${tx.userName}.`
    );
  } catch (err) {
    console.error('Approve failed:', err);
    showToast('error', 'Approval Failed', 'Could not approve transaction.');
  }
};

  const rejectTransaction = async (transactionId: string, reason?: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    try {
      try {
        await supabase.rpc('reject_transaction', {
          p_tx_id: transactionId,
          p_reason: reason || 'Declined by Admin review'
        });
      } catch {
        // ignore missing RPC
      }

      const processedAt = new Date().toLocaleString();
      const updatedTxList = transactions.map(t => {
        if (t.id === transactionId) {
          return {
            ...t,
            status: 'rejected' as const,
            notes: reason || 'Declined by Admin review',
            processedAt,
          };
        }
        return t;
      });

      setTransactions(updatedTxList);
      await saveUserTransactions(tx.userId, updatedTxList);

      showToast(
        'warning',
        'Transaction Rejected',
        `Rejected ${tx.type} request of ${formatUGX(tx.amount)} for ${tx.userName}. No balance change was made.`
      );
    } catch (err) {
      console.error('Reject failed:', err);
      showToast('error', 'Rejection Failed', 'Could not reject transaction.');
    }
  };

  const createClothingProject = async (
    projectData: Omit<ClothingProject, 'id' | 'raisedAmount' | 'investorsCount' | 'status'>
  ) => {
    const saved = await createProject(projectData);
    if (saved) {
      setProjects(prev => [saved, ...prev]);
      showToast('success', 'Project Published! 🚀', `"${saved.title}" is now live on Geld.`);
    } else {
      showToast('error', 'Publish Failed', 'Could not create project.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        investments,
        transactions,
        currentView,
        dashboardTab,
        adminTab,
        isTopUpModalOpen,
        isWithdrawModalOpen,
        selectedProjectForInvest,
        toasts,
        simulatedDay,
        loading,
        setCurrentView,
        setDashboardTab,
        setAdminTab,
        setIsTopUpModalOpen,
        setIsWithdrawModalOpen,
        setSelectedProjectForInvest,
        showToast,
        dismissToast,
        signIn,
        signUp,
        logout,
        switchUser,
        submitTopUpRequest,
        submitWithdrawRequest,
        investInProject,
        advanceSimulationDay,
        approveTransaction,
        rejectTransaction,
        createClothingProject,
        updateUserBalanceDirect,
        claimDailyReward,
        referralRewardAmount: REFERRAL_REWARD_UGX,
        signupBonusAmount: SIGNUP_BONUS_UGX
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
