import { User, ClothingProject, UserInvestment, TransactionRequest } from './types';

// Removed all mock users as requested by the user
export const INITIAL_USERS: User[] = [];

export const INITIAL_PROJECTS: ClothingProject[] = [
  {
    id: 'proj-urban-wear',
    title: 'Urban Wear Collection',
    category: 'Streetwear',
    tagline: 'Premium streetwear collection for modern lifestyle.',
    description: 'We are a modern streetwear clothing brand focused on premium quality and unique designs. Your investment earns a 7.1% daily return credited every 24 hours over a 14-day lockup cycle.',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
    ],
    targetGoal: 25000000,
    raisedAmount: 16500000,
    minStake: 20000,
    expectedReturnRate: 50.0,
    returnMultiplier: 1.5,
    lockupPeriodDays: 14,
    periodLabel: '14 Days Lockup (7.1% Daily)',
    status: 'active',
    daysLeft: 45,
    investorsCount: 48,
    featured: true
  },
  {
    id: 'proj-summer-line',
    title: 'Summer Line Expansion',
    category: 'Summer Line',
    tagline: 'Expand our summer collection and reach more customers.',
    description: 'Lightweight linen, breathable cotton blends, and pastel summer capsules designed for peak resort and festival season. Earn 7.1% daily returns credited directly to your wallet every 24 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80'
    ],
    targetGoal: 18000000,
    raisedAmount: 11200000,
    minStake: 50000,
    expectedReturnRate: 100.0,
    lockupPeriodDays: 14,
    periodLabel: '14 Days Lockup (7.1% Daily)',
    status: 'active',
    daysLeft: 30,
    investorsCount: 36,
    featured: true
  },
  {
    id: 'proj-hoodie-project',
    title: 'Premium Hoodie Project',
    category: 'Hoodies',
    tagline: 'High quality heavyweight hoodies for global market expansion.',
    description: '500 GSM French Terry custom milled heavyweight hoodies with embroidered minimalist typography. Yields 7.1% daily returns credited directly to your balance each day.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80'
    ],
    targetGoal: 20000000,
    raisedAmount: 9500000,
    minStake: 30000,
    expectedReturnRate: 66.67,
    returnMultiplier: 1.6666667,
    lockupPeriodDays: 14,
    periodLabel: '14 Days Lockup (7.1% Daily)',
    status: 'active',
    daysLeft: 22,
    investorsCount: 29,
    featured: true
  },
  {
    id: 'proj-denim-collection',
    title: 'Denim Collection',
    category: 'Denim',
    tagline: 'Trendy denim collection for youth and young adults.',
    description: 'Raw selvedge Japanese and Turkish denim weaves with eco-conscious ozone washing. Back the batch and collect 7.1% return credited every 24 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80'
    ],
    targetGoal: 15000000,
    raisedAmount: 7000000,
    minStake: 25000,
    expectedReturnRate: 100.0,
    lockupPeriodDays: 14,
    periodLabel: '14 Days Lockup (7.1% Daily)',
    status: 'active',
    daysLeft: 18,
    investorsCount: 22,
    featured: true
  },
  {
    id: 'proj-tech-jackets',
    title: 'Waterproof Techwear Windbreaker',
    category: 'Jackets',
    tagline: 'Storm-proof breathable urban outerwear with modular pockets.',
    description: 'Ripstop 3-layer laminated fabric with waterproof taped seams and magnetic closure accessories. Fixed 7.1% daily return paid out on every collapsed day.',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80'
    ],
    targetGoal: 30000000,
    raisedAmount: 22000000,
    minStake: 50000,
    expectedReturnRate: 100.0,
    lockupPeriodDays: 14,
    periodLabel: '14 Days Lockup (7.1% Daily)',
    status: 'active',
    daysLeft: 12,
    investorsCount: 64,
    featured: false
  },
  {
    id: 'proj-vintage-capsules',
    title: 'Vintage Washed Graphic Tees',
    category: 'Streetwear',
    tagline: 'Oversized boxy tee drop featuring retro hand-drawn graphics.',
    description: 'Acid-washed 260 GSM single jersey cotton tees with vintage crackle screen prints and distressed collar trims. Earn 7.1% daily returns in UGX.',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80'
    ],
    targetGoal: 12000000,
    raisedAmount: 10200000,
    minStake: 20000,
    expectedReturnRate: 50.0,
    returnMultiplier: 1.5,
    lockupPeriodDays: 14,
    periodLabel: '14 Days Lockup (7.1% Daily)',
    status: 'active',
    daysLeft: 8,
    investorsCount: 52,
    featured: false
  }
];

// No mock investments or mock transactions initially
export const INITIAL_INVESTMENTS: UserInvestment[] = [];
export const INITIAL_TRANSACTIONS: TransactionRequest[] = [];
