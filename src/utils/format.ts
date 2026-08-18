/**
 * Currency and Number Formatting Utility for ThreadInvest
 * Default platform currency: UGX (Ugandan Shilling)
 */

export const formatUGX = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'UGX 0';
  }
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
};

export const formatUGXCompact = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'UGX 0';
  }
  if (amount >= 1000000) {
    const val = (amount / 1000000).toFixed(1).replace(/\.0$/, '');
    return `UGX ${val}M`;
  }
  if (amount >= 1000) {
    const val = (amount / 1000).toFixed(0);
    return `UGX ${val}k`;
  }
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
};
