import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass' | 'bordered' | 'elevated' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-cyber-panel border border-cyber-border rounded-xl shadow-panel',
      hover: 'bg-cyber-panel border border-cyber-border rounded-xl shadow-panel transition-all duration-300 hover:shadow-elevated hover:border-cyber-primary/30 hover:-translate-y-0.5',
      glass: 'bg-cyber-panel/70 backdrop-blur-xl border border-cyber-primary/20 rounded-xl shadow-panel',
      bordered: 'bg-cyber-panel border-2 border-cyber-border rounded-xl',
      elevated: 'bg-cyber-panel border border-cyber-border rounded-xl shadow-elevated',
      gradient: 'bg-gradient-to-br from-cyber-panel to-cyber-elevated border border-cyber-primary/20 rounded-xl shadow-elevated',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          hoverable && variant !== 'hover' && 'transition-all duration-300 hover:shadow-elevated hover:border-cyber-primary/30',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="flex-shrink-0 mt-1">{action}</div>}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-heading font-semibold text-cyber-text truncate', className)}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-cyber-textMuted mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 pt-4 border-t border-cyber-border', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; up: boolean };
  color?: 'primary' | 'success' | 'warning' | 'critical' | 'secondary';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  loading,
  onClick,
  className,
}: StatCardProps) {
  const iconBgClasses = {
    primary: 'bg-cyber-primary/10 text-cyber-primary',
    success: 'bg-cyber-success/10 text-cyber-success',
    warning: 'bg-cyber-warning/10 text-cyber-warning',
    critical: 'bg-cyber-critical/10 text-cyber-critical',
    secondary: 'bg-cyber-secondary/10 text-cyber-secondary',
  };

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse bg-cyber-elevated rounded', className)} />
  );

  if (loading) {
    return (
      <Card className={cn('cursor-pointer', className)} variant="hover">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn('cursor-pointer', onClick && 'hover:shadow-elevated hover:border-cyber-primary/30 transition-all duration-300', className)}
      variant="hover"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className={cn('p-3 rounded-lg flex-shrink-0', iconBgClasses[color])}>
              <span className="text-xl">{icon}</span>
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="text-sm font-medium text-cyber-textMuted">{title}</CardTitle>
            <div className="text-2xl font-heading font-bold text-cyber-text truncate">
              {value}
            </div>
          </div>
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
              trend.up
                ? 'bg-cyber-success/10 text-cyber-success'
                : 'bg-cyber-critical/10 text-cyber-critical'
            )}
          >
            <span className="flex items-center gap-0.5">
              {trend.up ? '▲' : '▼'}
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'critical';
  action?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  badge,
  badgeVariant = 'primary',
  action,
  hoverable = true,
  className,
}: FeatureCardProps) {
  const badgeClasses = {
    primary: 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/20',
    success: 'bg-cyber-success/10 text-cyber-success border-cyber-success/20',
    warning: 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/20',
    critical: 'bg-cyber-critical/10 text-cyber-critical border-cyber-critical/20',
  };

  return (
    <Card
      className={cn(hoverable && 'hover:shadow-elevated hover:border-cyber-primary/30 hover:-translate-y-0.5', className)}
      variant={hoverable ? 'hover' : 'default'}
      padding="lg"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        {icon && (
          <div className="p-3 bg-cyber-primary/10 text-cyber-primary rounded-lg flex-shrink-0">
            <span className="text-xl">{icon}</span>
          </div>
        )}
        {badge && (
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', badgeClasses[badgeVariant])}>
            {badge}
          </span>
        )}
      </div>
      <CardTitle className="text-base mb-2">{title}</CardTitle>
      <CardDescription className="text-base mb-4">{description}</CardDescription>
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
}

export interface ProfileCardProps {
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  avatarFallback?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  actions?: React.ReactNode;
  metadata?: Array<{ label: string; value: string }>;
  className?: string;
}

export function ProfileCard({
  name,
  role,
  email,
  avatar,
  avatarFallback,
  status = 'offline',
  actions,
  metadata,
  className,
}: ProfileCardProps) {
  const statusColors = {
    online: 'bg-cyber-success',
    offline: 'bg-cyber-textDim',
    busy: 'bg-cyber-critical',
    away: 'bg-cyber-warning',
  };

  const initials = avatarFallback || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className={className} variant="default" padding="lg">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center text-cyber-bg font-medium text-xl overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {status && (
            <span
              className={cn('absolute bottom-0 right-0 w-4 h-4 rounded-full border-3 border-cyber-panel', statusColors[status])}
              aria-label={`Status: ${status}`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg truncate">{name}</CardTitle>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/20')}>
              {role}
            </span>
          </div>
          {email && (
            <p className="text-sm text-cyber-textMuted truncate mt-1">{email}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {metadata && metadata.length > 0 && (
        <div className="mt-6 pt-6 border-t border-cyber-border grid grid-cols-2 gap-4">
          {metadata.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-heading font-bold text-cyber-text">{item.value}</p>
              <p className="text-xs text-cyber-textMuted uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}