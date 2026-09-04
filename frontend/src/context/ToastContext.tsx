import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '../../utils/helpers';
import { Toast as ToastComponent, type ToastProps } from './Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastProps['type'];
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastProps['type'], options?: Partial<ToastMessage>) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
  success: (message: string, options?: Partial<ToastMessage>) => string;
  error: (message: string, options?: Partial<ToastMessage>) => string;
  warning: (message: string, options?: Partial<ToastMessage>) => string;
  info: (message: string, options?: Partial<ToastMessage>) => string;
  loading: (message: string, options?: Partial<ToastMessage>) => string;
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string | ((data: T) => string); error: string | ((error: Error) => string) }) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastProps['type'] = 'default',
    options: Partial<ToastMessage> = {}
  ) => {
    const id = generateId();
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: options.duration ?? (type === 'error' ? 6000 : 4000),
      dismissible: options.dismissible ?? true,
      action: options.action,
    };

    setToasts(prev => [...prev, toast]);

    if (toast.duration !== 0 && toast.duration !== undefined) {
      setTimeout(() => dismissToast(id), toast.duration);
    }

    return id;
  }, [dismissToast]);

  const toastPromise = async <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string | ((data: T) => string); error: string | ((error: Error) => string) }
  ): Promise<T> => {
    const loadingId = showToast(messages.loading, 'default', { duration: 0 });
    try {
      const data = await promise;
      dismissToast(loadingId);
      const successMessage = typeof messages.success === 'function' ? messages.success(data) : messages.success;
      showToast(successMessage, 'success');
      return data;
    } catch (error) {
      dismissToast(loadingId);
      const errorMessage = typeof messages.error === 'function' ? messages.error(error as Error) : messages.error;
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  const toastHelpers = {
    success: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'success', options),
    error: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'error', options),
    warning: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'warning', options),
    info: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'info', options),
    loading: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'default', { ...options, duration: 0 }),
    promise: toastPromise,
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, dismissAll, ...toastHelpers }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" role="region" aria-label="Notifications">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent
              type={toast.type}
              message={toast.message}
              onClose={() => dismissToast(toast.id)}
              className="min-w-[300px] max-w-md"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function useToastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string | ((data: T) => string); error: string | ((error: Error) => string) }
) {
  const { promise: toastPromise } = useToast();
  return toastPromise(promise, messages);
}

export function useToastQueue() {
  const { toasts, dismissToast, dismissAll } = useToast();
  
  return {
    toasts,
    dismiss: dismissToast,
    dismissAll,
    count: toasts.length,
    hasErrors: toasts.some(t => t.type === 'error'),
    hasWarnings: toasts.some(t => t.type === 'warning'),
  };
}