import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';
import { X } from 'lucide-react';

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  message: string;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, type = 'default', onClose, message, ...props }, ref) => {
    const typeClasses = {
      default: 'bg-dark-800 text-dark-100 border-dark-600',
      success: 'bg-green-900/50 text-green-100 border-green-500/50',
      error: 'bg-red-900/50 text-red-100 border-red-500/50',
      warning: 'bg-yellow-900/50 text-yellow-100 border-yellow-500/50',
      info: 'bg-blue-900/50 text-blue-100 border-blue-500/50',
    };

    const icons = {
      default: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      ),
      success: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      error: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      warning: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      info: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in',
          typeClasses[type],
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';