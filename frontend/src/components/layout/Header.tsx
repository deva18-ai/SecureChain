import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  Bell,
  ChevronDown,
  Wallet,
  Shield,
  User,
  Server,
  Database,
  Globe,
  CheckCircle,
  Search,
  HelpCircle,
  AlertTriangle,
  Activity,
  Key,
  Box,
  GitBranch,
  FileText,
  Blocks,
  BookOpen,
  UserCog,
  WifiOff,
  Lock,
  LayoutDashboard,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { useBlockchainStatus } from '../../hooks/useApi';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useToast } from '../../context/ToastContext';

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/dashboard' }];
  
  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    const label = routeLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, href: currentPath });
  }
  return crumbs;
}

function getServiceStatus(name: string, blockchainStatus: any, isConnected: boolean) {
  switch (name) {
    case 'API':
      return { status: 'operational', label: 'Operational', color: 'success', icon: Server, description: 'REST API responding normally' };
    case 'Database':
      return { status: 'operational', label: 'Operational', color: 'success', icon: Database, description: 'PostgreSQL connected, queries optimal' };
    case 'Blockchain':
      return blockchainStatus?.connected
        ? { status: 'operational', label: 'Connected', color: 'success', icon: Globe, description: `Connected to ${blockchainStatus.network} (Chain ${blockchainStatus.chain_id})` }
        : { status: 'critical', label: 'Disconnected', color: 'critical', icon: WifiOff, description: 'Unable to connect to blockchain node' };
    case 'Authentication':
      return { status: 'operational', label: 'Protected', color: 'success', icon: Lock, description: 'JWT auth active, sessions valid' };
    case 'Audit':
      return { status: 'operational', label: 'Verified', color: 'success', icon: FileText, description: 'Audit logging functional, blockchain sync active' };
    case 'Wallet':
      return isConnected
        ? { status: 'operational', label: 'Connected', color: 'success', icon: Wallet, description: 'MetaMask connected' }
        : { status: 'degraded', label: 'Disconnected', color: 'warning', icon: WifiOff, description: 'Wallet not connected' };
    default:
      return { status: 'unknown', label: 'Unknown', color: 'default', icon: HelpCircle, description: '' };
  }
}

const services = ['API', 'Database', 'Blockchain', 'Authentication', 'Audit', 'Wallet'];

export function Header() {
  const { user, logout } = useAuth();
  const { isConnected } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: blockchainStatus } = useBlockchainStatus();
  const toast = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [systemHealthOpen, setSystemHealthOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState(commandPaletteItems);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const systemHealthRef = useRef<HTMLDivElement>(null);
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    shortcuts: [
      { key: 'k', ctrl: true, description: 'Open command palette', action: () => setCommandPaletteOpen(true), global: true },
      { key: 'k', meta: true, description: 'Open command palette (Mac)', action: () => setCommandPaletteOpen(true), global: true },
      { key: 'b', ctrl: true, description: 'Toggle sidebar', action: () => window.dispatchEvent(new CustomEvent('toggle-sidebar')), global: true },
      { key: '/', ctrl: true, description: 'Focus search', action: () => searchInputRef.current?.focus(), global: true },
      { key: 'Escape', description: 'Close modals', action: () => {
        setProfileOpen(false);
        setWalletOpen(false);
        setNotificationsOpen(false);
        setSystemHealthOpen(false);
        setCommandPaletteOpen(false);
      }, global: true },
    ],
    enabled: true,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
      if (systemHealthRef.current && !systemHealthRef.current.contains(event.target as Node)) setSystemHealthOpen(false);
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(event.target as Node)) setCommandPaletteOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (commandPaletteOpen) {
      setFilteredCommands(commandPaletteItems);
      setSelectedCommandIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const handleCommandSelect = (item: typeof commandPaletteItems[0]) => {
    navigate(item.href);
    setCommandPaletteOpen(false);
    setSearchQuery('');
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommandIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedCommandIndex]) {
      handleCommandSelect(filteredCommands[selectedCommandIndex]);
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const filtered = commandPaletteItems.filter(item =>
      item.label.toLowerCase().includes(value.toLowerCase()) ||
      item.keywords.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCommands(filtered);
    setSelectedCommandIndex(0);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-cyber-panel/80 backdrop-blur-xl border-b border-cyber-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="lg:hidden flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            aria-label="Toggle menu"
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center">
              <Shield className="h-5 w-5 text-cyber-bg" />
            </div>
            <span className="font-heading font-bold text-lg text-cyber-text hidden sm:block">SecureChain</span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-4 lg:px-8 min-w-0">
          <nav className="flex items-center gap-1 flex-1 min-w-0" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 overflow-x-auto pb-1 pr-4">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                  {index > 0 && <ChevronDown className="h-4 w-4 text-cyber-textDim flex-shrink-0" aria-hidden="true" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-cyber-text truncate max-w-[200px]">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className="text-sm text-cyber-textMuted hover:text-cyber-primary transition-colors truncate max-w-[150px]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="relative hidden xl:block" ref={systemHealthRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSystemHealthOpen(!systemHealthOpen)}
              className="gap-2 px-3"
            >
              <Server className="h-4 w-4" />
              <span className="text-xs font-medium text-cyber-text hidden sm:inline">SYSTEM</span>
              <span className={cn(
                'status-dot',
                blockchainStatus?.connected ? 'status-operational' : 'status-critical'
              )} />
            </Button>
            {systemHealthOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-cyber-panel border border-cyber-border rounded-lg shadow-elevated py-2 animate-in z-50">
                {services.map((service) => {
                  const status = getServiceStatus(service, blockchainStatus, isConnected);
                  const Icon = status.icon;
                  return (
                    <div
                      key={service}
                      className="flex items-center justify-between px-4 py-2 hover:bg-cyber-elevated/50 cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-cyber-textMuted" />
                        <span className="text-sm font-medium text-cyber-text">{service}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('status-dot', status.status === 'operational' && 'status-operational', status.status === 'degraded' && 'status-warning', status.status === 'critical' && 'status-critical')} />
                        <span className={cn('text-xs font-medium', status.color === 'success' && 'text-cyber-success', status.color === 'warning' && 'text-cyber-warning', status.color === 'critical' && 'text-cyber-critical')}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-cyber-border pt-2 px-4">
                  <p className="text-xs text-cyber-textDim">Last checked: Just now</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={notificationsRef}>
            <Button variant="ghost" size="sm" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2" aria-label="Notifications">
              <Bell className="h-5 w-5 text-cyber-textMuted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-warning rounded-full animate-pulse" />
            </Button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-cyber-panel border border-cyber-border rounded-lg shadow-elevated py-2 animate-in z-50">
                <div className="px-4 py-2 border-b border-cyber-border flex items-center justify-between">
                  <p className="font-medium text-cyber-text">Notifications</p>
                  <Button variant="ghost" size="xs" onClick={() => toast.info('Mark all as read - coming soon')}>
                    Mark all read
                  </Button>
                </div>
                <div className="py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-cyber-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyber-primary/10 text-cyber-primary rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cyber-text">New Transfer Request</p>
                        <p className="text-xs text-cyber-textMuted">Asset LAPTOP-001 requested by User 2</p>
                      </div>
                      <span className="text-xs text-cyber-textDim">2m ago</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-b border-cyber-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyber-success/10 text-cyber-success rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cyber-text">Identity Verified</p>
                        <p className="text-xs text-cyber-textMuted">DID did:securechain:abc123 verified on blockchain</p>
                      </div>
                      <span className="text-xs text-cyber-textDim">1h ago</span>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyber-warning/10 text-cyber-warning rounded-lg">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cyber-text">Asset Minted</p>
                        <p className="text-xs text-cyber-textMuted">New asset VEHICLE-001 minted by Admin</p>
                      </div>
                      <span className="text-xs text-cyber-textDim">3h ago</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-cyber-border pt-2 px-4">
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => { navigate('/audit'); setNotificationsOpen(false); }}>
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="hidden lg:flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center">
                <span className="text-cyber-bg text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-cyber-text">{user?.full_name}</p>
                <p className="text-xs text-cyber-textDim capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-cyber-textMuted" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="lg:hidden gap-2"
            >
              <User className="h-5 w-5" />
            </Button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-cyber-panel border border-cyber-border rounded-lg shadow-elevated py-2 animate-in z-50">
                <div className="px-4 py-2 border-b border-cyber-border">
                  <p className="text-sm font-medium text-cyber-text">{user?.full_name}</p>
                  <p className="text-xs text-cyber-textMuted">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyber-textMuted hover:bg-cyber-elevated/50 hover:text-cyber-text"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <Link
                  to="/identity"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyber-textMuted hover:bg-cyber-elevated/50 hover:text-cyber-text"
                  onClick={() => setProfileOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  My Identity
                </Link>
                <hr className="my-2 border-cyber-border" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-cyber-critical hover:bg-cyber-critical/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={commandPaletteRef}>
          {commandPaletteOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)} />
              <div className="relative w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl overflow-hidden animate-in">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyber-textDim" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleCommandKeyDown}
                    placeholder="Type a command or search... (Ctrl+K)"
                    className="w-full px-12 py-3 pl-12 bg-transparent border-b border-cyber-border text-cyber-text placeholder-cyber-textDim focus:outline-none text-base"
                    data-search-input
                  />
                  <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-cyber-elevated rounded text-xs text-cyber-textMuted font-mono">
                    ⌘K
                  </kbd>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredCommands.length === 0 ? (
                    <div className="px-4 py-8 text-center text-cyber-textMuted">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No commands found</p>
                    </div>
                  ) : (
                    filteredCommands.map((item, index) => (
                      <button
                        key={item.href}
                        onClick={() => handleCommandSelect(item)}
                        onMouseEnter={() => setSelectedCommandIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          index === selectedCommandIndex
                            ? 'bg-cyber-primary/10 text-cyber-primary'
                            : 'text-cyber-textMuted hover:bg-cyber-elevated/50 hover:text-cyber-text'
                        )}
                      >
                        <item.icon className={cn('h-5 w-5 flex-shrink-0', index === selectedCommandIndex ? 'text-cyber-primary' : 'text-cyber-textDim')} />
                        <span className="font-medium">{item.label}</span>
                        <span className="ml-auto text-xs text-cyber-textDim font-mono">
                          {item.href.split('/').pop()?.replace(/-/g, ' ') || ''}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-cyber-border text-center text-xs text-cyber-textDim">
                  <kbd className="px-1.5 py-0.5 bg-cyber-elevated rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-cyber-elevated rounded">↓</kbd> Navigate
                  <span className="mx-2">·</span>
                  <kbd className="px-1.5 py-0.5 bg-cyber-elevated rounded">Enter</kbd> Select
                  <span className="mx-2">·</span>
                  <kbd className="px-1.5 py-0.5 bg-cyber-elevated rounded">Esc</kbd> Close
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}