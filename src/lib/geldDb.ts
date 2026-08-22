import { supabase, isSupabaseConfigured } from './supabase';
import type { User, ClothingProject, UserInvestment, TransactionRequest } from '../types';
import { INITIAL_PROJECTS } from '../mockData';

// Local storage keys for resilient offline / preview fallback
const STORAGE_PROFILES = 'geld_profiles_v1';
const STORAGE_PROJECTS = 'geld_projects_v1';
const STORAGE_INVESTMENTS = 'geld_investments_v1';
const STORAGE_TRANSACTIONS = 'geld_transactions_v1';
const STORAGE_AUTH_USER = 'geld_auth_user_v1';
const STORAGE_CREDENTIALS = 'geld_credentials_v1';

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Ensure initial local state is seeded
function initLocalStore() {
  const projects = getLocalItem<ClothingProject[]>(STORAGE_PROJECTS, []);
  if (projects.length === 0) {
    setLocalItem(STORAGE_PROJECTS, INITIAL_PROJECTS);
  }
}

initLocalStore();

function rowToUser(row: Record<string, unknown>): User {
  const username = ((row.username as string) || '').trim();
  const email = ((row.email as string) || '').trim();
  // Authorization is strictly driven by the database is_admin flag
  const isAdmin = Boolean(row.is_admin);

  return {
    id: row.id as string,
    fullName: (row.full_name as string) || (isAdmin ? 'Administrator' : 'User'),
    username: username || 'user',
    avatarUrl: (row.avatar_url as string) || undefined,
    balance: (row.balance as number) || 0,
    joinedDate: (row.joined_date as string) || new Date().toISOString().split('T')[0],
    email: email || undefined,
    referralCode: (row.referral_code as string) || undefined,
    referredBy: (row.referred_by as string) || undefined,
    signupBonusGiven: (row.signup_bonus_given as boolean) || false,
    lastDailyRewardClaim: (row.last_daily_reward_claim as number) || undefined,
    isAdmin,
  };
}

function rowToProject(row: Record<string, unknown>): ClothingProject {
  const gallery = Array.isArray(row.gallery_images)
    ? (row.gallery_images as string[])
    : row.image_url
      ? [row.image_url as string]
      : [];

  return {
    id: row.id as string,
    title: (row.title as string) || 'Clothing Drop',
    category: (row.category as ClothingProject['category']) || 'Streetwear',
    tagline: (row.tagline as string) || '',
    description: (row.description as string) || '',
    imageUrl: (row.image_url as string) || '',
    galleryImages: gallery.length > 0 ? gallery : [row.image_url as string || ''],
    targetGoal: Number(row.target_goal) || 20000000,
    raisedAmount: Number(row.raised_amount) || 0,
    minStake: Number(row.min_stake) || 10000,
    expectedReturnRate: Number(row.expected_return_rate) || 50,
    returnMultiplier: row.return_multiplier ? Number(row.return_multiplier) : undefined,
    lockupPeriodDays: Number(row.lockup_period_days) || 14,
    periodLabel: (row.period_label as string) || `${row.lockup_period_days || 14} Days Lockup`,
    status: (row.status as ClothingProject['status']) || 'active',
    daysLeft: Number(row.days_left) || 30,
    investorsCount: Number(row.investors_count) || 0,
    featured: Boolean(row.featured),
  };
}

function rowToInvestment(row: Record<string, unknown>): UserInvestment {
  const daysElapsed = Number(row.days_elapsed) || 0;
  const daysCredited = row.days_credited !== undefined && row.days_credited !== null 
    ? Number(row.days_credited) 
    : daysElapsed;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    projectId: row.project_id as string,
    projectTitle: row.project_title as string,
    projectCategory: row.project_category as string,
    projectImageUrl: row.project_image_url as string,
    amountInvested: Number(row.amount_invested) || 0,
    expectedReturnRate: Number(row.expected_return_rate) || 0,
    expectedReturnAmount: Number(row.expected_return_amount) || 0,
    lockupDaysTotal: Number(row.lockup_days_total) || 14,
    daysElapsed,
    dailyIncrementRate: Number(row.daily_increment_rate) || 0,
    progressPercentage: Number(row.progress_percentage) || 0,
    startDate: row.start_date as string,
    maturityDate: row.maturity_date as string,
    status: (row.status as UserInvestment['status']) || 'active',
    periodLabel: (row.period_label as string) || '',
    createdAtTimestamp: row.created_at_timestamp ? Number(row.created_at_timestamp) : (row.start_date ? new Date(row.start_date as string).getTime() : undefined),
    daysCredited,
  };
}

function rowToTransaction(row: Record<string, unknown>): TransactionRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    userUsername: row.user_username as string,
    type: row.type as TransactionRequest['type'],
    operator: (row.operator as TransactionRequest['operator']) || undefined,
    phoneNumber: (row.phone_number as string) || undefined,
    amount: row.amount as number,
    status: (row.status as TransactionRequest['status']) || 'pending',
    createdAt: row.created_at as string,
    processedAt: (row.processed_at as string) || undefined,
    notes: (row.notes as string) || undefined,
    referenceId: row.reference_id as string,
    createdAtTimestamp: (row.created_at_timestamp as number) || undefined,
  };
}

export async function getCurrentProfile(): Promise<User | null> {
  if (isSupabaseConfigured) {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        const { data, error } = await supabase
          .from('geld_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          const profile = rowToUser(data);
          // Supabase metadata or is_admin column authorization
          if (user.user_metadata?.is_admin || user.app_metadata?.is_admin) {
            profile.isAdmin = true;
          }
          // Sync to local cache
          const localProfiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
          const updated = [...localProfiles.filter(p => p.id !== profile.id), profile];
          setLocalItem(STORAGE_PROFILES, updated);
          return profile;
        }

        // Check if we have a locally cached profile for this user preserving their real balance
        const cachedProfiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
        const cached = cachedProfiles.find(p => p.id === user.id || (user.email && p.email?.toLowerCase() === user.email.toLowerCase()));
        if (cached) {
          if (user.user_metadata?.is_admin || user.app_metadata?.is_admin) {
            cached.isAdmin = true;
          }
          return cached;
        }

        // If user authenticated in Supabase but no profile record exists anywhere yet, synthesize from Supabase auth metadata
        const isAdmin = Boolean(
          user.user_metadata?.is_admin ||
          user.app_metadata?.is_admin
        );

        const syntheticProfile: User = {
          id: user.id,
          fullName: (user.user_metadata?.full_name as string) || (isAdmin ? 'Administrator' : 'User'),
          username: (user.user_metadata?.username as string) || (user.email?.split('@')[0]) || 'user',
          email: user.email,
          balance: isAdmin ? 1000000000 : 3500,
          joinedDate: new Date().toISOString().split('T')[0],
          referralCode: 'THREAD-INV',
          signupBonusGiven: true,
          isAdmin,
        };

        // Try creating the profile in Supabase in background
        try {
          await supabase.from('geld_profiles').upsert({
            id: syntheticProfile.id,
            full_name: syntheticProfile.fullName,
            username: syntheticProfile.username,
            email: syntheticProfile.email,
            balance: syntheticProfile.balance,
            joined_date: syntheticProfile.joinedDate,
            referral_code: syntheticProfile.referralCode,
            signup_bonus_given: true,
            is_admin: isAdmin,
          });
        } catch {
          // ignore
        }

        return syntheticProfile;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to local session
  const currentUserId = getLocalItem<string | null>(STORAGE_AUTH_USER, null);
  if (!currentUserId) return null;

  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  return profiles.find(p => p.id === currentUserId) || null;
}

export async function getAllProfiles(): Promise<User[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_profiles')
        .select('*')
        .order('joined_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(rowToUser);
      }
    } catch {
      // ignore
    }
  }

  return getLocalItem<User[]>(STORAGE_PROFILES, []);
}

export async function getProfileByUsername(username: string): Promise<User | null> {
  const clean = username.trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_profiles')
        .select('*')
        .eq('username', clean)
        .maybeSingle();

      if (!error && data) return rowToUser(data);
    } catch {
      // ignore
    }
  }

  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  return profiles.find(p => p.username.toLowerCase() === clean) || null;
}

export async function getProfileByEmail(email: string): Promise<User | null> {
  const clean = email.trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_profiles')
        .select('*')
        .eq('email', clean)
        .maybeSingle();

      if (!error && data) return rowToUser(data);
    } catch {
      // ignore
    }
  }

  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  return profiles.find(p => p.email?.toLowerCase() === clean) || null;
}

export async function getAllProjects(): Promise<ClothingProject[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(rowToProject);
      }
    } catch {
      // ignore
    }
  }

  return getLocalItem<ClothingProject[]>(STORAGE_PROJECTS, INITIAL_PROJECTS);
}

export async function createProject(
  project: Omit<ClothingProject, 'id' | 'raisedAmount' | 'investorsCount' | 'status'>
): Promise<ClothingProject | null> {
  const newProject: ClothingProject = {
    id: `proj-${Date.now()}`,
    ...project,
    raisedAmount: 0,
    investorsCount: 0,
    status: 'active',
  };

  if (isSupabaseConfigured) {
    try {
      const dbRow: Record<string, unknown> = {
        id: newProject.id,
        title: project.title,
        category: project.category,
        tagline: project.tagline,
        description: project.description,
        image_url: project.imageUrl,
        gallery_images: project.galleryImages,
        target_goal: project.targetGoal,
        raised_amount: 0,
        min_stake: project.minStake,
        expected_return_rate: project.expectedReturnRate,
        lockup_period_days: project.lockupPeriodDays,
        period_label: project.periodLabel,
        status: 'active',
        days_left: project.daysLeft,
        investors_count: 0,
        featured: project.featured || false,
      };

      const { data, error } = await supabase
        .from('geld_projects')
        .insert(dbRow)
        .select()
        .single();

      if (!error && data) {
        return rowToProject(data);
      }
    } catch {
      // ignore
    }
  }

  const existing = getLocalItem<ClothingProject[]>(STORAGE_PROJECTS, INITIAL_PROJECTS);
  const updated = [newProject, ...existing];
  setLocalItem(STORAGE_PROJECTS, updated);
  return newProject;
}

export async function updateExistingProject(
  project: ClothingProject
): Promise<ClothingProject | null> {
  if (isSupabaseConfigured) {
    try {
      const dbRow: Record<string, unknown> = {
        id: project.id,
        title: project.title,
        category: project.category,
        tagline: project.tagline,
        description: project.description,
        image_url: project.imageUrl,
        gallery_images: project.galleryImages && project.galleryImages.length > 0 ? project.galleryImages : [project.imageUrl],
        target_goal: project.targetGoal,
        raised_amount: project.raisedAmount,
        min_stake: project.minStake,
        expected_return_rate: project.expectedReturnRate,
        lockup_period_days: project.lockupPeriodDays,
        period_label: project.periodLabel,
        status: project.status,
        days_left: project.daysLeft,
        investors_count: project.investorsCount,
        featured: Boolean(project.featured),
      };

      const { data, error } = await supabase
        .from('geld_projects')
        .upsert(dbRow)
        .select()
        .single();

      if (!error && data) {
        const updatedProj = rowToProject(data);
        const existing = getLocalItem<ClothingProject[]>(STORAGE_PROJECTS, INITIAL_PROJECTS);
        const updatedList = existing.map(p => p.id === project.id ? updatedProj : p);
        if (!updatedList.some(p => p.id === project.id)) {
          updatedList.unshift(updatedProj);
        }
        setLocalItem(STORAGE_PROJECTS, updatedList);
        return updatedProj;
      }
    } catch {
      // ignore
    }
  }

  const existing = getLocalItem<ClothingProject[]>(STORAGE_PROJECTS, INITIAL_PROJECTS);
  const updatedList = existing.map(p => (p.id === project.id ? project : p));
  if (!updatedList.some(p => p.id === project.id)) {
    updatedList.unshift(project);
  }
  setLocalItem(STORAGE_PROJECTS, updatedList);
  return project;
}

export async function getUserInvestments(userId: string): Promise<UserInvestment[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId && user.user_metadata?.investments) {
        return user.user_metadata.investments as UserInvestment[];
      }

      const { data, error } = await supabase
        .from('geld_investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(rowToInvestment);
      }
    } catch {
      // ignore
    }
  }

  const all = getLocalItem<UserInvestment[]>(STORAGE_INVESTMENTS, []);
  return all.filter(inv => inv.userId === userId);
}

export async function saveUserInvestments(userId: string, investments: UserInvestment[]): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.updateUser({
        data: { investments },
      }).catch(() => {});

      try {
        await supabase.from('geld_investments').upsert(
          investments.map(inv => ({
            id: inv.id,
            user_id: userId,
            project_id: inv.projectId,
            project_title: inv.projectTitle,
            project_category: inv.projectCategory,
            project_image_url: inv.projectImageUrl,
            amount_invested: inv.amountInvested,
            expected_return_rate: inv.expectedReturnRate,
            expected_return_amount: inv.expectedReturnAmount,
            lockup_days_total: inv.lockupDaysTotal,
            days_elapsed: inv.daysElapsed,
            daily_increment_rate: inv.dailyIncrementRate,
            progress_percentage: inv.progressPercentage,
            start_date: inv.startDate,
            maturity_date: inv.maturityDate,
            status: inv.status,
            period_label: inv.periodLabel,
            created_at_timestamp: inv.createdAtTimestamp,
            days_credited: inv.daysCredited,
          }))
        );
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }

  const all = getLocalItem<UserInvestment[]>(STORAGE_INVESTMENTS, []);
  const other = all.filter(inv => inv.userId !== userId);
  setLocalItem(STORAGE_INVESTMENTS, [...investments, ...other]);
}

export async function getAllInvestments(): Promise<UserInvestment[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(rowToInvestment);
      }
    } catch {
      // ignore
    }
  }

  return getLocalItem<UserInvestment[]>(STORAGE_INVESTMENTS, []);
}

export async function getUserTransactions(userId: string): Promise<TransactionRequest[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at_timestamp', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(rowToTransaction);
      }
    } catch {
      // ignore
    }
  }

  const all = getLocalItem<TransactionRequest[]>(STORAGE_TRANSACTIONS, []);
  return all.filter(t => t.userId === userId);
}

export async function saveUserTransactions(userId: string, transactions: TransactionRequest[]): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      try {
        await supabase.from('geld_transactions').upsert(
          transactions.map(tx => ({
            id: tx.id,
            user_id: userId,
            user_name: tx.userName,
            user_username: tx.userUsername,
            type: tx.type,
            operator: tx.operator || null,
            phone_number: tx.phoneNumber || null,
            amount: tx.amount,
            status: tx.status,
            created_at: tx.createdAt,
            processed_at: tx.processedAt || null,
            notes: tx.notes || null,
            reference_id: tx.referenceId,
            created_at_timestamp: tx.createdAtTimestamp || Date.now(),
          }))
        );
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }

  const all = getLocalItem<TransactionRequest[]>(STORAGE_TRANSACTIONS, []);
  const other = all.filter(t => t.userId !== userId);
  setLocalItem(STORAGE_TRANSACTIONS, [...transactions, ...other]);
}

export async function getAllTransactions(): Promise<TransactionRequest[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_transactions')
        .select('*')
        .order('created_at_timestamp', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(rowToTransaction);
      }
    } catch {
      // ignore
    }
  }

  return getLocalItem<TransactionRequest[]>(STORAGE_TRANSACTIONS, []);
}

export async function createTransaction(tx: Omit<TransactionRequest, 'id'> & { id?: string }): Promise<TransactionRequest | null> {
  const transactionId = tx.id || `tx-${Date.now()}`;
  const fullTx: TransactionRequest = {
    id: transactionId,
    userId: tx.userId,
    userName: tx.userName,
    userUsername: tx.userUsername,
    type: tx.type,
    operator: tx.operator,
    phoneNumber: tx.phoneNumber,
    amount: tx.amount,
    status: tx.status,
    createdAt: tx.createdAt,
    processedAt: tx.processedAt,
    notes: tx.notes,
    referenceId: tx.referenceId,
    createdAtTimestamp: tx.createdAtTimestamp || Date.now(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_transactions')
        .insert({
          id: fullTx.id,
          user_id: fullTx.userId,
          user_name: fullTx.userName,
          user_username: fullTx.userUsername,
          type: fullTx.type,
          operator: fullTx.operator || null,
          phone_number: fullTx.phoneNumber || null,
          amount: fullTx.amount,
          status: fullTx.status,
          created_at: fullTx.createdAt,
          processed_at: fullTx.processedAt || null,
          notes: fullTx.notes || null,
          reference_id: fullTx.referenceId,
          created_at_timestamp: fullTx.createdAtTimestamp,
        })
        .select()
        .single();

      if (!error && data) {
        return rowToTransaction(data);
      }
    } catch {
      // ignore
    }
  }

  const all = getLocalItem<TransactionRequest[]>(STORAGE_TRANSACTIONS, []);
  setLocalItem(STORAGE_TRANSACTIONS, [fullTx, ...all]);
  return fullTx;
}

export async function signInWithUsername(
  username: string,
  password?: string
): Promise<{ user: User | null; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // 1. Primary: Supabase Authentication
  if (isSupabaseConfigured) {
    try {
      let email = cleanUsername;
      if (!email.includes('@')) {
        // Look up registered email from profiles table if exists
        const { data: profileRow } = await supabase
          .from('geld_profiles')
          .select('email')
          .ilike('username', cleanUsername)
          .maybeSingle();

        email = profileRow?.email || `${cleanUsername}@geld.local`;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: cleanPassword,
      });

      if (error) {
        // If initial email attempt failed and didn't have @, try direct user lookup or error message
        return { user: null, error: error.message || 'Invalid username or password' };
      }

      if (data?.user) {
        const profile = await getCurrentProfile();
        if (profile) {
          setLocalItem(STORAGE_AUTH_USER, profile.id);
          return { user: profile };
        }
      }
    } catch (err: any) {
      return { user: null, error: err?.message || 'Authentication error connecting to Supabase' };
    }
  }

  // 2. Local fallback authentication (only used when Supabase is not reachable or in mock mode)
  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  const credentials = getLocalItem<Record<string, string>>(STORAGE_CREDENTIALS, {});

  const normalizedUsername = cleanUsername.replace(/\s+/g, '.');
  const foundUser = profiles.find(p => 
    p.username.toLowerCase() === cleanUsername || 
    p.username.toLowerCase() === normalizedUsername ||
    p.email?.toLowerCase() === cleanUsername
  );

  if (!foundUser) {
    return { user: null, error: 'User not found' };
  }

  const storedPw = credentials[cleanUsername] || credentials[foundUser.username.toLowerCase()];
  if (storedPw && cleanPassword && storedPw !== cleanPassword) {
    return { user: null, error: 'Incorrect password' };
  }

  setLocalItem(STORAGE_AUTH_USER, foundUser.id);
  return { user: foundUser };
}

export async function signUpWithUsername(
  fullName: string,
  username: string,
  password: string,
  referralCode?: string
): Promise<{ user: User | null; error?: string }> {
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '.');
  const cleanPassword = password.trim();

  if (isSupabaseConfigured) {
    try {
      const email = `${cleanUsername}@geld.local`;
      const existing = await getProfileByUsername(cleanUsername);
      if (existing) {
        return { user: null, error: 'Username already taken' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: cleanPassword,
        options: {
          data: {
            username: cleanUsername,
            full_name: fullName.trim(),
          },
        },
      });

      if (!error && data.user) {
        const referrer = referralCode ? await getProfileByReferralCode(referralCode) : null;
        const profileData: Record<string, unknown> = {
          id: data.user.id,
          full_name: fullName.trim(),
          username: cleanUsername,
          email,
          balance: 3500,
          joined_date: new Date().toISOString().split('T')[0],
          referral_code: generateReferralCode(),
          signup_bonus_given: true,
        };

        if (referrer) {
          profileData.referred_by = referrer.id;
        }

        const { data: profile } = await supabase
          .from('geld_profiles')
          .insert(profileData)
          .select()
          .single();

        if (profile) {
          const user = rowToUser(profile);
          setLocalItem(STORAGE_AUTH_USER, user.id);
          return { user };
        }
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Local fallback registration
  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  if (profiles.some(p => p.username.toLowerCase() === cleanUsername)) {
    return { user: null, error: 'Username already taken' };
  }

  const referrer = referralCode ? profiles.find(p => p.referralCode === referralCode) : null;
  const newUserId = `usr-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    fullName: fullName.trim(),
    username: cleanUsername,
    email: `${cleanUsername}@geld.local`,
    balance: 3500,
    joinedDate: new Date().toISOString().split('T')[0],
    referralCode: generateReferralCode(),
    referredBy: referrer ? referrer.id : undefined,
    signupBonusGiven: true,
    isAdmin: false,
  };

  profiles.push(newUser);
  setLocalItem(STORAGE_PROFILES, profiles);

  const credentials = getLocalItem<Record<string, string>>(STORAGE_CREDENTIALS, {});
  credentials[cleanUsername] = cleanPassword;
  setLocalItem(STORAGE_CREDENTIALS, credentials);

  setLocalItem(STORAGE_AUTH_USER, newUser.id);

  // Bonus transaction
  const bonusTx: TransactionRequest = {
    id: `tx-bonus-${Date.now()}-${cleanUsername}`,
    userId: newUser.id,
    userName: newUser.fullName,
    userUsername: newUser.username,
    type: 'signup_bonus',
    amount: 3500,
    status: 'approved',
    createdAt: new Date().toLocaleString(),
    notes: 'Welcome signup bonus — first-time account credit',
    referenceId: `BONUS-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAtTimestamp: Date.now(),
  };
  const txs = getLocalItem<TransactionRequest[]>(STORAGE_TRANSACTIONS, []);
  setLocalItem(STORAGE_TRANSACTIONS, [bonusTx, ...txs]);

  return { user: newUser };
}

export async function getProfileByReferralCode(code: string): Promise<User | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('geld_profiles')
        .select('*')
        .eq('referral_code', code)
        .maybeSingle();

      if (!error && data) return rowToUser(data);
    } catch {
      // ignore
    }
  }

  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  return profiles.find(p => p.referralCode === code) || null;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NEST-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function updateUserBalanceDirect(userId: string, newBalance: number): Promise<void> {
  const rounded = Math.round(newBalance);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('geld_profiles')
        .update({ balance: rounded, updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch {
      // ignore
    }
  }

  const profiles = getLocalItem<User[]>(STORAGE_PROFILES, []);
  const updated = profiles.map(p => (p.id === userId ? { ...p, balance: rounded } : p));
  setLocalItem(STORAGE_PROFILES, updated);
}

export async function seedInitialProjects(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { data: existing } = await supabase.from('geld_projects').select('id').limit(1);
      if (!existing || existing.length === 0) {
        for (const p of INITIAL_PROJECTS) {
          try {
            await supabase.from('geld_projects').insert({
              id: p.id,
              title: p.title,
              category: p.category,
              tagline: p.tagline,
              description: p.description,
              image_url: p.imageUrl,
              gallery_images: p.galleryImages,
              target_goal: p.targetGoal,
              raised_amount: p.raisedAmount,
              min_stake: p.minStake,
              expected_return_rate: p.expectedReturnRate,
              lockup_period_days: p.lockupPeriodDays,
              period_label: p.periodLabel,
              status: p.status,
              days_left: p.daysLeft,
              investors_count: p.investorsCount,
              featured: p.featured,
            });
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const localProjects = getLocalItem<ClothingProject[]>(STORAGE_PROJECTS, []);
  if (localProjects.length === 0) {
    setLocalItem(STORAGE_PROJECTS, INITIAL_PROJECTS);
  }
}
