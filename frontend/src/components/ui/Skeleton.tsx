import { cn } from '../../utils/helpers';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const baseStyles = 'bg-cyber-elevated rounded animate-in';
  
  const variantStyles = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width,
        height: variant === 'text' ? undefined : height,
        ...props.style,
      }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          animation="pulse"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 space-y-4', className)} {...props}>
      <Skeleton variant="rectangular" height="24" width="40%" />
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height="10" width="80" />
        <Skeleton variant="rectangular" height="10" width="80" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className, ...props }: { rows?: number; columns?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height="12" width="80%" />
        ))}
      </div>
      <div className="space-y-2 border-t border-cyber-border pt-2">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} variant="text" height="16" width="90%" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMetric({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 space-y-3', className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" height="16" />
        <Skeleton variant="circular" width="32" height="32" />
      </div>
      <Skeleton variant="rectangular" height="36" width="60%" />
      <Skeleton variant="text" width="30%" height="12" />
    </div>
  );
}

export function SkeletonList({ items = 5, className, ...props }: { items?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-cyber-panel/50 rounded-lg border border-cyber-border/50">
          <Skeleton variant="circular" width="40" height="40" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="50%" height="16" />
            <Skeleton variant="text" width="30%" height="12" />
          </div>
          <Skeleton variant="rectangular" width="80" height="24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('h-64 bg-cyber-elevated/50 rounded-lg border border-cyber-border/50 animate-pulse', className)} {...props} />
  );
}

export function SkeletonPageHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)} {...props}>
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" height="28" />
        <Skeleton variant="text" width="60%" height="16" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="100" height="36" />
        <Skeleton variant="rectangular" width="120" height="36" />
      </div>
    </div>
  );
}

export function SkeletonStatGrid({ count = 6, className, ...props }: { count?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMetric key={i} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className, ...props }: { size?: 'sm' | 'md' | 'lg' | 'xl' } & React.HTMLAttributes<HTMLDivElement>) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton
      className={cn(sizes[size], 'rounded-full', className)}
      variant="circular"
      {...props}
    />
  );
}