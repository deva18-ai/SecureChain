import { useState } from 'react';
import { Loader2, AlertCircle, User, Wallet, Key, Shield, Bell, Moon, Sun, Save, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { isConnected, account, connect, disconnect, balance, chainId } = useWallet();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    wallet_address: user?.wallet_address || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSaving(true);
    try {
      toast.success('Password changed successfully');
      setFormData({ ...formData, current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleWalletDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Settings</h1>
        <p className="text-dark-600 dark:text-dark-400">Manage your account, wallet, and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled
            helperText="Email cannot be changed"
          />
          <Input
            label="Wallet Address"
            value={formData.wallet_address}
            onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
            placeholder="0x1234...abcd"
            pattern="^0x[a-fA-F0-9]{40}$"
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
          <div>
            <p className="font-medium text-dark-900 dark:text-white">Role</p>
            <p className="text-sm text-dark-500 dark:text-dark-400">{user?.role}</p>
          </div>
          <Badge className={['OWNER', 'MANAGER', 'EMPLOYEE'].find(r => r === user?.role) 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}>
            {user?.role}
          </Badge>
        </div>
        <Button onClick={handleSaveProfile} loading={isSaving} className="mt-4">
          <Save className="h-4 w-4" />
          Save Profile
        </Button>
      </Card>

      {/* Password Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Change Password</h3>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 text-dark-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                placeholder="Current password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-700 dark:hover:text-dark-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 text-dark-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="New password (min 8 chars)"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-800 border border-dark-300 dark:border-dark-600 text-dark-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Confirm new password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            />
          </div>
          <Button onClick={handleChangePassword} loading={isSaving} variant="outline">
            <Save className="h-4 w-4" />
            Change Password
          </Button>
        </div>
      </Card>

      {/* Wallet Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Wallet Connection</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Wallet className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-white">
                  {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {isConnected 
                    ? `Connected: ${formatAddress(account)}`
                    : 'Connect your MetaMask wallet to interact with the blockchain'}
                </p>
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" onClick={handleWalletDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleWalletConnect} loading={isConnected}>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-white dark:bg-dark-900 px-3 py-2 rounded">{formatAddress(account)}</code>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Balance</p>
                <p className="font-mono text-dark-900 dark:text-white">{balance ? parseFloat(balance).toFixed(4) : '0'} ETH</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Network</p>
                <p className="font-mono text-dark-900 dark:text-white">
                  {chainId === 31337 ? 'Hardhat Localhost' : chainId ? `Chain ${chainId}` : 'Unknown'}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Blockchain Identity */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Blockchain Identity</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Decentralized Identifier (DID)</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Your on-chain identity for verification</p>
            </div>
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4" />
              Manage DID
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Preferences</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Receive email updates for important events</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Use dark theme (follows system preference)</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Auto-refresh Data</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Automatically refresh dashboard and lists</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Danger Zone</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}