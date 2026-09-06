import { Fragment, ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { Button } from './Button';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  className?: string;
  portalContainer?: HTMLElement | null;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className,
  portalContainer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose();
        }
        if (e.key === 'Tab') {
          trapFocus(e);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, closeOnEscape, onClose]);

  const trapFocus = (e: KeyboardEvent) => {
    if (!modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  };

  const modalContent = (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={cn(
            'w-full bg-cyber-panel rounded-2xl shadow-2xl border border-cyber-border overflow-hidden',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-cyber-border">
              <div className="pr-4">
                {title && (
                  <h2 id="modal-title" className="text-lg font-heading font-semibold text-cyber-text">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-cyber-textMuted">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-cyber-elevated"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cyber-border bg-cyber-elevated/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );

  if (portalContainer) {
    return createPortal(modalContent, portalContainer);
  }

  return modalContent;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const variantStyles = {
    danger: { iconColor: 'text-cyber-critical', bgColor: 'bg-cyber-critical/10', btnVariant: 'danger' as const },
    primary: { iconColor: 'text-cyber-primary', bgColor: 'bg-cyber-primary/10', btnVariant: 'primary' as const },
    warning: { iconColor: 'text-cyber-warning', bgColor: 'bg-cyber-warning/10', btnVariant: 'warning' as const },
  };

  const styles = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={styles.btnVariant} onClick={handleConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex-shrink-0 p-3 rounded-lg', styles.bgColor)}>
          {icon || (
            <span className={cn('text-2xl', styles.iconColor)}>⚠</span>
          )}
        </div>
        <p className="text-cyber-text mt-1">{message}</p>
      </div>
    </Modal>
  );
}

interface FormModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: ReactNode;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  children,
  size = 'md',
  ...props
}: FormModalProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="submit" form="modal-form" variant="primary" loading={loading}>
            {submitText}
          </Button>
        </>
      }
      {...props}
    >
      <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'left' | 'right';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'right',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      drawerRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') trapFocus(e);
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const trapFocus = (e: KeyboardEvent) => {
    if (!drawerRef.current) return;
    const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[36rem]',
    full: 'w-full max-w-2xl',
  };

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 z-50 flex animate-in">
        {position === 'left' && <div className="flex-1" />}
        <div
          ref={drawerRef}
          tabIndex={-1}
          className={cn(
            'h-full bg-cyber-panel border-l border-cyber-border shadow-2xl flex flex-col',
            sizeClasses[size],
            position === 'left' ? 'animate-slide-in-from-left' : 'animate-slide-in-from-right'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
          aria-describedby={description ? 'drawer-description' : undefined}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-cyber-border flex-shrink-0">
              <div className="pr-4">
                {title && (
                  <h2 id="drawer-title" className="text-lg font-heading font-semibold text-cyber-text">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="drawer-description" className="mt-1 text-sm text-cyber-textMuted">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-cyber-elevated"
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        </div>
        {position === 'right' && <div className="flex-1" />}
      </div>
    </Fragment>
  );
}