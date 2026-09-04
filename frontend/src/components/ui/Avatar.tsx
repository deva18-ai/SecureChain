import { forwardRef, HTMLAttributes, useMemo, useState, useRef, useEffect } from 'react';
import { X, LogOut, Settings, Shield, User } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/helpers';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away' | null;
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  border?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

const statusColors = {
  online: 'bg-cyber-success',
  offline: 'bg-cyber-textDim',
  busy: 'bg-cyber-critical',
  away: 'bg-cyber-warning',
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({
    src,
    alt,
    fallback,
    size = 'md',
    shape = 'circle',
    status,
    statusPosition = 'bottom-right',
    border = true,
    className,
    ...props
  }, ref) => {
    const initials = useMemo(() => {
      if (!fallback) return '?';
      return fallback
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }, [fallback]);

    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
    const statusClass = status ? cn(
      'absolute border-2 border-cyber-panel',
      statusColors[status],
      statusSizeClasses[size],
      {
        'bottom-0 right-0': statusPosition === 'bottom-right',
        'bottom-0 left-0': statusPosition === 'bottom-left',
        'top-0 right-0': statusPosition === 'top-right',
        'top-0 left-0': statusPosition === 'top-left',
      }
    ) : '';

    const borderClass = border ? 'ring-2 ring-cyber-border' : '';

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center bg-gradient-to-br from-cyber-primary to-cyber-secondary font-medium select-none',
          sizeClasses[size],
          shapeClass,
          borderClass,
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || fallback || 'Avatar'}
            className={cn('w-full h-full object-cover', shapeClass)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
        {status && <span className={statusClass} aria-label={`Status: ${status}`} />}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt?: string; fallback?: string; title?: string }>;
  max?: number;
  size?: AvatarProps['size'];
  overlap?: number;
  className?: string;
}

export function AvatarGroup({ avatars, max = 5, size = 'md', overlap = -8, className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex items-center', className)} role="group" aria-label={`${avatars.length} users`}>
      <div className="flex -space-x-2" style={{ marginLeft: 0 }}>
        {visibleAvatars.map((avatar, index) => (
          <Avatar
            key={index}
            src={avatar.src}
            alt={avatar.alt}
            fallback={avatar.fallback}
            size={size}
            className={cn(
              'border-2 border-cyber-panel',
              index > 0 && `ml-[${overlap}px]`
            )}
            title={avatar.title}
          />
        ))}
        {remainingCount > 0 && (
          <Avatar
            fallback={`${remainingCount}+`}
            size={size}
            className={cn('border-2 border-cyber-panel', `ml-[${overlap}px]`)}
            style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
          />
        )}
      </div>
    </div>
  );
}

export interface UserBadgeProps {
  name: string;
  role?: string;
  avatar?: string;
  fallback?: string;
  size?: AvatarProps['size'];
  showRole?: boolean;
  status?: AvatarProps['status'];
  className?: string;
}

export function UserBadge({ name, role, avatar, fallback, size = 'md', showRole = true, status, className }: UserBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Avatar src={avatar} fallback={fallback || name} size={size} status={status} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-cyber-text truncate">{name}</p>
        {showRole && role && (
          <p className="text-xs text-cyber-textMuted truncate">{role}</p>
        )}
      </div>
    </div>
  );
}

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    fallback?: string;
  };
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
  }>;
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
}

export function UserMenu({ user, items, trigger, align = 'right' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {trigger || (
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar src={user.avatar} fallback={user.fallback || user.name} size="md" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-cyber-text">{user.name}</p>
            <p className="text-xs text-cyber-textMuted">{user.role}</p>
          </div>
          <X className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      )}
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full mt-2 w-56 bg-cyber-panel border border-cyber-border rounded-lg shadow-elevated py-2 animate-in z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="px-4 py-2 border-b border-cyber-border">
            <Avatar src={user.avatar} fallback={user.fallback || user.name} size="md" />
            <div className="ml-3">
              <p className="text-sm font-medium text-cyber-text truncate">{user.name}</p>
              <p className="text-xs text-cyber-textMuted">{user.email}</p>
            </div>
          </div>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => { item.onClick(); setIsOpen(false); }}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                item.danger
                  ? 'text-cyber-critical hover:bg-cyber-critical/10'
                  : 'text-cyber-textMuted hover:bg-cyber-elevated/50 hover:text-cyber-text',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}