import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronDown, LogOut, Settings, Bell, Search, Wallet, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { displayRole, formatAddress } from '../../utils/helpers';
import { WalletModal } from '../ui/WalletModal';

export function Header() {
  const { user, logout, previewRole, setPreviewRole } = useAuth();
  const { isConnected, account } = useWallet();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6 max-w-[1400px] mx-auto w-full">
          
          {/* Left: Brand Tagline / Status Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800">System Secure</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">Ethereum Sepolia Connected</span>
            </div>
          </div>

          {/* Right: Search, Notifications, Connect Wallet, User Profile */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden lg:block w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search system..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Alerts</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    <div className="px-4 py-2.5 hover:bg-slate-50">
                      <p className="text-xs font-semibold text-slate-900">Asset Transferred</p>
                      <p className="text-[11px] text-slate-500">SC-001 Laptop transferred to Devavardhan</p>
                      <span className="text-[10px] text-slate-400">2 mins ago</span>
                    </div>
                    <div className="px-4 py-2.5 hover:bg-slate-50">
                      <p className="text-xs font-semibold text-slate-900">DID Verification Complete</p>
                      <p className="text-[11px] text-slate-500">did:sc:170b verified on Sepolia block #48291</p>
                      <span className="text-[10px] text-slate-400">15 mins ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Role Preview Switcher */}
            <div className="relative">
              <select
                value={previewRole || user?.role || 'ADMIN'}
                onChange={(e) => {
                  const selectedRole = e.target.value as any;
                  if (selectedRole === user?.role) {
                    setPreviewRole(null);
                  } else {
                    setPreviewRole(selectedRole);
                  }
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer focus:outline-none ${
                  previewRole
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Demo Role Preview Mode (UI Presentation Only)"
              >
                <option value="ADMIN">Owner</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">Employee</option>
              </select>
            </div>

            {/* Wallet Button */}
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.full_name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name || 'Devavardhan'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {displayRole(previewRole || user?.role)}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </a>
                  <a
                    href="/identity"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Digital Identity
                  </a>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Screen 15 Wallet Modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
}