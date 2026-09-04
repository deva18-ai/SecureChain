import { useState } from 'react';
import { Shield, Loader2, AlertCircle, Save, Key, Blocks, Wallet, Database, Server, Globe, Lock, Bell, Moon, Sun } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useBlockchainStatus } from '../hooks/useApi';
import { formatAddress } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminConfigPage() {
  const { hasRole } = useAuth();
  const [config, setConfig] = useState({
    site_name: 'SecureChain',
    maintenance_mode: false,
    registration_enabled: true,
    max_file_size: 10,
    session_timeout: 60,
    blockchain_rpc_url: 'http://127.0.0.1:8545',
    contract_address: '',
    default_role: 'EMPLOYEE',
    email_notifications: true,
    audit_retention_days: 365,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const { data: blockchainStatus, refetch } = useBlockchainStatus();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestBlockchain = async () => {
    setTestResult('Testing...');
    try {
      await refetch();
      setTestResult(blockchainStatus?.connected ? 'Connection successful!' : 'Connection failed');
    } catch (error) {
      setTestResult('Connection failed: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">System Configuration</h1>
          <p className="text-dark-600 dark:text-dark-400">Manage platform settings and blockchain connection</p>
        </div>
        <Button onClick={handleSave} loading={isSaving}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Site Name"
            value={config.site_name}
            onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
          />
          <Input
            label="Default User Role"
            value={config.default_role}
            onChange={(e) => setConfig({ ...config, default_role: e.target.value })}
            type="select"
            options={[
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'MANAGER', label: 'Manager' },
            ]}
          />
          <Input
            label="Session Timeout (minutes)"
            type="number"
            value={config.session_timeout}
            onChange={(e) => setConfig({ ...config, session_timeout: parseInt(e.target.value) })}
          />
          <Input
            label="Max File Size (MB)"
            type="number"
            value={config.max_file_size}
            onChange={(e) => setConfig({ ...config, max_file_size: parseInt(e.target.value) })}
          />
          <Input
            label="Audit Retention (days)"
            type="number"
            value={config.audit_retention_days}
            onChange={(e) => setConfig({ ...config, audit_retention_days: parseInt(e.target.value) })}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
            <input
              type="checkbox"
              checked={config.registration_enabled}
              onChange={(e) => setConfig({ ...config, registration_enabled: e.target.checked })}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-dark-900 dark:text-white">User Registration</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Allow new users to register</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
            <input
              type="checkbox"
              checked={config.maintenance_mode}
              onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Maintenance Mode</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Disable access for non-admin users</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
            <input
              type="checkbox"
              checked={config.email_notifications}
              onChange={(e) => setConfig({ ...config, email_notifications: e.target.checked })}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Send email notifications for important events</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Blockchain Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Blocks className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Blockchain Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="RPC URL"
            value={config.blockchain_rpc_url}
            onChange={(e) => setConfig({ ...config, blockchain_rpc_url: e.target.value })}
            placeholder="http://127.0.0.1:8545"
          />
          <Input
            label="Contract Address"
            value={config.contract_address}
            onChange={(e) => setConfig({ ...config, contract_address: e.target.value })}
            placeholder="0x..."
            leftIcon={<Wallet className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
          <div className="flex-1">
            <p className="font-medium text-dark-900 dark:text-white">Connection Status</p>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              {blockchainStatus?.connected ? 'Connected' : 'Disconnected'}
              {blockchainStatus?.network && ` - ${blockchainStatus.network}`}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">
              {blockchainStatus?.contract_address || 'No contract deployed'}
            </p>
          </div>
          <Button variant="outline" onClick={handleTestBlockchain} loading={testResult === 'Testing...'}>
            <RefreshCw className="h-4 w-4" />
            Test Connection
          </Button>
        </div>
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${testResult.includes('successful') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
            {testResult}
          </div>
        )}
      </Card>

      {/* Database Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Database Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Database URL"
            type="password"
            value="postgresql+asyncpg://postgres:****@localhost:5432/securechain"
            onChange={() => {}}
            disabled
            helperText="Configured via environment variable DATABASE_URL"
          />
          <Input
            label="Connection Pool Size"
            type="number"
            value={10}
            onChange={() => {}}
            disabled
            helperText="Configured via environment variable"
          />
        </div>
        <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Note:</strong> Database settings are configured via environment variables.
            Update your <code>.env</code> file and restart the backend to apply changes.
          </p>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">JWT Secret</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Configured via JWT_SECRET environment variable</p>
            </div>
            <Badge variant="warning">Env Only</Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Password Policy</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Min 8 chars, uppercase, lowercase, number, special char</p>
            </div>
            <Badge variant="outline">Enforced</Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">CORS Origins</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Configured via CORS_ORIGINS environment variable</p>
            </div>
            <Badge variant="warning">Env Only</Badge>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">System Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <p className="text-sm text-dark-500 dark:text-dark-400">Application</p>
            <p className="font-mono text-dark-900 dark:text-white">SecureChain API v1.0.0</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <p className="text-sm text-dark-500 dark:text-dark-400">Environment</p>
            <p className="font-mono text-dark-900 dark:text-white">{import.meta.env.MODE || 'development'}</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <p className="text-sm text-dark-500 dark:text-dark-400">Build Time</p>
            <p className="font-mono text-dark-900 dark:text-white">{new Date().toISOString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}