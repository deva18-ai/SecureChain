import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, ChevronDown, LogOut, Settings, User, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { displayRole } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];

  const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/assets': 'Assets',
    '/requests': 'Requests',
    '/identity': 'Digital Identity',
    '/blockchain': 'Blockchain',
    '/audit': 'Audit Logs',
    '/security': 'Security Center',
    '/settings': 'Settings',
  };

  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    const label = routeLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    crumbs.push({ label, href: currentPath });
  }
  return crumbs;
}

export function Header() {
  const { user, logout } = useAuth();
  const { isConnected, connect, disconnect } = useWallet();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) setWalletOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-[1400px] mx-auto w-full">
        <div className="lg:hidden flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-gray-900">SecureChain</span>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-4 lg:px-8 min-w-0">
          <nav className="flex items-center gap-4 flex-1 min-w-0" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 overflow-x-auto pb-1 pr-4">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                  {index > 0 && <ChevronDown className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium truncate max-w-[200px] text-gray-900">{crumb.label}</span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="text-sm truncate max-w-[150px] text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="relative w-[280px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
            </Button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in z-50">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Notifications</span>
                  <span className="text-xs text-gray-600">3 new</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-200/50">
                    <p className="text-sm text-gray-900">Transfer request approved</p>
                    <p className="text-xs text-gray-600 mt-0.5">Asset SC-ASSET-042 transferred to John Doe</p>
                    <p className="text-xs text-gray-600 mt-1">2 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-200/50">
                    <p className="text-sm text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-600 mt-0.5">Alice Chen added as Employee</p>
                    <p className="text-xs text-gray-600 mt-1">15 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">Security alert</p>
                    <p className="text-xs text-gray-600 mt-0.5">Failed login attempt blocked</p>
                    <p className="text-xs text-gray-600 mt-1">1 hour ago</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <a href="/audit" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</a>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={walletRef}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setWalletOpen(!walletOpen)}
              className="gap-2 px-3 border border-gray-300 bg-white"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-900">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </Button>
            {walletOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in z-50">
                {!isConnected ? (
                  <Button variant="outline" size="sm" onClick={connect} className="w-full px-4 py-2 mx-2 justify-start">
                    Connect Wallet
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnect}
                    className="w-full px-4 py-2 mx-2 justify-start"
                    leftIcon={<LogOut className="h-4 w-4" />}
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="hidden lg:flex items-center gap-3 px-2.5 py-1.5"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-600">{displayRole(user?.role)}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="lg:hidden gap-2 p-2"
            >
              <User className="h-5 w-5 text-gray-600" />
            </Button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                </div>
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
                <a
                  href="/identity"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => setProfileOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  My Identity
                </a>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
