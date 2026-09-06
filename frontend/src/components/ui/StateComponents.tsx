import { ReactNode } from 'react';
import { cn } from '../../utils/helpers';
import {
  Box,
  FileText,
  Search,
  AlertTriangle,
  WifiOff,
  Shield,
  Wallet,
  Blocks,
  Activity,
  Settings,
  UserCog,
  BookOpen,
  RefreshCw,
  Plus,
  Link as LinkIcon,
  Loader2,
  XCircle,
  CheckCircle,
  Info,
  Home,
} from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: 'default' | 'search' | 'folder' | 'shield' | 'wallet' | 'chain' | 'activity' | 'users' | 'settings' | 'book';
}

const illustrations = {
  default: <Box className="h-16 w-16 text-cyber-border mx-auto" />,
  search: <Search className="h-16 w-16 text-cyber-border mx-auto" />,
  folder: <FileText className="h-16 w-16 text-cyber-border mx-auto" />,
  shield: <Shield className="h-16 w-16 text-cyber-border mx-auto" />,
  wallet: <Wallet className="h-16 w-16 text-cyber-border mx-auto" />,
  chain: <Blocks className="h-16 w-16 text-cyber-border mx-auto" />,
  activity: <Activity className="h-16 w-16 text-cyber-border mx-auto" />,
  users: <UserCog className="h-16 w-16 text-cyber-border mx-auto" />,
  settings: <Settings className="h-16 w-16 text-cyber-border mx-auto" />,
  book: <BookOpen className="h-16 w-16 text-cyber-border mx-auto" />,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration = 'default',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="mb-6">
        {icon || illustrations[illustration]}
      </div>
      <h3 className="text-lg font-heading font-semibold text-cyber-text mb-2">{title}</h3>
      {description && (
        <p className="text-cyber-textMuted max-w-sm mx-auto mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              className="w-full sm:w-auto"
              leftIcon={action.variant === 'primary' ? <Plus className="h-4 w-4" /> : undefined}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function TableEmptyState({ title = 'No data available', description, action, illustration = 'folder' }: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  illustration?: EmptyStateProps['illustration'];
}) {
  return (
    <div className="py-16 px-4">
      <EmptyState
        title={title}
        description={description}
        action={action}
        illustration={illustration}
      />
    </div>
  );
}

export function CardEmptyState({ title = 'Nothing here yet', description, action, illustration = 'default' }: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  illustration?: EmptyStateProps['illustration'];
}) {
  return (
    <div className="p-8">
      <EmptyState
        title={title}
        description={description}
        action={action}
        illustration={illustration}
      />
    </div>
  );
}

export const pageEmptyStates = {
  identities: () => (
    <EmptyState
      illustration="shield"
      title="No identities found"
      description="Create your first decentralized identifier to get started with secure digital identity management."
      action={{ label: 'Create DID', onClick: () => {}, variant: 'primary' }}
    />
  ),
  assets: () => (
    <EmptyState
      illustration="wallet"
      title="No digital assets yet"
      description="Mint your first NFT asset to begin building your digital portfolio."
      action={{ label: 'Mint Asset', onClick: () => {}, variant: 'primary' }}
    />
  ),
  transfers: () => (
    <EmptyState
      illustration="chain"
      title="No transfers initiated"
      description="Start a new transfer request to move asset ownership between parties."
      action={{ label: 'New Transfer', onClick: () => {}, variant: 'primary' }}
    />
  ),
  audit: () => (
    <EmptyState
      illustration="activity"
      title="No audit logs found"
      description="Audit logs will appear here as actions are performed across the platform."
    />
  ),
  blockchain: () => (
    <EmptyState
      illustration="chain"
      title="Blockchain not connected"
      description="Connect to a blockchain node to explore blocks, transactions, and smart contract events."
      action={{ label: 'Check Connection', onClick: () => {}, variant: 'outline' }}
    />
  ),
  users: () => (
    <EmptyState
      illustration="users"
      title="No users found"
      description="Invite team members to start collaborating on the platform."
      action={{ label: 'Invite User', onClick: () => {}, variant: 'primary' }}
    />
  ),
  'my-assets': () => (
    <EmptyState
      illustration="wallet"
      title="You don't own any assets yet"
      description="Assets allocated to you will appear here. Browse available assets to get started."
      action={{ label: 'Browse Assets', onClick: () => {}, variant: 'primary' }}
      secondaryAction={{ label: 'Learn More', onClick: () => {} }}
    />
  ),
  'my-transfers': () => (
    <EmptyState
      illustration="chain"
      title="No transfer requests"
      description="Your initiated and received transfer requests will appear here."
    />
  ),
  'my-activity': () => (
    <EmptyState
      illustration="activity"
      title="No activity yet"
      description="Your personal activity log will appear here as you interact with the platform."
    />
  ),
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string | number;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'page';
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  code,
  onRetry,
  onGoHome,
  className,
  variant = 'default',
}: ErrorStateProps) {
  const variants = {
    default: 'flex flex-col items-center justify-center text-center py-12 px-4',
    inline: 'flex flex-col items-center text-center py-8 px-4',
    page: 'min-h-[60vh] flex flex-col items-center justify-center text-center px-4',
  };

  return (
    <div className={cn(variants[variant], className)}>
      <div className="w-16 h-16 rounded-full bg-cyber-critical/10 flex items-center justify-center mb-6">
        <XCircle className="h-8 w-8 text-cyber-critical" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-cyber-text mb-2">{title}</h3>
      <p className="text-cyber-textMuted max-w-sm mx-auto mb-6">{message}</p>
      {code && (
        <p className="text-xs text-cyber-textDim font-mono mb-6 px-3 py-1 bg-cyber-elevated rounded">
          Error code: {code}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button
            variant="outline"
            onClick={onGoHome}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  overlay?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  variant = 'spinner',
  className,
  overlay = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: { spinner: 'h-5 w-5', dots: 'h-1.5 w-1.5', text: 'text-xs' },
    md: { spinner: 'h-8 w-8', dots: 'h-2 w-2', text: 'text-sm' },
    lg: { spinner: 'h-12 w-12', dots: 'h-3 w-3', text: 'text-base' },
  };

  const spinner = (
    <Loader2 className={cn('animate-spin text-cyber-primary', sizeClasses[size].spinner)} aria-hidden="true" />
  );

  const dots = (
    <div className="flex items-center gap-1" aria-hidden="true">
      <span className={cn('rounded-full bg-cyber-primary animate-bounce', sizeClasses[size].dots)} style={{ animationDelay: '0ms' }} />
      <span className={cn('rounded-full bg-cyber-primary animate-bounce', sizeClasses[size].dots)} style={{ animationDelay: '150ms' }} />
      <span className={cn('rounded-full bg-cyber-primary animate-bounce', sizeClasses[size].dots)} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const pulse = (
    <div className={cn('animate-pulse bg-cyber-elevated rounded', sizeClasses[size].spinner)} aria-hidden="true" />
  );

  const content = (
    <div className="flex flex-col items-center gap-3">
      {variant === 'spinner' && spinner}
      {variant === 'dots' && dots}
      {variant === 'pulse' && pulse}
      {variant === 'skeleton' && (
        <div className="w-48 h-4 bg-cyber-elevated animate-pulse rounded" />
      )}
      <span className={cn('text-cyber-textMuted', sizeClasses[size].text)}>{message}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className={cn('fixed inset-0 bg-cyber-panel/80 backdrop-blur-sm flex items-center justify-center z-50', className)}>
        {content}
      </div>
    );
  }

  return <div className={cn('flex items-center justify-center', className)}>{content}</div>;
}

export function PageLoading({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingState message={message} size="lg" variant="dots" />
    </div>
  );
}

export function InlineLoading({ message = 'Loading...' }: { message?: string }) {
  return <LoadingState message={message} size="sm" variant="dots" className="py-4" />;
}

export function ButtonLoading({ children }: { children?: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {children}
    </span>
  );
}

export function SuccessState({
  title = 'Success!',
  message,
  onContinue,
  continueLabel = 'Continue',
  className,
}: {
  title?: string;
  message?: string;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-cyber-success/10 flex items-center justify-center mb-6">
        <CheckCircle className="h-8 w-8 text-cyber-success" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-cyber-text mb-2">{title}</h3>
      {message && <p className="text-cyber-textMuted max-w-sm mx-auto mb-6">{message}</p>}
      {onContinue && (
        <Button onClick={onContinue} variant="primary">
          {continueLabel}
        </Button>
      )}
    </div>
  );
}

export function InfoState({
  title,
  message,
  action,
  className,
}: {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-8 px-4', className)}>
      <div className="w-12 h-12 rounded-full bg-cyber-primary/10 flex items-center justify-center mb-4">
        <Info className="h-6 w-6 text-cyber-primary" />
      </div>
      <h3 className="text-base font-heading font-semibold text-cyber-text mb-1">{title}</h3>
      {message && <p className="text-cyber-textMuted text-sm max-w-sm mx-auto mb-4">{message}</p>}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function WarningState({
  title,
  message,
  action,
  dismissAction,
  className,
}: {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  dismissAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3 p-4 bg-cyber-warning/10 border border-cyber-warning/30 rounded-lg', className)}>
      <AlertTriangle className="h-5 w-5 text-cyber-warning flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-cyber-text">{title}</h3>
        {message && <p className="text-sm text-cyber-textMuted mt-1">{message}</p>}
        {action && (
          <Button variant="warning" size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
      {dismissAction && (
        <button onClick={dismissAction} className="text-cyber-warning hover:text-cyber-warning/70 flex-shrink-0">
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-cyber-warning/10 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-10 w-10 text-cyber-warning" />
        </div>
        <h2 className="text-xl font-heading font-bold text-cyber-text mb-2">You're Offline</h2>
        <p className="text-cyber-textMuted mb-6 max-w-sm mx-auto">
          No internet connection detected. Please check your network and try again.
        </p>
        {onRetry && (
          <Button variant="primary" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

export function MaintenanceState({ message = 'We\'ll be back soon!' }: { message?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-cyber-primary/10 flex items-center justify-center mx-auto mb-6">
          <Settings className="h-10 w-10 text-cyber-primary animate-spin" />
        </div>
        <h2 className="text-xl font-heading font-bold text-cyber-text mb-2">Under Maintenance</h2>
        <p className="text-cyber-textMuted mb-6 max-w-sm mx-auto">{message}</p>
        <p className="text-xs text-cyber-textDim">Please check back in a few minutes.</p>
      </div>
    </div>
  );
}

export function NotFoundState({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-heading font-bold text-cyber-primary/20 mb-4">404</div>
        <h2 className="text-xl font-heading font-bold text-cyber-text mb-2">Page Not Found</h2>
        <p className="text-cyber-textMuted mb-6 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={onGoHome || (() => window.location.href = '/')} leftIcon={<Home className="h-4 w-4" />}>
            Go Home
          </Button>
          <Button variant="ghost" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UnauthorizedState({ onLogin, onGoHome }: { onLogin?: () => void; onGoHome?: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-cyber-critical/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-cyber-critical" />
        </div>
        <h2 className="text-xl font-heading font-bold text-cyber-text mb-2">Access Denied</h2>
        <p className="text-cyber-textMuted mb-6 max-w-sm mx-auto">
          You don't have permission to access this page. Please log in with appropriate credentials.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onLogin && <Button variant="primary" onClick={onLogin} leftIcon={<LinkIcon className="h-4 w-4" />}>Log In</Button>}
          {onGoHome && <Button variant="outline" onClick={onGoHome} leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>}
        </div>
      </div>
    </div>
  );
}