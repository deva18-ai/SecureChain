import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';
import { Loader2, ChevronDown, MoreVertical } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'subtle' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  isSelected?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading,
    disabled,
    children,
    leftIcon,
    rightIcon,
    fullWidth = false,
    isSelected,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variantClasses = {
      primary: 'bg-cyber-primary text-cyber-bg hover:bg-cyber-primaryDim focus:ring-cyber-primary shadow-lg shadow-cyber-primary/25 active:scale-[0.98]',
      secondary: 'bg-cyber-elevated text-cyber-text hover:bg-cyber-panel focus:ring-cyber-border border border-cyber-border active:scale-[0.98]',
      outline: 'border-2 border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 focus:ring-cyber-primary active:bg-cyber-primary/20',
      ghost: 'text-cyber-textMuted hover:bg-cyber-panel hover:text-cyber-text focus:ring-cyber-border active:bg-cyber-elevated',
      danger: 'bg-cyber-critical text-white hover:bg-red-600 focus:ring-cyber-critical shadow-lg shadow-cyber-critical/25 active:scale-[0.98]',
      success: 'bg-cyber-success text-white hover:bg-green-600 focus:ring-cyber-success shadow-lg shadow-cyber-success/25 active:scale-[0.98]',
      warning: 'bg-cyber-warning text-white hover:bg-amber-600 focus:ring-cyber-warning shadow-lg shadow-cyber-warning/25 active:scale-[0.98]',
      subtle: 'bg-cyber-primary/10 text-cyber-primary hover:bg-cyber-primary/20 focus:ring-cyber-primary border border-cyber-primary/20',
      link: 'text-cyber-primary hover:text-cyber-primaryDim focus:ring-cyber-primary p-0 hover:bg-transparent',
    };

    const sizeClasses = {
      xs: 'px-2.5 py-1 text-xs gap-1',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-2.5',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const selectedClass = isSelected ? 'ring-2 ring-cyber-primary ring-offset-2 ring-offset-cyber-bg' : '';

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], widthClass, selectedClass, className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
}

export function ButtonGroup({ children, className, vertical = false }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-cyber-border overflow-hidden',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          className: cn(
            'rounded-none border-0 focus:ring-0 hover:z-10',
            index === 0 && !vertical ? 'rounded-l-lg' : '',
            index === 0 && vertical ? 'rounded-t-lg' : '',
            index === React.Children.count(children) - 1 && !vertical ? 'rounded-r-lg' : '',
            index === React.Children.count(children) - 1 && vertical ? 'rounded-b-lg' : '',
          ),
        });
      })}
    </div>
  );
}

export interface ToggleButtonProps extends ButtonProps {
  pressed?: boolean;
  onPressChange?: (pressed: boolean) => void;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ className, pressed, onPressChange, variant = 'outline', ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(e);
      if (!props.disabled) {
        onPressChange?.(!pressed);
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          pressed && 'bg-cyber-primary text-cyber-bg border-cyber-primary shadow-cyber-primary/25',
          className
        )}
        variant={variant}
        onClick={handleClick}
        aria-pressed={pressed}
        {...props}
      />
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

export interface SplitButtonProps {
  label: string;
  onClick: () => void;
  dropdownItems: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
    disabled?: boolean;
  }>;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

import { ChevronDown, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function SplitButton({
  label,
  onClick,
  dropdownItems,
  variant = 'primary',
  size = 'md',
  leftIcon,
  disabled,
  loading,
}: SplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <Button
        variant={variant}
        size={size}
        leftIcon={leftIcon}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
      >
        {label}
      </Button>
      <Menu isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <MenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            rightIcon={<ChevronDown className="h-4 w-4" />}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="rounded-l-none border-l-0"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </MenuTrigger>
        <MenuContent align="end" className="min-w-[160px]">
          {dropdownItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              disabled={item.disabled}
              danger={item.danger}
              icon={item.icon}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  );
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Menu({ isOpen, onClose, children }: DropdownMenuProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed z-50" onClick={onClose}>
      <div className="absolute inset-0" aria-hidden="true" />
      {children}
    </div>
  );
}

function MenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return asChild ? children : <div>{children}</div>;
}

function MenuContent({ children, align = 'start', className }: { children: React.ReactNode; align?: 'start' | 'end'; className?: string }) {
  return (
    <div
      className={cn(
        'absolute top-full mt-1.5 bg-cyber-panel border border-cyber-border rounded-lg shadow-lg py-1.5 animate-in',
        align === 'end' ? 'right-0' : 'left-0'
      )}
    >
      {children}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
  danger,
  icon,
  className: customClassName,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-cyber-elevated focus:outline-none focus:bg-cyber-elevated',
        danger && 'text-cyber-critical hover:bg-cyber-critical/10',
        customClassName
      )}
    >
      {icon && <span className="flex-shrink-0 h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
}