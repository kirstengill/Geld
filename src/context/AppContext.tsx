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
import { 
  INITIAL_USERS, 
  INITIAL_PROJECTS, 
  INITIAL_INVESTMENTS, 
  INITIAL_TRANSACTIONS 
} from '../mockData';
import { formatUGX } from '../utils/format';

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
  
  // Navigation & Modals
  setCurrentView: (view: AppView) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setIsTopUpModalOpen: (open: boolean) => void;
  setIsWithdrawModalOpen: (open: boolean) => void;
  setSelectedProjectForInvest: (project: ClothingProject | null) => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  dismissToast: (id: string) => void;
  
  // Auth
  signIn: (username: string, password?: string) => boolean;
  signUp: (fullName: string, username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  
  // Wallet / Transactions
  submitTopUpRequest: (operator: NetworkOperator, phoneNumber: string, amount: number) => boolean;
  submitWithdrawRequest: (operator: NetworkOperator, phoneNumber: string, amount: number) => { success: boolean; error?: string };
  
  // Investments
  investInProject: (projectId: string, amount: number, lockupDays?: number) => { success: boolean; error?: string };
  advanceSimulationDay: () => void;
  
  // Admin Actions
  approveTransaction: (transactionId: string) => void;
  rejectTransaction: (transactionId: string, reason?: string) => void;
  createClothingProject: (projectData: Omit<ClothingProject, 'id' | 'raisedAmount' | 'investorsCount' | 'status'>) => void;
  updateUserBalanceDirect: (userId: string, newBalance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or clean defaults (all mock users removed)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('threadinvest_users_ugx_v2');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [projects, setProjects] = useState<ClothingProject[]>(() => {
    const saved = localStorage.getItem('threadinvest_projects_ugx_v2');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [investments, setInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('threadinvest_investments_ugx_v2');
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<TransactionRequest[]>(() => {
    const saved = localStorage.getItem('threadinvest_transactions_ugx_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [simulatedDay, setSimulatedDay] = useState<number>(() => {
    const saved = localStorage.getItem('threadinvest_sim_day_ugx');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedProjectForInvest, setSelectedProjectForInvest] = useState<ClothingProject | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('threadinvest_users_ugx_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('threadinvest_current_user_id_ugx_v2', currentUserId);
    } else {
      localStorage.removeItem('threadinvest_current_user_id_ugx_v2');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('threadinvest_projects_ugx_v2', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('threadinvest_investments_ugx_v2', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('threadinvest_transactions_ugx_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('threadinvest_sim_day_ugx', simulatedDay.toString());
  }, [simulatedDay]);

  const currentUser = users.find(u => u.id === currentUserId) || null;

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

  // Auth Methods: Only registered/signed-up users can sign in
  const signIn = (username: string, password?: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    const matchedUser = users.find(
      u => u.username.toLowerCase() === cleanUsername
    );

    // If user has not signed up, strictly block access
    if (!matchedUser) {
      showToast(
        'error',
        'Account Not Found',
        `No account found with username "${username.trim()}". You must sign up first before logging in.`
      );
      return false;
    }

    // Verify password if user has a password registered
    if (matchedUser.password && matchedUser.password !== cleanPassword) {
      showToast(
        'error',
        'Incorrect Password',
        'The password entered is incorrect. Please check your credentials and try again.'
      );
      return false;
    }

    setCurrentUserId(matchedUser.id);
    setCurrentView('dashboard');
    showToast('success', 'Welcome Back!', `Signed in as ${matchedUser.fullName}`);
    return true;
  };

  const signUp = (fullName: string, username: string, password?: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      showToast('error', 'Username Taken', 'An account with this username already exists. Please sign in or choose another username.');
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      username: cleanUsername,
      password: password ? password.trim() : undefined,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      balance: 0, // Initial balance 0 UGX
      joinedDate: new Date().toISOString().split('T')[0],
      email: `${cleanUsername}@threadinvest.io`
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setCurrentView('dashboard');
    showToast('success', 'Account Created!', `Welcome to ThreadInvest, ${newUser.fullName}! Balance: ${formatUGX(0)}. Top up via MTN or Airtel Money to start investing.`);
    return true;
  };

  const logout = () => {
    setCurrentUserId(null);
    setCurrentView('landing');
    showToast('info', 'Logged Out', 'You have been signed out.');
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      showToast('info', 'Switched User', `Now viewing as ${found.fullName}`);
    }
  };

  // Wallet Methods
  const submitTopUpRequest = (operator: NetworkOperator, phoneNumber: string, amount: number): boolean => {
    if (!currentUser) return false;
    if (amount <= 0 || isNaN(amount)) {
      showToast('error', 'Invalid Amount', 'Please enter a valid deposit amount greater than UGX 0.');
      return false;
    }

    const newReq: TransactionRequest = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userUsername: currentUser.username,
      type: 'topup',
      operator,
      phoneNumber: phoneNumber.trim(),
      amount,
      status: 'pending',
      createdAt: new Date().toLocaleString(),
      referenceId: `REQ-${operator.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`
    };

    setTransactions(prev => [newReq, ...prev]);
    setIsTopUpModalOpen(false);
    showToast(
      'info', 
      'Top-Up Request Submitted', 
      `Your request for ${formatUGX(amount)} via ${operator} (${phoneNumber}) is Pending Admin Approval. Balance will update once approved.`
    );
    return true;
  };

  const submitWithdrawRequest = (
    operator: NetworkOperator, 
    phoneNumber: string, 
    amount: number
  ): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'User not logged in' };
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: 'Please enter a valid amount greater than UGX 0.' };
    }
    if (amount > currentUser.balance) {
      return { success: false, error: `Insufficient available balance (${formatUGX(currentUser.balance)}).` };
    }

    const newReq: TransactionRequest = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userUsername: currentUser.username,
      type: 'withdraw',
      operator,
      phoneNumber: phoneNumber.trim(),
      amount,
      status: 'pending',
      createdAt: new Date().toLocaleString(),
      referenceId: `REQ-${operator.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`
    };

    setTransactions(prev => [newReq, ...prev]);
    setIsWithdrawModalOpen(false);
    showToast(
      'info', 
      'Withdrawal Request Submitted', 
      `Your payout request for ${formatUGX(amount)} to ${operator} (${phoneNumber}) is Pending Admin Approval.`
    );
    return { success: true };
  };

  // Investment Methods
  const investInProject = (
    projectId: string, 
    amount: number, 
    lockupDays = 14
  ): { success: boolean; error?: string } => {
    if (!currentUser) {
      setCurrentView('signup');
      return { success: false, error: 'Please sign up or sign in first to invest.' };
    }
    const project = projects.find(p => p.id === projectId);
    if (!project) return { success: false, error: 'Project not found' };

    if (amount < project.minStake) {
      return { success: false, error: `Minimum stake for this project is ${formatUGX(project.minStake)}.` };
    }
    if (amount > currentUser.balance) {
      return { success: false, error: `Insufficient balance (${formatUGX(currentUser.balance)}). Please top up first.` };
    }

    // Deduct user balance immediately for investment
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, balance: Math.max(0, u.balance - amount) };
      }
      return u;
    }));

    // Update project raised amount
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newRaised = p.raisedAmount + amount;
        return {
          ...p,
          raisedAmount: newRaised,
          investorsCount: p.investorsCount + 1,
          status: newRaised >= p.targetGoal ? 'funded' : 'active'
        };
      }
      return p;
    }));

    const now = Date.now();
    const expectedReturnAmount = Math.round(amount * 1.0); // 7.1% daily * 14 days = ~100% total return
    const dailyRate = 7.1; // 7.1% daily return credited every 24 hours

    const newInvestment: UserInvestment = {
      id: `inv-${now}`,
      userId: currentUser.id,
      projectId: project.id,
      projectTitle: project.title,
      projectCategory: project.category,
      projectImageUrl: project.imageUrl,
      amountInvested: amount,
      expectedReturnRate: 100.0,
      expectedReturnAmount,
      lockupDaysTotal: lockupDays,
      daysElapsed: 0,
      daysCredited: 0,
      dailyIncrementRate: dailyRate,
      progressPercentage: 0,
      startDate: new Date(now).toISOString().split('T')[0],
      maturityDate: new Date(now + lockupDays * 86400000).toISOString().split('T')[0],
      status: 'active',
      periodLabel: `${lockupDays} Days Lockup (7.1% Daily)`,
      createdAtTimestamp: now
    };

    setInvestments(prev => [newInvestment, ...prev]);

    // Record investment transaction
    const txRecord: TransactionRequest = {
      id: `tx-${now}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userUsername: currentUser.username,
      type: 'investment',
      amount,
      status: 'approved',
      createdAt: new Date().toLocaleString(),
      processedAt: new Date().toLocaleString(),
      notes: `${project.title} Stake (7.1% Daily Return)`,
      referenceId: `INV-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setTransactions(prev => [txRecord, ...prev]);

    setSelectedProjectForInvest(null);
    showToast(
      'success',
      'Investment Confirmed!',
      `Successfully invested ${formatUGX(amount)} in ${project.title}. You will earn 7.1% (${formatUGX(Math.round(amount * 0.071))}) credited directly to your wallet every 24 hours!`
    );

    return { success: true };
  };

  // 24-Hour Progress Verification & Daily 7.1% Return Credit Engine
  // Automatically credits 7.1% daily return to user balance whenever each 24-hour cycle completes
  useEffect(() => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    const updateProgress = () => {
      const now = Date.now();
      let hasUpdates = false;
      let totalDailyReturnsToCredit = 0;
      let totalPrincipalRefund = 0;
      const newTransactions: TransactionRequest[] = [];
      const notificationMessages: string[] = [];

      setInvestments(prev => {
        const updated = prev.map(inv => {
          if (inv.status !== 'active') return inv;

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
            (isMatured && inv.status === 'active') ||
            !inv.createdAtTimestamp
          ) {
            hasUpdates = true;

            // Calculate 7.1% daily return for each uncredited day
            if (uncreditedDays > 0) {
              const dailyYieldAmount = uncreditedDays * Math.round(inv.amountInvested * 0.071);
              totalDailyReturnsToCredit += dailyYieldAmount;

              newTransactions.push({
                id: `tx-daily-${inv.id}-${daysElapsed}-${Date.now()}`,
                userId: inv.userId,
                userName: currentUser?.fullName || 'Investor',
                userUsername: currentUser?.username || 'investor',
                type: 'return_payout',
                amount: dailyYieldAmount,
                status: 'approved',
                createdAt: new Date().toLocaleString(),
                processedAt: new Date().toLocaleString(),
                notes: `Daily Return (+7.1% for Day ${daysElapsed} on ${inv.projectTitle})`,
                referenceId: `RET-${Math.floor(10000 + Math.random() * 90000)}`
              });

              notificationMessages.push(
                `+${formatUGX(dailyYieldAmount)} (7.1% daily return for ${inv.projectTitle}) credited to your wallet!`
              );
            }

            // If lockup period reached maturity, return principal
            if (isMatured && inv.status === 'active') {
              totalPrincipalRefund += inv.amountInvested;

              newTransactions.push({
                id: `tx-matured-${inv.id}-${Date.now()}`,
                userId: inv.userId,
                userName: currentUser?.fullName || 'Investor',
                userUsername: currentUser?.username || 'investor',
                type: 'return_payout',
                amount: inv.amountInvested,
                status: 'approved',
                createdAt: new Date().toLocaleString(),
                processedAt: new Date().toLocaleString(),
                notes: `Principal Unlocked (${inv.projectTitle} 14-day lockup completed)`,
                referenceId: `PRI-${Math.floor(10000 + Math.random() * 90000)}`
              });
            }

            return {
              ...inv,
              createdAtTimestamp: createdTime,
              daysElapsed,
              daysCredited: daysElapsed,
              dailyIncrementRate: 7.1,
              progressPercentage,
              status: isMatured ? ('completed' as const) : ('active' as const)
            };
          }
          return inv;
        });

        return hasUpdates ? updated : prev;
      });

      // Credit balance and record transactions
      const totalCredit = totalDailyReturnsToCredit + totalPrincipalRefund;
      if (totalCredit > 0 && currentUser) {
        setUsers(prev => prev.map(u => {
          if (u.id === currentUser.id) {
            return { ...u, balance: u.balance + totalCredit };
          }
          return u;
        }));

        if (newTransactions.length > 0) {
          setTransactions(prev => [...newTransactions, ...prev]);
        }

        if (totalPrincipalRefund > 0) {
          showToast(
            'success',
            'Investment Matured! 🎉',
            `Lockup period completed! Principal of ${formatUGX(totalPrincipalRefund)} unlocked and daily returns credited to your wallet.`
          );
        } else if (notificationMessages.length > 0) {
          showToast(
            'success',
            'Daily Return Credited (+7.1%) 📈',
            notificationMessages.join(' | ')
          );
        }
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Fast forward simulation helper: advances timestamp by exactly 24 hours & credits daily 7.1% return
  const advanceSimulationDay = () => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    setSimulatedDay(prev => prev + 1);

    let totalDailyReturnsToCredit = 0;
    let totalPrincipalRefund = 0;
    const newTransactions: TransactionRequest[] = [];

    setInvestments(prev => prev.map(inv => {
      if (inv.status !== 'active') return inv;

      const updatedCreatedTime = (inv.createdAtTimestamp || Date.now()) - DAY_MS;
      const nextDaysElapsed = Math.min(inv.lockupDaysTotal, inv.daysElapsed + 1);
      const nextProgress = Math.min(100, Math.round((nextDaysElapsed / inv.lockupDaysTotal) * 100));
      const isMatured = nextDaysElapsed >= inv.lockupDaysTotal;
      const currentCredited = inv.daysCredited || 0;
      const uncreditedDays = Math.max(0, nextDaysElapsed - currentCredited);

      if (uncreditedDays > 0) {
        const dailyYieldAmount = uncreditedDays * Math.round(inv.amountInvested * 0.071);
        totalDailyReturnsToCredit += dailyYieldAmount;

        newTransactions.push({
          id: `tx-daily-${inv.id}-${nextDaysElapsed}-${Date.now()}`,
          userId: inv.userId,
          userName: currentUser?.fullName || 'Investor',
          userUsername: currentUser?.username || 'investor',
          type: 'return_payout',
          amount: dailyYieldAmount,
          status: 'approved',
          createdAt: new Date().toLocaleString(),
          processedAt: new Date().toLocaleString(),
          notes: `Daily Return (+7.1% for Day ${nextDaysElapsed} on ${inv.projectTitle})`,
          referenceId: `RET-${Math.floor(10000 + Math.random() * 90000)}`
        });
      }

      if (isMatured) {
        totalPrincipalRefund += inv.amountInvested;

        newTransactions.push({
          id: `tx-matured-${inv.id}-${Date.now()}`,
          userId: inv.userId,
          userName: currentUser?.fullName || 'Investor',
          userUsername: currentUser?.username || 'investor',
          type: 'return_payout',
          amount: inv.amountInvested,
          status: 'approved',
          createdAt: new Date().toLocaleString(),
          processedAt: new Date().toLocaleString(),
          notes: `Principal Unlocked (${inv.projectTitle} 14-day lockup completed)`,
          referenceId: `PRI-${Math.floor(10000 + Math.random() * 90000)}`
        });
      }

      return {
        ...inv,
        createdAtTimestamp: updatedCreatedTime,
        daysElapsed: nextDaysElapsed,
        daysCredited: nextDaysElapsed,
        dailyIncrementRate: 7.1,
        progressPercentage: nextProgress,
        status: isMatured ? 'completed' : 'active'
      };
    }));

    const totalCredit = totalDailyReturnsToCredit + totalPrincipalRefund;
    if (totalCredit > 0 && currentUser) {
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, balance: u.balance + totalCredit };
        }
        return u;
      }));

      if (newTransactions.length > 0) {
        setTransactions(prev => [...newTransactions, ...prev]);
      }

      if (totalPrincipalRefund > 0) {
        showToast(
          'success', 
          'Investment Matured! 🎉', 
          `Lockup completed! Principal of ${formatUGX(totalPrincipalRefund)} returned and daily 2% returns credited.`
        );
      } else {
        showToast(
          'success', 
          'Day Elapsed (+2% Credited) 📈', 
          `24h cycle elapsed: +${formatUGX(totalDailyReturnsToCredit)} (2% daily return) credited to your wallet balance!`
        );
      }
    } else {
      showToast(
        'info', 
        'Fast-Forwarded 24 Hours (+1 Day)', 
        '24 hours elapsed. No active investments to credit.'
      );
    }
  };

  // Admin Actions
  const approveTransaction = (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    // Update transaction status
    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'approved',
          processedAt: new Date().toLocaleString()
        };
      }
      return t;
    }));

    // Auto-update user balance according to transaction type
    setUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        if (tx.type === 'topup') {
          return { ...u, balance: Math.round(u.balance + tx.amount) };
        } else if (tx.type === 'withdraw') {
          return { ...u, balance: Math.max(0, Math.round(u.balance - tx.amount)) };
        }
      }
      return u;
    }));

    showToast(
      'success',
      'Transaction Approved ✅',
      `Approved ${tx.type === 'topup' ? 'Top-Up' : 'Withdrawal'} of ${formatUGX(tx.amount)} for ${tx.userName}. User balance updated automatically!`
    );
  };

  const rejectTransaction = (transactionId: string, reason?: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'rejected',
          notes: reason || 'Declined by Admin review',
          processedAt: new Date().toLocaleString()
        };
      }
      return t;
    }));

    showToast(
      'warning',
      'Transaction Rejected',
      `Rejected ${tx.type} request of ${formatUGX(tx.amount)} for ${tx.userName}. No balance change was made.`
    );
  };

  const createClothingProject = (
    projectData: Omit<ClothingProject, 'id' | 'raisedAmount' | 'investorsCount' | 'status'>
  ) => {
    const newProject: ClothingProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      raisedAmount: 0,
      investorsCount: 0,
      status: 'active'
    };

    setProjects(prev => [newProject, ...prev]);
    showToast('success', 'Project Published! 🚀', `"${newProject.title}" is now live on ThreadInvest in UGX currency.`);
  };

  const updateUserBalanceDirect = (userId: string, newBalance: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, balance: Math.round(newBalance) };
      }
      return u;
    }));
    showToast('info', 'Balance Updated', `User balance modified to ${formatUGX(newBalance)}`);
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
        updateUserBalanceDirect
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
