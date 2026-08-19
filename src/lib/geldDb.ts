import { supabase } from './supabase';
import type { User, ClothingProject, UserInvestment, TransactionRequest } from '../types';

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    username: row.username as string,
    avatarUrl: (row.avatar_url as string) || undefined,
    balance: (row.balance as number) || 0,
    joinedDate: row.joined_date as string,
    email: (row.email as string) || undefined,
    referralCode: (row.referral_code as string) || undefined,
    referredBy: (row.referred_by as string) || undefined,
    signupBonusGiven: (row.signup_bonus_given as boolean) || false,
    lastDailyRewardClaim: (row.last_daily_reward_claim as number) || undefined,
    isAdmin: (row.is_admin as boolean) || false,
  };
}

function rowToProject(row: Record<string, unknown>): ClothingProject {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as ClothingProject['category'],
    tagline: row.tagline as string,
    description: row.description as string,
    imageUrl: row.image_url as string,
    galleryImages: (row.gallery_images as string[]) || [],
    targetGoal: row.target_goal as number,
    raisedAmount: (row.raised_amount as number) || 0,
    minStake: row.min_stake as number,
    expectedReturnRate: Number(row.expected_return_rate),
    lockupPeriodDays: row.lockup_period_days as number,
    periodLabel: row.period_label as string,
    status: (row.status as ClothingProject['status']) || 'active',
    daysLeft: (row.days_left as number) || 0,
    investorsCount: (row.investors_count as number) || 0,
    featured: (row.featured as boolean) || false,
  };
}

function rowToInvestment(row: Record<string, unknown>): UserInvestment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    projectId: row.project_id as string,
    projectTitle: row.project_title as string,
    projectCategory: row.project_category as string,
    projectImageUrl: row.project_image_url as string,
    amountInvested: row.amount_invested as number,
    expectedReturnRate: Number(row.expected_return_rate),
    expectedReturnAmount: row.expected_return_amount as number,
    lockupDaysTotal: row.lockup_days_total as number,
    daysElapsed: (row.days_elapsed as number) || 0,
    dailyIncrementRate: Number(row.daily_increment_rate),
    progressPercentage: (row.progress_percentage as number) || 0,
    startDate: row.start_date as string,
    maturityDate: row.maturity_date as string,
    status: (row.status as UserInvestment['status']) || 'active',
    periodLabel: row.period_label as string,
    createdAtTimestamp: (row.created_at_timestamp as number) || undefined,
    daysCredited: (row.days_credited as number) || undefined,
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('geld_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToUser(data);
}

export async function getAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('geld_profiles')
    .select('*')
    .order('joined_date', { ascending: true });

  if (error || !data) return [];
  return data.map(rowToUser);
}

export async function getProfileByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('geld_profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error || !data) return null;
  return rowToUser(data);
}

export async function getProfileByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('geld_profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) return null;
  return rowToUser(data);
}

export async function getAllProjects(): Promise<ClothingProject[]> {
  const { data, error } = await supabase
    .from('geld_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(rowToProject);
}

export async function createProject(project: Omit<ClothingProject, 'id' | 'raisedAmount' | 'investorsCount' | 'status'>): Promise<ClothingProject | null> {
  const newProject: Record<string, unknown> = {
    id: `proj-${Date.now()}`,
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
    .insert(newProject)
    .select()
    .single();

  if (error || !data) return null;
  return rowToProject(data);
}

export async function getUserInvestments(userId: string): Promise<UserInvestment[]> {
  const { data, error } = await supabase
    .from('geld_investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(rowToInvestment);
}

export async function getAllInvestments(): Promise<UserInvestment[]> {
  const { data, error } = await supabase
    .from('geld_investments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(rowToInvestment);
}

export async function getUserTransactions(userId: string): Promise<TransactionRequest[]> {
  const { data, error } = await supabase
    .from('geld_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at_timestamp', { ascending: false });

  if (error || !data) return [];
  return data.map(rowToTransaction);
}

export async function getAllTransactions(): Promise<TransactionRequest[]> {
  const { data, error } = await supabase
    .from('geld_transactions')
    .select('*')
    .order('created_at_timestamp', { ascending: false });

  if (error || !data) return [];
  return data.map(rowToTransaction);
}

export async function createTransaction(tx: Omit<TransactionRequest, 'id'> & { id?: string }): Promise<TransactionRequest | null> {
  const { data, error } = await supabase
    .from('geld_transactions')
    .insert({
      id: tx.id || `tx-${Date.now()}`,
      user_id: tx.userId,
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
    })
    .select()
    .single();

  if (error || !data) return null;
  return rowToTransaction(data);
}

export async function signInWithUsername(username: string, password: string): Promise<{ user: User | null; error?: string }> {
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '.');
  const email = `${cleanUsername}@geld.local`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { user: null, error: error?.message || 'Invalid credentials' };
  }

  const profile = await getCurrentProfile();
  return { user: profile };
}

export async function signUpWithUsername(
  fullName: string,
  username: string,
  password: string,
  referralCode?: string
): Promise<{ user: User | null; error?: string }> {
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '.');
  const email = `${cleanUsername}@geld.local`;

  const existing = await getProfileByUsername(cleanUsername);
  if (existing) {
    return { user: null, error: 'Username already taken' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: cleanUsername,
        full_name: fullName.trim(),
      },
    },
  });

  if (error || !data.user) {
    return { user: null, error: error?.message || 'Signup failed' };
  }

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

  const { data: profile, error: profileError } = await supabase
    .from('geld_profiles')
    .insert(profileData)
    .select()
    .single();

  if (profileError || !profile) {
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => {});
    return { user: null, error: 'Failed to create profile' };
  }

  const user = rowToUser(profile);

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return { user: null, error: signInError.message || 'Failed to sign in after signup' };
    }
  }

  if (referrer) {
    try {
      await supabase
        .from('geld_profiles')
        .update({ balance: referrer.balance + 1000, updated_at: new Date().toISOString() })
        .eq('id', referrer.id);

      await supabase.from('geld_transactions').insert({
        id: `tx-ref-${Date.now()}-${cleanUsername}`,
        user_id: referrer.id,
        user_name: referrer.fullName,
        user_username: referrer.username,
        type: 'referral_reward',
        amount: 1000,
        status: 'approved',
        created_at: new Date().toLocaleString(),
        notes: `Referral reward for ${fullName.trim()} (@${cleanUsername})`,
        reference_id: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
        created_at_timestamp: Date.now(),
      });
    } catch {
      // ignore referral reward errors
    }
  }

  try {
    await supabase.from('geld_transactions').insert({
      id: `tx-bonus-${Date.now()}-${cleanUsername}`,
      user_id: user.id,
      user_name: user.fullName,
      user_username: user.username,
      type: 'signup_bonus',
      amount: 3500,
      status: 'approved',
      created_at: new Date().toLocaleString(),
      notes: 'Welcome signup bonus — first-time account credit',
      reference_id: `BONUS-${Math.floor(10000 + Math.random() * 90000)}`,
      created_at_timestamp: Date.now(),
    });
  } catch {
    // ignore signup bonus errors
  }

  return { user };
}

export async function getProfileByReferralCode(code: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('geld_profiles')
    .select('*')
    .eq('referral_code', code)
    .maybeSingle();

  if (error || !data) return null;
  return rowToUser(data);
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
  await supabase
    .from('geld_profiles')
    .update({ balance: Math.round(newBalance), updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function seedInitialProjects(): Promise<void> {
  try {
    const { data: existing } = await supabase.from('geld_projects').select('id').limit(1);
    if (existing && existing.length > 0) return;

    const projects = [
    {
      id: 'proj-urban-wear',
      title: 'Urban Wear Collection',
      category: 'Streetwear',
      tagline: 'Premium streetwear collection for modern lifestyle.',
      description: 'We are a modern streetwear clothing brand focused on premium quality and unique designs. Your investment earns a 7.1% daily return credited every 24 hours over a 14-day lockup cycle.',
      image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
      ],
      target_goal: 25000000,
      raised_amount: 16500000,
      min_stake: 20000,
      expected_return_rate: 100.0,
      lockup_period_days: 14,
      period_label: '14 Days Lockup (7.1% Daily)',
      status: 'active',
      days_left: 45,
      investors_count: 48,
      featured: true,
    },
    {
      id: 'proj-summer-line',
      title: 'Summer Line Expansion',
      category: 'Summer Line',
      tagline: 'Expand our summer collection and reach more customers.',
      description: 'Lightweight linen, breathable cotton blends, and pastel summer capsules designed for peak resort and festival season. Earn 7.1% daily returns credited directly to your wallet every 24 hours.',
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80'
      ],
      target_goal: 18000000,
      raised_amount: 11200000,
      min_stake: 50000,
      expected_return_rate: 100.0,
      lockup_period_days: 14,
      period_label: '14 Days Lockup (7.1% Daily)',
      status: 'active',
      days_left: 30,
      investors_count: 36,
      featured: true,
    },
    {
      id: 'proj-hoodie-project',
      title: 'Premium Hoodie Project',
      category: 'Hoodies',
      tagline: 'High quality heavyweight hoodies for global market expansion.',
      description: '500 GSM French Terry custom milled heavyweight hoodies with embroidered minimalist typography. Yields 7.1% daily returns credited directly to your balance each day.',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80'
      ],
      target_goal: 20000000,
      raised_amount: 9500000,
      min_stake: 30000,
      expected_return_rate: 100.0,
      lockup_period_days: 14,
      period_label: '14 Days Lockup (7.1% Daily)',
      status: 'active',
      days_left: 22,
      investors_count: 29,
      featured: true,
    },
    {
      id: 'proj-denim-collection',
      title: 'Denim Collection',
      category: 'Denim',
      tagline: 'Trendy denim collection for youth and young adults.',
      description: 'Raw selvedge Japanese and Turkish denim weaves with eco-conscious ozone washing. Back the batch and collect 7.1% return credited every 24 hours.',
      image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80'
      ],
      target_goal: 15000000,
      raised_amount: 7000000,
      min_stake: 25000,
      expected_return_rate: 100.0,
      lockup_period_days: 14,
      period_label: '14 Days Lockup (7.1% Daily)',
      status: 'active',
      days_left: 18,
      investors_count: 22,
      featured: true,
    },
    {
      id: 'proj-tech-jackets',
      title: 'Waterproof Techwear Windbreaker',
      category: 'Jackets',
      tagline: 'Storm-proof breathable urban outerwear with modular pockets.',
      description: 'Ripstop 3-layer laminated fabric with waterproof taped seams and magnetic closure accessories. Fixed 7.1% daily return paid out on every collapsed day.',
      image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80'
      ],
      target_goal: 30000000,
      raised_amount: 22000000,
      min_stake: 50000,
      expected_return_rate: 100.0,
      lockup_period_days: 14,
      period_label: '14 Days Lockup (7.1% Daily)',
      status: 'active',
      days_left: 12,
      investors_count: 64,
      featured: false,
    },
    {
      id: 'proj-vintage-capsules',
      title: 'Vintage Washed Graphic Tees',
      category: 'Streetwear',
      tagline: 'Oversized boxy tee drop featuring retro hand-drawn graphics.',
      description: 'Acid-washed 260 GSM single jersey cotton tees with vintage crackle screen prints and distressed collar trims. Earn 7.1% daily returns in UGX.',
      image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80'
      ],
      target_goal: 12000000,
      raised_amount: 10200000,
      min_stake: 20000,
      expected_return_rate: 100.0,
      lockup_period_days: 14,
      period_label: '14 Days Lockup (7.1% Daily)',
      status: 'active',
      days_left: 8,
      investors_count: 52,
      featured: false,
    },
  ];

  for (const p of projects) {
    await supabase.from('geld_projects').insert(p);
  }
  } catch (err) {
    console.error('Failed to seed initial projects:', err);
  }
}
