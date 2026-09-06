import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { Button } from '../ui/Button';

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

  const profileRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) setWalletOpen(false);
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
    <header className="sticky top-0 z-30" style={{ background: 'rgba(20,24,33,0.8)', backdropFilter: 'blur(2px)', borderBottom: '1px solid #262b37' }}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6" style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <div className="lg:hidden flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3d6fe0] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#eef2ff]" />
            </div>
            <span className="font-heading font-bold text-lg" style={{ color: '#e6e9ef' }}>SecureChain</span>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-4 lg:px-8 min-w-0">
          <nav className="flex items-center gap-1 flex-1 min-w-0" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 overflow-x-auto pb-1 pr-4">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                  {index > 0 && <ChevronDown className="icon" style={{ width: 12, height: 12, color: '#8991a3', flexShrink: 0 }} />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium truncate max-w-[200px]" style={{ color: '#e6e9ef' }}>{crumb.label}</span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="text-sm truncate max-w-[150px] transition-colors"
                      style={{ color: '#8991a3' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#3d6fe0'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#8991a3'}
                    >
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="relative" ref={walletRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWalletOpen(!walletOpen)}
              className="gap-2 px-3"
              style={{ border: '1px solid #333a4a', background: 'transparent' }}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#2fa872]' : 'bg-[#c99a3e]'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </Button>
            {walletOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#141821] border border-[#333a4a] rounded-lg shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] py-2 animate-in z-50">
                {!isConnected ? (
                  <Button variant="outline" size="sm" onClick={connect} className="w-full px-4 py-2 mx-2" style={{ justifyContent: 'flex-start' }}>
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
              className="hidden lg:flex items-center gap-2"
              style={{ padding: '6px 8px' }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3d6fe0] to-[#7d72d6] flex items-center justify-center">
                <span className="text-[#eef2ff] text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: '#e6e9ef' }}>{user?.full_name}</p>
                <p className="text-xs capitalize" style={{ color: '#8991a3' }}>{user?.role?.toLowerCase()}</p>
              </div>
              <ChevronDown className="icon" style={{ width: 14, height: 14, color: '#8991a3' }} />
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
              <div className="absolute right-0 mt-2 w-56 bg-[#141821] border border-[#333a4a] rounded-lg shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] py-2 animate-in z-50">
                <div className="px-4 py-2 border-b border-[#262b37]">
                  <p className="text-sm font-medium" style={{ color: '#e6e9ef' }}>{user?.full_name}</p>
                  <p className="text-xs" style={{ color: '#8991a3' }}>{user?.email}</p>
                </div>
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#191e29]"
                  style={{ color: '#8991a3' }}
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
                <a
                  href="/identity"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#191e29]"
                  style={{ color: '#8991a3' }}
                  onClick={() => setProfileOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  My Identity
                </a>
                <hr className="my-2 border-[#262b37]" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#dd5b6410] text-left"
                  style={{ color: '#dd5b64' }}
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