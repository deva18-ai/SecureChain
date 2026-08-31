import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Users, ShieldCheck, Box, GitBranch, Activity, Blocks, TrendingUp, Wallet, Key, FileText,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDashboardStats, useBlockchainStatus } from '../hooks/useApi';
import { formatNumber, formatRelativeTime, getRoleColor } from '../utils/helpers';

const STAT_CARDS = [
  { name: 'Total Users', key: 'total_users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', trend: '+12%', trendUp: true },
  { name: 'Verified Identities', key: 'verified_identities', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', trend: '+8%', trendUp: true },
  { name: 'Digital Assets', key: 'total_assets', icon: Box, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', trend: '+23%', trendUp: true },
  { name: 'Active Transfers', key: 'active_transfers', icon: GitBranch, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', trend: '+5%', trendUp: true },
  { name: 'Blockchain Txns', key: 'blockchain_transactions', icon: Blocks, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', trend: '+31%', trendUp: true },
  { name: 'Audit Events', key: 'audit_events', icon: FileText, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30', trend: '+18%', trendUp: true },
];

const COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f97316', '#6366f1', '#14b8a6'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: blockchainStatus, isLoading: chainLoading } = useBlockchainStatus();

  useEffect(() => {
    const interval = setInterval(() => refetchStats(), 60000);
    return () => clearInterval(interval);
  }, [refetchStats]);

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
            <p className="text-dark-600 dark:text-dark-400">Loading dashboard...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 w-24 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
              <div className="h-8 w-32 bg-dark-200 dark:bg-dark-700 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load dashboard data</p>
        <Button variant="outline" onClick={() => refetchStats()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const roleData = stats?.role_distribution || {};
  const roleLabels = Object.keys(roleData);
  const roleValues = Object.values(roleData);

  const recentActivity = stats?.recent_activity || [];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-dark-600 dark:text-dark-400">Overview of your SecureChain platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchStats()} size="sm">
            Refresh
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Operational</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          const value = stats?.[stat.key as keyof typeof stats] ?? 0;
          return (
            <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">{formatNumber(value)}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.trend}
                </span>
                <span className="text-sm text-dark-500 dark:text-dark-400">vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Role Distribution</h2>
            <Badge variant="primary">{roleLabels.reduce((a, b) => a + (roleData[b] || 0), 0)} total</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleLabels.map((label, i) => ({ name: label, value: roleData[label] || 0 }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roleLabels.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value.toString(), 'users']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Blockchain Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Blockchain Status</h2>
            <Badge variant={blockchainStatus?.connected ? 'success' : 'danger'}>
              {blockchainStatus?.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                <p className="text-sm text-dark-500 dark:text-dark-400">Network</p>
                <p className="font-mono text-lg text-dark-900 dark:text-white">{blockchainStatus?.network || 'Unknown'}</p>
              </div>
              <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                <p className="text-sm text-dark-500 dark:text-dark-400">Chain ID</p>
                <p className="font-mono text-lg text-dark-900 dark:text-white">{blockchainStatus?.chain_id || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                <p className="text-sm text-dark-500 dark:text-dark-400">Block Height</p>
                <p className="font-mono text-lg text-dark-900 dark:text-white">{blockchainStatus?.block_number?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
                <p className="text-sm text-dark-500 dark:text-dark-400">Contract</p>
                <p className="font-mono text-xs text-dark-900 dark:text-white truncate">{blockchainStatus?.contract_address || 'Not deployed'}</p>
              </div>
            </div>
            {blockchainStatus?.contract_verified && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Contract verified: SecureChain Asset (SCA)</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Activity</h2>
            <Link to="/audit" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white">{activity.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">{activity.resource_type}: {activity.resource_id}</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <Badge variant="primary">{activity.actor}</Badge>
                    <span className="text-xs text-dark-500 dark:text-dark-400 whitespace-nowrap">{formatRelativeTime(activity.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/identities" className="block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Key className="h-5 w-5" />
                <span>Create New DID</span>
              </Button>
            </Link>
            <Link to="/assets" className="block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Box className="h-5 w-5" />
                <span>Mint New Asset</span>
              </Button>
            </Link>
            <Link to="/transfers" className="block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <GitBranch className="h-5 w-5" />
                <span>Initiate Transfer</span>
              </Button>
            </Link>
            <Link to="/audit" className="block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <FileText className="h-5 w-5" />
                <span>View Audit Trail</span>
              </Button>
            </Link>
            <Link to="/blockchain" className="block">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Blocks className="h-5 w-5" />
                <span>Check Blockchain</span>
              </Button>
            </Link>
            <Link to="/settings" className="block">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Wallet className="h-5 w-5" />
                <span>Wallet Settings</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}