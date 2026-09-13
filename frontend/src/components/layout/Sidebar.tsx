import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { cn, displayRole } from '../../utils/helpers';
import {
  LayoutDashboard,
  Users,
  Box,
  FileText,
  Key,
  Blocks,
  Activity,
  ShieldCheck,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { Button } from '../ui/Button';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  roles: UserRole[];
}

interface NavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { key: 'users', label: 'Users', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { key: 'assets', label: 'Assets', icon: Box, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { key: 'requests', label: 'Requests', icon: FileText, roles: ['ADMIN', 'MANAGER'] },
  { key: 'identity', label: 'Digital Identity', icon: Key, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { key: 'blockchain', label: 'Blockchain', icon: Blocks, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { key: 'audit', label: 'Audit Logs', icon: Activity, roles: ['ADMIN', 'MANAGER', 'AUDITOR'] },
  { key: 'security', label: 'Security Center', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER', 'USER'] },
];

export function Sidebar({ isOpen = false, onClose }: NavProps) {
  const { user, hasRole, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredNavItems = NAV_ITEMS.filter(item => hasRole(item.roles));

  const initials = (name: string) => name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <button
        className="lg:hidden fixed top-6 left-6 z-50 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer transition-colors bg-white border border-gray-200 rounded-lg px-2 py-1.5"
        onClick={() => onClose?.()}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        <X className="icon" style={{ width: 18, height: 18 }} />
      </button>

      <aside
        id="sidebar"
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 lg:z-10 flex flex-col transition-all duration-300 ease-out bg-white border-r border-gray-200 shadow-sm',
          isCollapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200" style={{ minHeight: '72px' }}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="icon" style={{ width: 18, height: 18, stroke: '#FFFFFF' }} />
          </div>
          {!isCollapsed && (
            <div className="side-brand-text min-w-0">
              <div className="font-heading font-bold text-gray-900 truncate">SECURECHAIN</div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">CONTROL CENTER</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === `/${item.key}` || location.pathname.startsWith(`/${item.key}/`);

            return (
              <NavLink
                key={item.key}
                to={`/${item.key}`}
                onClick={() => onClose?.()}
                className={({ isActive: active }) => cn(
                  'sidebar-link rounded-lg',
                  active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700',
                  isCollapsed && 'justify-center px-2'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="icon flex-shrink-0" style={{ width: 18, height: 18 }} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-3 px-1 py-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {user ? initials(user.full_name) : '?'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{user?.full_name || '-'}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{displayRole(user?.role)}</div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn('w-full', isCollapsed && 'justify-center px-2')}
            onClick={() => logout()}
          >
            {!isCollapsed && <LogOut className="icon" style={{ width: 16, height: 16, marginRight: 8 }} />}
            {!isCollapsed && 'Logout'}
            {isCollapsed && <LogOut className="icon" style={{ width: 18, height: 18 }} />}
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => onClose?.()}
          aria-hidden="true"
        />
      )}
    </>
  );
}