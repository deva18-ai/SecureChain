import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import {
  LayoutDashboard,
  Shield,
  Key,
  Box,
  GitBranch,
  FileText,
  Blocks,
  Settings,
  UserCog,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Activity,
  Wallet,
  BookOpen,
  ChevronLeft,
  ChevronDown,
  LogOut,
  HelpCircle,
  Bell,
  Badge as LucideBadge,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string | number;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'critical';
  description?: string;
  external?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
  icon?: React.ComponentType<{ className?: string }>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const navigation: NavSection[] = [
  {
    label: 'Security Infrastructure',
    icon: ShieldCheck,
    defaultExpanded: true,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'], description: 'Security overview & metrics' },
      { name: 'Security Center', href: '/security-center', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'], description: 'Threat monitoring & alerts' },
    ],
  },
  {
    label: 'Identity',
    icon: Key,
    defaultExpanded: true,
    items: [
      { name: 'Identities', href: '/identities', icon: Key, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'], description: 'Manage DIDs & verification' },
      { name: 'My Identity', href: '/identity', icon: Shield, roles: ['USER'], description: 'Your personal DID' },
    ],
  },
  {
    label: 'Assets',
    icon: Box,
    defaultExpanded: true,
    items: [
      { name: 'Digital Assets', href: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'], description: 'Browse all NFT assets' },
      { name: 'My Assets', href: '/my-assets', icon: Wallet, roles: ['USER'], description: 'Your owned assets' },
      { name: 'Transfers', href: '/transfers', icon: GitBranch, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'], description: 'Manage transfers' },
      { name: 'Transfer Requests', href: '/my-transfers', icon: GitBranch, roles: ['USER'], description: 'Your pending requests' },
    ],
  },
  {
    label: 'Blockchain',
    icon: Blocks,
    defaultExpanded: true,
    items: [
      { name: 'Blockchain Explorer', href: '/blockchain', icon: Blocks, roles: ['ADMIN', 'AUDITOR'], description: 'View blocks & transactions' },
      { name: 'Transactions', href: '/transactions', icon: Activity, roles: ['ADMIN', 'AUDITOR'], description: 'Transaction history' },
    ],
  },
  {
    label: 'Audit',
    icon: FileText,
    defaultExpanded: true,
    items: [
      { name: 'Audit Trail', href: '/audit', icon: FileText, roles: ['ADMIN', 'AUDITOR'], description: 'Immutable audit logs' },
      { name: 'My Activity', href: '/my-activity', icon: Activity, roles: ['USER'], description: 'Your activity log' },
    ],
  },
  {
    label: 'Administration',
    icon: Settings,
    defaultExpanded: false,
    items: [
      { name: 'Users', href: '/admin/users', icon: UserCog, roles: ['ADMIN'], description: 'User management' },
      { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield, roles: ['ADMIN'], description: 'RBAC configuration' },
      { name: 'System Configuration', href: '/admin/config', icon: Settings, roles: ['ADMIN'], description: 'System settings' },
    ],
  },
  {
    label: 'Resources',
    icon: BookOpen,
    defaultExpanded: false,
    items: [
      { name: 'Cybersecurity Resources', href: '/security-resources', icon: BookOpen, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'], description: 'Guides & best practices' },
    ],
  },
];

export function Sidebar() {
  const { user, hasRole } = useAuth();
  const { isConnected, connect, disconnect } = useWallet();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLAsideElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useKeyboardShortcuts({
    shortcuts: [
      { key: 'b', ctrl: true, description: 'Toggle sidebar', action: () => setIsCollapsed(!isCollapsed), global: true },
      { key: '/', ctrl: true, description: 'Focus search', action: () => {}, global: true },
    ],
    enabled: true,
  });

  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => hasRole(item.roles as any)),
  })).filter(section => section.items.length > 0);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isSectionExpanded = (label: string) => expandedSections[label] ?? true;

  const handleMobileItemClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        ref={mobileMenuButtonRef}
        className="lg:hidden fixed top-4 left-4 z-50 btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        ref={sidebarRef}
        id="sidebar"
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 bg-cyber-panel border-r border-cyber-border flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-cyber-border">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="SecureChain Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-cyber-bg" />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-bold text-lg text-cyber-text">SecureChain</span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              className="lg:hidden btn-ghost p-1"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="p-1.5"
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main">
          {filteredNavigation.map((section) => {
            const isExpanded = isSectionExpanded(section.label);
            const SectionIcon = section.icon;

            return (
              <div key={section.label} className="group">
                <button
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cyber-textDim hover:text-cyber-text transition-colors',
                    isCollapsed && 'justify-center'
                  )}
                  onClick={() => !isCollapsed && section.collapsible !== false && toggleSection(section.label)}
                  aria-expanded={isExpanded}
                  disabled={isCollapsed || section.collapsible === false}
                  aria-label={isCollapsed ? 'Expand sidebar to view section' : `Toggle ${section.label} section`}
                >
                  {!isCollapsed && SectionIcon && (
                    <SectionIcon className="h-4 w-4 flex-shrink-0 text-cyber-textDim" aria-hidden="true" />
                  )}
                  <span className={cn('truncate', isCollapsed && 'hidden')}>
                    {isCollapsed ? section.label.charAt(0) : section.label}
                  </span>
                  {!isCollapsed && section.collapsible !== false && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-cyber-textDim transition-transform flex-shrink-0',
                        isExpanded ? 'rotate-180' : ''
                      )}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {!isCollapsed && (section.collapsible === false || isExpanded) && (
                  <div className="mt-1 space-y-0.5 animate-in">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          onClick={handleMobileItemClick}
                          className={({ isActive: navActive }) => cn(
                            'sidebar-link relative group',
                            navActive && 'sidebar-link-active',
                            item.badge && 'pr-8'
                          )}
                          end={item.href === '/dashboard'}
                          aria-current={isActive ? 'page' : undefined}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{item.name}</span>
                          {item.badge && !isCollapsed && (
                            <Badge
                              variant={item.badgeVariant || 'primary'}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-cyber-border space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyber-elevated/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-cyber-bg font-medium text-sm">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cyber-text truncate">{user?.full_name}</p>
                <p className="text-xs text-cyber-textDim capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <div className="flex-1 flex items-center gap-2">
                <span className={cn(
                  'flex-1 text-xs px-2 py-1 rounded border',
                  isConnected
                    ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/30'
                    : 'bg-cyber-warning/10 text-cyber-warning border-cyber-warning/30'
                )}>
                  <span className="flex items-center gap-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-cyber-success' : 'bg-cyber-warning')} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </span>
              </div>
            )}
            {!isConnected ? (
              !isCollapsed && (
                <Button variant="outline" size="sm" onClick={connect} className="w-full">
                  Connect Wallet
                </Button>
              )
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnect}
                className={cn('w-full justify-start', isCollapsed && 'justify-center px-2')}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                {!isCollapsed && 'Disconnect'}
              </Button>
            )}
          </div>

          {!isCollapsed && (
            <div className="pt-3 border-t border-cyber-border">
              <div className="flex items-center gap-2 text-xs text-cyber-textDim">
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                <span>Press <kbd className="px-1.5 py-0.5 bg-cyber-elevated rounded text-cyber-text font-mono">Ctrl+B</kbd> to toggle sidebar</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}