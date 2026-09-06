import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { cn } from '../../utils/helpers';
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
        className="lg:hidden"
        onClick={() => onClose?.()}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="sidebar"
        style={{
          position: 'fixed',
          top: '24px',
          left: '26px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '12.5px',
          fontWeight: 500,
          color: '#8991a3',
          cursor: 'pointer',
          transition: 'color .15s',
          background: 'none',
          border: 'none',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#e6e9ef'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#8991a3'}
      >
        <X className="icon" style={{ width: 14, height: 14 }} />
      </button>

      <aside
        id="sidebar"
        className={cn(
          'sidebar',
          isCollapsed ? 'w-[64px]' : 'w-[250px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="side-brand">
          <div className="brand-mark">
            <ShieldCheck className="icon" style={{ width: 16, height: 16, stroke: '#eef2ff' }} />
          </div>
          {!isCollapsed && (
            <div className="side-brand-text">
              <b>SECURECHAIN</b>
              <span>DEMO MODE</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto" aria-label="Main">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === `/${item.key}` || location.pathname.startsWith(`/${item.key}/`);

            return (
              <NavLink
                key={item.key}
                to={`/${item.key}`}
                onClick={() => onClose?.()}
                className={({ isActive: navActive }) => cn(
                  'nav-item',
                  navActive ? 'active' : '',
                  isCollapsed && 'justify-center px-2'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="icon flex-shrink-0" style={{ width: 16, height: 16 }} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="side-footer">
          <div className="who">
            <div className="who-avatar">
              {user ? initials(user.full_name) : '?'}
            </div>
            {!isCollapsed && (
              <div>
                <div className="who-name">{user?.full_name || '—'}</div>
                <div className="who-role">{user?.role || '—'}</div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => logout()}
          >
            {!isCollapsed && <LogOut className="icon" style={{ width: 16, height: 16, marginRight: 8 }} />}
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => onClose?.()}
          aria-hidden="true"
        />
      )}
    </>
  );
}