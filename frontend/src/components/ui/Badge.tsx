import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'critical' | 'outline' | 'violet' | 'approved' | 'pending' | 'rejected' | 'executed' | 'active';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}


export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-dark-100 text-dark-800 dark:bg-dark-700 dark:text-dark-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-700',
      outline: 'bg-transparent text-dark-700 dark:text-dark-300 border border-dark-300 dark:border-dark-600',
      violet: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      executed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';