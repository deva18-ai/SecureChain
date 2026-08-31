import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Menu, Sun, Moon, LogOut, Bell, ChevronDown, Wallet, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { formatAddress } from '../../utils/helpers';
import { Modal } from '../ui/Modal';

export function Header() {
  const { user, logout, hasRole } = useAuth();
  const { isConnected, account, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setWalletOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname === '/';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="lg:hidden flex items-center gap-4">
          <button
            className="btn-ghost p-2"
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-dark-900 dark:text-white hidden sm:block">SecureChain</span>
          </Link>
        </div>

        <div className="flex-1 lg:flex-none" />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="relative" ref={walletRef}>
            <Button
              variant={isConnected ? 'secondary' : 'outline'}
              size="sm"
              onClick={isConnected ? () => setWalletOpen(!walletOpen) : connect}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">{isConnected ? formatAddress(account || '') : 'Connect Wallet'}</span>
            </Button>
            {walletOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-700 shadow-lg py-2 animate-in">
                {isConnected ? (
                  <>
                    <div className="px-4 py-2 border-b border-dark-200 dark:border-dark-700">
                      <p className="text-xs text-dark-500 dark:text-dark-400">Connected Account</p>
                      <p className="font-mono text-sm text-dark-900 dark:text-white">{formatAddress(account || '', 6)}</p>
                    </div>
                    <button
                      onClick={disconnect}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2">
                    <p className="text-sm text-dark-600 dark:text-dark-400">Install MetaMask to connect your wallet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="gap-2 lg:hidden"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="hidden lg:flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-dark-900 dark:text-white">{user?.full_name}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-dark-500" />
            </Button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-700 shadow-lg py-2 animate-in">
                <div className="px-4 py-2 border-b border-dark-200 dark:border-dark-700">
                  <p className="text-sm font-medium text-dark-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800"
                  onClick={() => setProfileOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Settings
                </Link>
                <hr className="my-2 border-dark-200 dark:border-dark-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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