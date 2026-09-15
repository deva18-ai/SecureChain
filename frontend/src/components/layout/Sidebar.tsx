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
  Settings,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { key: 'assets', label: 'Assets', href: '/assets', icon: Box, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { key: 'users', label: 'Users', href: '/users', icon: Users, roles: ['ADMIN', 'MANAGER', 'AUDITOR'] },
  { key: 'requests', label: 'Access Requests', href: '/requests', icon: FileText, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { key: 'identity', label: 'Digital Identities', href: '/identity', icon: Key, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { key: 'blockchain', label: 'Blockchain', href: '/blockchain', icon: Blocks, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { key: 'audit', label: 'Audit Logs', href: '/audit', icon: Activity, roles: ['ADMIN', 'MANAGER', 'AUDITOR'] },
  { key: 'security', label: 'Security Center', href: '/security', icon: ShieldCheck, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
  { key: 'settings', label: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] },
];

export function Sidebar() {
  const { user, hasRole, activeRole, previewRole, logout } = useAuth();
  const location = useLocation();

  const isEmployee = activeRole === 'USER';
  const isManager = activeRole === 'MANAGER';
  const isOwner = activeRole === 'ADMIN';

  // Section 11 explicit role navigation rules:
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (isEmployee) {
      // Employee sees: Dashboard, My Assets, Access Requests, My Identity, Activity, Settings
      return ['dashboard', 'assets', 'requests', 'identity', 'audit', 'settings'].includes(item.key);
    }
    return hasRole(item.roles);
  }).map(item => {
    if (isEmployee) {
      if (item.key === 'assets') return { ...item, label: 'My Assets' };
      if (item.key === 'identity') return { ...item, label: 'My Identity' };
      if (item.key === 'audit') return { ...item, label: 'My Activity' };
    }
    if (isManager && item.key === 'users') {
      return { ...item, label: 'Employees / Users' };
    }
    return item;
  });

  const initials = (name: string) => name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside
      id="sidebar"
      className="w-64 min-h-screen bg-[#0B132B] text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 shadow-xl select-none"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Hexagon className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-base text-white tracking-wide flex items-center gap-1.5">
            SecureChain
          </div>
          <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
            Decentralized Identity
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
          <span>Main Navigation</span>
          {previewRole && (
            <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-bold uppercase">
              Preview
            </span>
          )}
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive: active }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group',
                  active || isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )
              }
            >
              <Icon className={cn('w-4 h-4 transition-transform duration-150 group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400')} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3 m-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
            {user ? initials(user.full_name) : 'SC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Devavardhan (Owner)'}</p>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {displayRole(activeRole)}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}