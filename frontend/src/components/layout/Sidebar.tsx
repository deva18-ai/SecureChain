import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import {
  LayoutDashboard,
  Users,
  Shield,
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
  Key,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { name: 'Identities', href: '/identities', icon: Key, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { name: 'Assets', href: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { name: 'Transfers', href: '/transfers', icon: GitBranch, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { name: 'Roles & Permissions', href: '/roles', icon: UserCog, roles: ['ADMIN'] },
  { name: 'Audit Trail', href: '/audit', icon: FileText, roles: ['ADMIN', 'AUDITOR'] },
  { name: 'Blockchain', href: '/blockchain', icon: Blocks, roles: ['ADMIN', 'AUDITOR'] },
];

const userNavigation = [
  { name: 'My Identity', href: '/identity', icon: Shield, roles: ['USER'] },
  { name: 'My Assets', href: '/my-assets', icon: Wallet, roles: ['USER'] },
  { name: 'Transfer Requests', href: '/my-transfers', icon: GitBranch, roles: ['USER'] },
  { name: 'My Activity', href: '/my-activity', icon: Activity, roles: ['USER'] },
];

const adminNavigation = [
  { name: 'User Management', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Role Management', href: '/admin/roles', icon: UserCog, roles: ['ADMIN'] },
  { name: 'System Config', href: '/admin/config', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user, hasRole } = useAuth();
  const { isConnected, connect } = useWallet();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const filteredNav = navigation.filter(item => hasRole(item.roles));
  const filteredUserNav = userNavigation.filter(item => hasRole(item.roles));
  const filteredAdminNav = adminNavigation.filter(item => hasRole(item.roles));

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-700 transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-200 dark:border-dark-700">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="SecureChain Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-dark-900 dark:text-white">SecureChain</span>
          </Link>
          <button className="lg:hidden btn-ghost p-1" onClick={() => setIsOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Main</h3>
          </div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  'sidebar-link',
                  isActive && 'sidebar-link-active'
                )}
                end={item.href === '/dashboard'}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {filteredUserNav.length > 0 && (
            <>
              <div className="px-3 py-2 mt-2">
                <h3 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">My Account</h3>
              </div>
              {filteredUserNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => cn(
                      'sidebar-link',
                      isActive && 'sidebar-link-active'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </>
          )}

          {filteredAdminNav.length > 0 && (
            <>
              <div className="px-3 py-2 mt-2">
                <h3 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Administration</h3>
              </div>
              {filteredAdminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => cn(
                      'sidebar-link',
                      isActive && 'sidebar-link-active'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-dark-200 dark:border-dark-700">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={cn('flex-1 text-xs px-2 py-1 rounded', isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400')}>
              {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
            </span>
            {!isConnected && (
              <Button variant="outline" size="sm" onClick={connect} className="w-full">
                Connect
              </Button>
            )}
          </div>
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