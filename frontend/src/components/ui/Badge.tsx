import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export type BadgeVariant = 
  | 'default' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'primary' 
  | 'violet' 
  | 'verified' 
  | 'pending' 
  | 'rejected' 
  | 'executed' 
  | 'active' 
  | 'inactive'
  | 'outline'
  | 'frozen'
  | 'burned'
  | 'transferred'
  | 'admin'
  | 'manager'
  | 'auditor'
  | 'user';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', dot = false, children, ...props }, ref) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-gray-100 text-gray-700',
      success: 'bg-success-bg text-success',
      warning: 'bg-warning-bg text-warning',
      danger: 'bg-danger-bg text-danger',
      info: 'bg-info-bg text-info',
      primary: 'bg-primary-blue/10 text-primary-blue',
      violet: 'bg-violet-100 text-violet-700',
      verified: 'bg-success-bg text-success',
      pending: 'bg-warning-bg text-warning',
      rejected: 'bg-danger-bg text-danger',
      executed: 'bg-info-bg text-info',
      active: 'bg-success-bg text-success',
      outline: 'bg-transparent text-gray-600 border-2 border-gray-300',
      frozen: 'bg-warning-bg text-warning',
      burned: 'bg-danger-bg text-danger',
      transferred: 'bg-info-bg text-info',
      admin: 'bg-primary-blue/10 text-primary-blue',
      manager: 'bg-primary-blue/10 text-primary-blue',
      auditor: 'bg-violet-100 text-violet-700',
      user: 'bg-green-100 text-green-700',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps {
  status: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ status, dot = false, className }: StatusBadgeProps) {
  const statusMap: Record<string, BadgeVariant> = {
    ACTIVE: 'active',
    VERIFIED: 'verified',
    PENDING: 'pending',
    REJECTED: 'rejected',
    COMPLETED: 'executed',
    FAILED: 'rejected',
    CANCELLED: 'outline',
    FROZEN: 'frozen',
    BURNED: 'burned',
    TRANSFERRED: 'transferred',
    APPROVED: 'verified',
    OPEN: 'pending',
    BLOCKED: 'danger',
    RESOLVED: 'success',
    INACTIVE: 'inactive',
  };

  const variant = statusMap[status.toUpperCase()] || 'default';

  return <Badge variant={variant} dot={dot} className={className}>{status}</Badge>;
}

export interface RoleBadgeProps {
  role: string;
  dot?: boolean;
  className?: string;
}

export function RoleBadge({ role, dot = false, className }: RoleBadgeProps) {
  const roleMap: Record<string, BadgeVariant> = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    AUDITOR: 'auditor',
    USER: 'user',
    OWNER: 'admin',
    EMPLOYEE: 'user',
  };

  const variant = roleMap[role.toUpperCase()] || 'default';
  const displayRole = role === 'ADMIN' ? 'OWNER' : role === 'USER' ? 'EMPLOYEE' : role;

  return <Badge variant={variant} dot={dot} className={className}>{displayRole}</Badge>;
}