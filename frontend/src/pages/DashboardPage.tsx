import { Activity, Blocks, Box, FileText, Key, LayoutDashboard, ShieldCheck, Users, TrendingUp, AlertTriangle, Clock, Wallet, Globe, CheckCircle, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { Card, StatCard, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAssets, useDashboardStats, useTransfers } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { displayRole, firstName, formatDate, formatAddress } from '../utils/helpers';
import type { DashboardStats } from '../types';
import { cn } from '../utils/helpers';

type RecentActivity = DashboardStats['recent_activity'][number];

const STAT_CARDS = [
  { label: 'Total Users', key: 'total_users', icon: Users, color: 'primary' as const },
  { label: 'Verified Identities', key: 'verified_identities', icon: ShieldCheck, color: 'success' as const },
  { label: 'Digital Assets', key: 'total_assets', icon: Box, color: 'primary' as const },
  { label: 'Active Assignments', key: 'active_transfers', icon: FileText, color: 'warning' as const },
  { label: 'Security Events', key: 'audit_events', icon: AlertTriangle, color: 'danger' as const },
  { label: 'Blockchain Txns', key: 'blockchain_transactions', icon: Blocks, color: 'secondary' as const },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { isConnected, account, chainId } = useWallet();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: assetsData, isLoading: assetsLoading } = useAssets({ page_size: 100 });
  const { data: pendingTransfers } = useTransfers({ page_size: 10, status: 'PENDING' });
  const { data: approvedTransfers } = useTransfers({ page_size: 1, status: 'APPROVED' });
  const { data: completedTransfers } = useTransfers({ page_size: 1, status: 'COMPLETED' });

  const pending = pendingTransfers?.total || 0;
  const approved = (approvedTransfers?.total || 0) + (completedTransfers?.total || 0);
  const assets = assetsData?.items || [];
  const categoryCounts = assets.reduce<Record<string, number>>((acc, asset) => {
    const category = asset.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const bars = Object.entries(categoryCounts).map(([label, value]) => ({ label, value }));
  const maxBar = Math.max(1, ...bars.map((b) => b.value));

  const getStatValue = (key: string) => {
    if (key === 'active_transfers') return pending + approved;
    if (key === 'audit_events') return stats?.audit_events || 0;
    return Number((stats as any)?.[key] || 0);
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 31337: return 'Hardhat Localhost';
      default: return chainId ? `Chain ${chainId}` : 'Not Connected';
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Welcome, {firstName(user?.full_name)}</h1>
            <p className="page-sub mt-1">{displayRole(user?.role)} &mdash; SecureChain Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="connection-indicator connection-connected">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              SYSTEM ONLINE
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetchStats()}>
              <Activity className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="data-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md border border-gray-200">
          <Activity className="h-12 w-12 mx-auto mb-4 text-danger" />
          <div className="font-semibold text-lg text-gray-900 mb-2">Dashboard unavailable</div>
          <div className="text-gray-600 mb-6">Unable to load SecureChain metrics.</div>
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>Retry</Button>
        </div>
      </div>
    );
  }

  const recentActivity = stats?.recent_activity?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Welcome, {firstName(user?.full_name)}</h1>
          <p className="page-sub mt-1">{displayRole(user?.role)} &mdash; SecureChain Control Center</p>
        </div>
        <div className="page-header-actions">
          <div className="flex items-center gap-2">
            <div className="connection-indicator connection-connected">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              SYSTEM ONLINE
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetchStats()}>
            <Activity className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="card-hover p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-lg bg-primary-blue/10 text-primary-blue flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</p>
              <p className="font-mono text-sm text-gray-900">{isConnected ? formatAddress(account || '') : 'Not Connected'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-lg bg-primary-blue/10 text-primary-blue flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Network</p>
              <p className="font-mono text-sm text-gray-900">{getNetworkName(chainId)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-lg bg-success-bg text-success flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
              <p className="font-medium text-sm text-gray-900">All Systems Operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="data-grid">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value = getStatValue(card.key);
          return (
            <StatCard
              key={card.label}
              title={card.label}
              value={value.toLocaleString()}
              icon={<Icon className="h-6 w-6" />}
              color={card.color}
            />
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="data-grid-3">
        {/* Asset Activity */}
        <Card className="lg:col-span-2" variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary-blue" />
              Asset Activity
            </CardTitle>
            <CardDescription>Recent asset creation, assignment, and status changes</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 animate-pulse">
                    <div className="h-10 w-10 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Box className="h-10 w-10 mx-auto mb-3 opacity-50" />
                No assets registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {assets.slice(0, 5).map((asset) => (
                  <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary-blue/10 text-primary-blue flex items-center justify-center flex-shrink-0">
                      <Box className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                      <p className="text-sm text-gray-500">{asset.asset_id} &middot; {asset.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={asset.status} />
                      <span className="text-xs text-gray-500">{formatDate(asset.created_at)}</span>
                    </div>
                  </div>
                ))}
                {assets.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" className="text-primary-blue">
                      View all {assets.length} assets
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              Security Overview
            </CardTitle>
            <CardDescription>Recent security events and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-3xl font-heading font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Critical Alerts</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-3xl font-heading font-bold text-gray-900">3</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Unresolved</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { type: 'UNAUTHORIZED_TRANSFER_ATTEMPT', severity: 'HIGH', actor: 'Priya Sharma', time: '2h ago' },
                  { type: 'REPEATED_FAILED_AUTH', severity: 'MEDIUM', actor: 'Rahul Kumar', time: '1d ago' },
                  { type: 'UNAUTHORIZED_API_ACCESS', severity: 'CRITICAL', actor: 'Employee User', time: '3h ago' },
                ].map((event, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      event.severity === 'CRITICAL' ? 'bg-danger-bg text-danger' :
                      event.severity === 'HIGH' ? 'bg-warning-bg text-warning' :
                      'bg-primary-blue/10 text-primary-blue'
                    )}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{event.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{event.actor} &middot; {event.time}</p>
                    </div>
                    <StatusBadge status={event.severity} dot />
                  </div>
                ))}
              </div>
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-primary-blue">
                  View Security Center
                  <Activity className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Status */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5 text-primary-blue" />
              Blockchain Status
            </CardTitle>
            <CardDescription>Network connection and contract status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                    stats?.blockchain_transactions ? 'bg-success-bg text-success' : 'bg-gray-100 text-gray-400'
                  )}>
                    {stats?.blockchain_transactions ? <CheckCircle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Connection</p>
                    <p className="text-sm text-gray-500">{stats?.blockchain_transactions ? 'Connected' : 'Disconnected'}</p>
                  </div>
                </div>
                <StatusBadge status={stats?.blockchain_transactions ? 'ACTIVE' : 'INACTIVE'} dot />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Network</span>
                  <span className="font-mono text-gray-900">{getNetworkName(chainId)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="font-mono text-gray-900">{chainId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Latest Block</span>
                  <span className="font-mono text-gray-900">{stats?.blockchain_transactions ? '#15,842' : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Contract</span>
                  <span className="font-mono text-xs text-gray-900 truncate max-w-[120px]">0x5FbDB...180aa3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2" variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-blue" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Resource</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        No recent activity found.
                      </td>
                    </tr>
                  ) : recentActivity.map((log: RecentActivity, index: number) => (
                    <tr key={`${log.action}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded text-xs font-medium">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{log.actor}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="font-mono text-xs">{log.resource_type}</span>
                        <span className="text-gray-400 mx-1">:</span>
                        <span className="font-mono text-xs">{log.resource_id}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status="VERIFIED" dot />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-primary-blue" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" fullWidth leftIcon={<Users className="h-4 w-4" />} className="justify-start">
                Manage Users
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Box className="h-4 w-4" />} className="justify-start">
                Register Asset
              </Button>
              <Button variant="outline" fullWidth leftIcon={<FileText className="h-4 w-4" />} className="justify-start">
                Create Request
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Key className="h-4 w-4" />} className="justify-start">
                Digital Identity
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Blocks className="h-4 w-4" />} className="justify-start">
                Blockchain Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}