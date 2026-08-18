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

export const formatDuration = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined || isNaN(ms) || ms <= 0) return '0s';
  const total = Math.floor(ms);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};
