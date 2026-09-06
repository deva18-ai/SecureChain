import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTxHash(hash: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length < chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}


export function displayRole(role?: string | null): string {
  switch (role) {
    case 'ADMIN':
      return 'OWNER';
    case 'USER':
      return 'EMPLOYEE';
    case 'MANAGER':
    case 'AUDITOR':
      return role;
    default:
      return role || 'UNASSIGNED';
  }
}

export function firstName(name?: string | null): string {
  return name?.trim().split(/\s+/)[0] || 'User';
}
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'OWNER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'MANAGER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'EMPLOYEE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'AUDITOR': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'USER': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export function getWalletTypeColor(type: string): string {
  switch (type) {
    case 'OWNER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'MANAGER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'EMPLOYEE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export function getProposalStatusColor(status: string): string {
  switch (status) {
    case 'MINTED': return 'success';
    case 'APPROVED': return 'primary';
    case 'PROPOSED': return 'warning';
    case 'REJECTED': return 'danger';
    case 'DRAFT': return 'default';
    default: return 'default';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'TRANSFERRED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'BURNED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'FROZEN': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    case 'VERIFIED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export function getActionIcon(action: string) {
  switch (action) {
    case 'IDENTITY_CREATED': return 'UserPlus';
    case 'IDENTITY_VERIFIED': return 'ShieldCheck';
    case 'ROLE_ASSIGNED': return 'UserCog';
    case 'ROLE_REVOKED': return 'UserMinus';
    case 'ASSET_MINTED': return 'Gem';
    case 'ASSET_ALLOCATED': return 'ArrowRightLeft';
    case 'ASSET_TRANSFERRED': return 'Send';
    case 'ASSET_BURNED': return 'Trash2';
    case 'ASSET_FROZEN': return 'Lock';
    case 'ASSET_UNFROZEN': return 'Unlock';
    case 'USER_CREATED': return 'UserPlus';
    case 'USER_UPDATED': return 'UserCheck';
    case 'LOGIN': return 'LogIn';
    case 'LOGOUT': return 'LogOut';
    default: return 'Activity';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

