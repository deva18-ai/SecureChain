import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield,
  Database,
  Globe,
  Wifi,
  Wallet,
  BookCheck,
  HelpCircle,
  Activity,
  Server,
} from 'lucide-react';

export interface SecurityStatusProps {
  status: 'operational' | 'degraded' | 'critical' | 'unknown';
  label: string;
  description?: string;
  icon?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

const statusConfig = {
  operational: {
    color: 'text-cyber-success',
    bg: 'bg-cyber-success/10',
    border: 'border-cyber-success/30',
    dot: 'status-operational',
    icon: CheckCircle,
  },
  degraded: {
    color: 'text-cyber-warning',
    bg: 'bg-cyber-warning/10',
    border: 'border-cyber-warning/30',
    dot: 'status-warning',
    icon: AlertCircle,
  },
  critical: {
    color: 'text-cyber-critical',
    bg: 'bg-cyber-critical/10',
    border: 'border-cyber-critical/30',
    dot: 'status-critical',
    icon: XCircle,
  },
  unknown: {
    color: 'text-cyber-textDim',
    bg: 'bg-cyber-textDim/10',
    border: 'border-cyber-textDim/30',
    dot: 'status-unknown',
    icon: HelpCircle,
  },
};

export const SecurityStatus = forwardRef<HTMLDivElement, SecurityStatusProps>(
  ({ status, label, description, icon, compact = false, className, ...props }, ref) => {
    const config = statusConfig[status];
    const Icon = icon ? null : config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
          compact ? 'px-2 py-1.5 gap-2' : '',
          config.bg,
          config.border,
          className
        )}
        {...props}
      >
        <div className={cn('flex-shrink-0 flex items-center gap-2', compact && 'gap-1.5')}>
          <span className={cn('status-dot w-2 h-2', config.dot)} />
          {Icon && <Icon className={cn('h-4 w-4', config.color, compact && 'h-3 w-3')} />}
          {icon && <span className={cn(config.color, compact ? 'text-sm' : '')}>{icon}</span>}
        </div>
        {!compact && (
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium', config.color, compact ? 'text-sm' : 'text-base')}>
              {label}
            </p>
            {description && (
              <p className="text-xs text-cyber-textMuted mt-0.5 truncate">{description}</p>
            )}
          </div>
        )}
        {compact && (
          <span className={cn('font-medium text-xs whitespace-nowrap', config.color)}>
            {label}
          </span>
        )}
      </div>
    );
  }
);

SecurityStatus.displayName = 'SecurityStatus';

export interface SecurityMetricProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; up: boolean };
  color?: 'primary' | 'success' | 'warning' | 'critical' | 'secondary';
  className?: string;
}

const metricColors = {
  primary: 'text-cyber-primary bg-cyber-primary/10',
  success: 'text-cyber-success bg-cyber-success/10',
  warning: 'text-cyber-warning bg-cyber-warning/10',
  critical: 'text-cyber-critical bg-cyber-critical/10',
  secondary: 'text-cyber-secondary bg-cyber-secondary/10',
};

export const SecurityMetric = forwardRef<HTMLDivElement, SecurityMetricProps>(
  ({ label, value, icon, trend, color = 'primary', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card p-6 hover:shadow-elevated transition-all duration-200',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-cyber-textMuted">{label}</p>
            <p className="text-3xl font-heading font-bold text-cyber-text mt-1">{value}</p>
          </div>
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', metricColors[color])}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span className={cn('text-sm font-medium', trend.up ? 'text-cyber-success' : 'text-cyber-critical')}>
              {trend.up ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {trend.value}
            </span>
            <span className="text-sm text-cyber-textMuted">vs last period</span>
          </div>
        )}
      </div>
    );
  }
);

SecurityMetric.displayName = 'SecurityMetric';

export interface SystemHealthProps {
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'critical' | 'unknown';
    icon?: React.ReactNode;
    description?: string;
  }>;
  compact?: boolean;
}

export function SystemHealth({ services, compact = false }: SystemHealthProps) {
  const statusConfig = {
    operational: { color: 'text-cyber-success', dot: 'status-operational', label: 'Operational' },
    degraded: { color: 'text-cyber-warning', dot: 'status-warning', label: 'Degraded' },
    critical: { color: 'text-cyber-critical', dot: 'status-critical', label: 'Critical' },
    unknown: { color: 'text-cyber-textDim', dot: 'status-unknown', label: 'Unknown' },
  };

  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      {services.map((service) => {
        const config = statusConfig[service.status];
        const Icon = service.icon || (
          service.name === 'API' ? <Server className="h-4 w-4" /> :
          service.name === 'Database' ? <Database className="h-4 w-4" /> :
          service.name === 'Blockchain' ? <Globe className="h-4 w-4" /> :
          service.name === 'Authentication' ? <Shield className="h-4 w-4" /> :
          service.name === 'Audit' ? <BookCheck className="h-4 w-4" /> :
          service.name === 'Wallet' ? <Wallet className="h-4 w-4" /> :
          <Wifi className="h-4 w-4" />
        );

        return (
          <div key={service.name} className={cn(
            'flex items-center justify-between p-3 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50',
            compact && 'px-2 py-1.5'
          )}>
            <div className="flex items-center gap-3">
              {Icon}
              <div>
                <p className={cn('font-medium', compact ? 'text-sm' : 'text-base', 'text-cyber-text')}>
                  {service.name}
                </p>
                {service.description && !compact && (
                  <p className="text-xs text-cyber-textMuted">{service.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('status-dot w-2 h-2', config.dot)} />
              <span className={cn('font-medium text-xs', config.color)}>
                {config.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface VerificationBadgeProps {
  verified: boolean;
  blockchainVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerificationBadge({ verified, blockchainVerified, size = 'md', showLabel = true }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  if (blockchainVerified) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 font-medium rounded-full border', sizeClasses[size], 'bg-cyber-success/10 text-cyber-success border-cyber-success/30')}>
        <CheckCircle className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5', size === 'lg' && 'h-4 w-4')} />
        {showLabel && 'Blockchain Verified'}
      </span>
    );
  }

  if (verified) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 font-medium rounded-full border', sizeClasses[size], 'bg-cyber-success/10 text-cyber-success border-cyber-success/30')}>
        <Shield className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5', size === 'lg' && 'h-4 w-4')} />
        {showLabel && 'Verified'}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium rounded-full border', sizeClasses[size], 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/30')}>
      <AlertCircle className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5', size === 'lg' && 'h-4 w-4')} />
      {showLabel && 'Pending'}
    </span>
  );
}

export interface ThreatLevelProps {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  label?: string;
}

const threatColors = {
  none: { color: 'text-cyber-success', bg: 'bg-cyber-success/10', border: 'border-cyber-success/30' },
  low: { color: 'text-cyber-success', bg: 'bg-cyber-success/10', border: 'border-cyber-success/30' },
  medium: { color: 'text-cyber-warning', bg: 'bg-cyber-warning/10', border: 'border-cyber-warning/30' },
  high: { color: 'text-cyber-critical', bg: 'bg-cyber-critical/10', border: 'border-cyber-critical/30' },
  critical: { color: 'text-cyber-critical', bg: 'bg-cyber-critical/20', border: 'border-cyber-critical/50' },
};

export function ThreatLevel({ level, label }: ThreatLevelProps) {
  const config = threatColors[level];
  const labels = {
    none: 'No Threat',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium border', config.bg, config.border, config.color)}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label || labels[level]}
    </span>
  );
}

export interface AuditEventProps {
  event: {
    action: string;
    resource_type: string;
    resource_id: string;
    actor: string;
    created_at: string;
    blockchain_tx_hash?: string | null;
    blockchain_verified?: boolean;
  };
  compact?: boolean;
}

export function AuditEvent({ event, compact = false }: AuditEventProps) {
  const actionColors: Record<string, string> = {
    IDENTITY_CREATED: 'text-cyber-primary',
    IDENTITY_VERIFIED: 'text-cyber-success',
    ROLE_ASSIGNED: 'text-cyber-primary',
    ROLE_REVOKED: 'text-cyber-warning',
    ASSET_MINTED: 'text-cyber-primary',
    ASSET_ALLOCATED: 'text-cyber-success',
    ASSET_TRANSFERRED: 'text-cyber-primary',
    ASSET_BURNED: 'text-cyber-critical',
    ASSET_FROZEN: 'text-cyber-warning',
    ASSET_UNFROZEN: 'text-cyber-success',
    USER_CREATED: 'text-cyber-primary',
    USER_UPDATED: 'text-cyber-primary',
    LOGIN: 'text-cyber-textMuted',
    LOGOUT: 'text-cyber-textMuted',
  };

  const color = actionColors[event.action] || 'text-cyber-text';

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-elevated/50 transition-colors',
      compact && 'px-2 py-1.5 gap-2'
    )}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', compact && 'w-8 h-8')}>
        <span className={cn('bg-current/10', color)}>
          <Activity className="h-5 w-5" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', compact ? 'text-sm' : 'text-base', 'text-cyber-text')}>
          {event.action.replace(/_/g, ' ')}
        </p>
        <p className={cn('text-xs text-cyber-textMuted', compact && 'truncate')}>
          {event.resource_type}: {event.resource_id} • {event.actor}
        </p>
      </div>
      <div className="flex items-center gap-2 text-right">
        {event.blockchain_tx_hash && (
          <span className="font-mono text-xs text-cyber-success">
            {event.blockchain_tx_hash.slice(0, 10)}...
          </span>
        )}
        <VerificationBadge verified={event.blockchain_verified || false} size="sm" showLabel={!compact} />
        <span className={cn('text-xs text-cyber-textMuted whitespace-nowrap', compact && 'hidden')}>
          {new Date(event.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export interface TransactionHashProps {
  hash: string;
  length?: number;
  verified?: boolean;
  onClick?: () => void;
}

export function TransactionHash({ hash, length = 6, verified = false, onClick }: TransactionHashProps) {
  const displayHash = hash.length > length * 2 + 2
    ? `${hash.slice(0, length + 2)}...${hash.slice(-length)}`
    : hash;

  return (
    <span
      className={cn(
        'font-mono inline-flex items-center gap-1 cursor-pointer hover:text-cyber-primary transition-colors',
        verified && 'text-cyber-success',
        onClick && 'underline-offset-2 hover:underline'
      )}
      onClick={onClick}
    >
      {displayHash}
      {verified && <BookCheck className="h-3 w-3 text-cyber-success" />}
    </span>
  );
}

export interface WalletAddressProps {
  address: string;
  length?: number;
  label?: string;
  onClick?: () => void;
}

export function WalletAddress({ address, length = 4, label, onClick }: WalletAddressProps) {
  const displayAddress = address.length > length * 2 + 2
    ? `${address.slice(0, length + 2)}...${address.slice(-length)}`
    : address;

  return (
    <span
      className={cn(
        'font-mono inline-flex items-center gap-1 cursor-pointer hover:text-cyber-primary transition-colors',
        onClick && 'underline-offset-2 hover:underline'
      )}
      onClick={onClick}
      title={label || address}
    >
      {displayAddress}
    </span>
  );
}

export interface CopyButtonProps {
  text: string;
  label?: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

export function CopyButton({ text, label = 'Copy', onSuccess, children, variant = 'ghost', size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onSuccess?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className="gap-1"
    >
      {copied ? <Check className="h-4 w-4 text-cyber-success" /> : <Copy className="h-4 w-4" />}
      {children || (copied ? 'Copied!' : label)}
    </Button>
  );
}

export interface StatusIndicatorProps {
  status: 'operational' | 'degraded' | 'critical' | 'unknown' | 'pending' | 'verified';
  label?: string;
  animated?: boolean;
}

const statusIndicatorConfig = {
  operational: { color: 'text-cyber-success', bg: 'bg-cyber-success', label: 'Operational' },
  degraded: { color: 'text-cyber-warning', bg: 'bg-cyber-warning', label: 'Degraded' },
  critical: { color: 'text-cyber-critical', bg: 'bg-cyber-critical', label: 'Critical' },
  unknown: { color: 'text-cyber-textDim', bg: 'bg-cyber-textDim', label: 'Unknown' },
  pending: { color: 'text-cyber-warning', bg: 'bg-cyber-warning', label: 'Pending' },
  verified: { color: 'text-cyber-success', bg: 'bg-cyber-success', label: 'Verified' },
};

export function StatusIndicator({ status, label, animated = true }: StatusIndicatorProps) {
  const config = statusIndicatorConfig[status];

  // Extract the color from the bg class (e.g., 'bg-cyber-success' -> 'cyber-success')
  const colorClass = config.bg.replace('bg-', '');
  const bgClass = `bg-${colorClass}/10`;
  const textClass = `text-${colorClass}`;
  const borderClass = `border-${colorClass}/30`;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', bgClass, textClass, borderClass)}>
      <span className={cn('w-2 h-2 rounded-full', config.bg, animated && 'animate-pulse')} />
      {label || config.label}
    </span>
  );
}

export interface ResourceCardProps {
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color?: string;
}

import { Link } from 'react-router-dom';

export function ResourceCard({ name, category, description, icon, url, color = 'cyber-primary' }: ResourceCardProps) {
  return (
    <Link
      to={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover p-6 group"
    >
      <div className="flex items-start gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', `bg-${color}/10 text-${color}`)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('badge', `bg-${color}/10 text-${color} border-${color}/30`)}>
              {category}
            </span>
          </div>
          <h3 className="font-heading font-semibold text-cyber-text mb-1 group-hover:text-cyber-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-cyber-textMuted line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
}