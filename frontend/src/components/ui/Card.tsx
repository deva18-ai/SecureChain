import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'glass';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-700 shadow-sm dark:shadow-lg overflow-hidden',
      hover: 'bg-white dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-700 shadow-sm dark:shadow-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary-500/50 hover:-translate-y-0.5',
      glass: 'bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl border border-white/20 dark:border-dark-700/50 rounded-xl overflow-hidden',
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-dark-200 dark:border-dark-700', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-dark-900 dark:text-dark-100', className)}
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
      className={cn('text-sm text-dark-500 dark:text-dark-400 mt-1', className)}
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
      className={cn('px-6 py-4', className)}
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
      className={cn('px-6 py-4 border-t border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';