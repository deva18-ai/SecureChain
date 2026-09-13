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
      default: 'bg-white border border-gray-200 rounded-xl shadow-sm',
      hover: 'bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5',
      glass: 'bg-white/90 backdrop-blur-xl border border-blue-100 rounded-xl shadow-sm',
      bordered: 'bg-white border-2 border-gray-300 rounded-xl',
      elevated: 'bg-white border border-gray-200 rounded-xl shadow-lg',
      gradient: 'bg-gradient-to-br from-white to-gray-50 border border-blue-200 rounded-xl shadow-md',
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
          hoverable && variant !== 'hover' && 'transition-all duration-200 hover:shadow-md hover:border-blue-300',
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
      className={cn('text-lg font-heading font-semibold text-gray-900 truncate', className)}
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
      className={cn('text-sm text-gray-600 mt-1', className)}
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
      className={cn('flex items-center gap-3 pt-4 border-t border-gray-200', className)}
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
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
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
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
    secondary: 'bg-gray-100 text-gray-600',
  };

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  );

  if (loading) {
    return (
      <Card className={cn('cursor-pointer', className)} variant="hover">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
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
      className={cn('cursor-pointer', onClick && 'hover:shadow-md hover:border-blue-300 transition-all duration-200', className)}
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
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <div className="text-2xl font-heading font-bold text-gray-900 truncate">
              {value}
            </div>
          </div>
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
              trend.up
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
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
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger';
  action?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  number?: string;
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
  number,
}: FeatureCardProps) {
  const badgeClasses = {
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Card
      className={cn(hoverable && 'hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5', className)}
      variant={hoverable ? 'hover' : 'default'}
      padding="lg"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        {number && (
          <span className="text-3xl font-heading font-bold text-blue-200 leading-none">{number}</span>
        )}
        {badge && (
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', badgeClasses[badgeVariant])}>
            {badge}
          </span>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0 mb-4">
          <span className="text-xl">{icon}</span>
        </div>
      )}
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
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  };

  const initials = avatarFallback || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className={className} variant="default" padding="lg">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-medium text-xl overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {status && (
            <span
              className={cn('absolute bottom-0 right-0 w-4 h-4 rounded-full border-3 border-white', statusColors[status])}
              aria-label={`Status: ${status}`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg truncate">{name}</CardTitle>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', 'bg-blue-100 text-blue-700 border-blue-200')}>
              {role}
            </span>
          </div>
          {email && (
            <p className="text-sm text-gray-600 truncate mt-1">{email}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {metadata && metadata.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
          {metadata.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-heading font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}