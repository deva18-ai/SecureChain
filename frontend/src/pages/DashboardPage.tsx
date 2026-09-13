import { Activity, Blocks, Box, FileText, Key, LayoutDashboard, ShieldCheck, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAssets, useDashboardStats, useTransfers } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { displayRole, firstName, formatDate } from '../utils/helpers';
import type { DashboardStats } from '../types';

type RecentActivity = DashboardStats['recent_activity'][number];

const STAT_CARDS = [
  { label: 'Total Users', key: 'total_users', icon: Users, color: 'primary' as const },
  { label: 'Total Assets', key: 'total_assets', icon: Box, color: 'secondary' as const },
  { label: 'Pending Approvals', key: 'pending_requests', icon: FileText, color: 'warning' as const },
  { label: 'Approved Requests', key: 'approved_requests', icon: FileText, color: 'success' as const },
  { label: 'Security Events', key: 'security_events', icon: ShieldCheck, color: 'danger' as const },
  { label: 'Blockchain Records', key: 'blockchain_transactions', icon: Blocks, color: 'primary' as const },
];

export default function DashboardPage() {
  const { user } = useAuth();
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
    if (key === 'pending_requests') return pending;
    if (key === 'approved_requests') return approved;
    if (key === 'security_events') return stats?.audit_events || 0;
    return Number((stats as any)?.[key] || 0);
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6 animate-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {firstName(user?.full_name)}</h1>
            <p className="text-gray-600 mt-1">{displayRole(user?.role)} - SecureChain Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-medium border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM ONLINE
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetchStats()}>
              <Activity className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 animate-pulse" />
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
          <Activity className="h-12 w-12 mx-auto mb-4 text-red-600" />
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {firstName(user?.full_name)}</h1>
          <p className="text-gray-600 mt-1">{displayRole(user?.role)} - SecureChain Control Center</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-medium border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetchStats()}>
            <Activity className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value = getStatValue(card.key);
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-600" />
              Assets by Category
            </h2>
            <Badge variant="primary">{assets.length} total</Badge>
          </div>
          {assetsLoading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : bars.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Box className="h-10 w-10 mx-auto mb-3 opacity-50" />
              No assets registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600 font-medium">{bar.label}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${(bar.value / maxBar) * 100}%` }}
                    />
                  </div>
                  <div className="w-16 text-right font-mono font-medium text-gray-900">{bar.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Audit Activity
            </h2>
            <Badge variant="info">{recentActivity.length} events</Badge>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                No audit activity found.
              </div>
            ) : recentActivity.map((log: RecentActivity, index: number) => (
              <div key={`${log.action}-${index}`} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 text-sm truncate">{log.action.replace(/_/g, ' ')}</span>
                    <Badge variant="info" className="text-xs">INFO</Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="font-mono">{log.actor}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-mono">{log.resource_type}</span>
                    <span className="text-gray-400">•</span>
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(user?.role === 'ADMIN' || pending > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Pending Approval Requests
            </h2>
            {pending > 0 && <Badge variant="pending">{pending} pending</Badge>}
          </div>
          {!pendingTransfers?.items?.length ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              No pending approval requests.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTransfers.items.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Request #{request.id} - Asset Transfer</div>
                      <div className="text-sm text-gray-600">
                        {request.initiator?.full_name || 'Requester'} - {request.asset?.name || `Asset ${request.asset_id}`} - {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="pending">PENDING</Badge>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                </div>
              ))}
              {pendingTransfers.items.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View all {pending} pending requests
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              System Health
            </h2>
            <Badge variant="active">OPERATIONAL</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'API Server', status: 'OPERATIONAL', icon: Activity, color: 'green' },
              { label: 'PostgreSQL', status: 'OPERATIONAL', icon: Box, color: 'green' },
              { label: 'Blockchain RPC', status: 'OPERATIONAL', icon: Blocks, color: 'green' },
              { label: 'Authentication', status: 'OPERATIONAL', icon: ShieldCheck, color: 'green' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <Badge variant={item.color === 'green' ? 'success' : 'warning'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h2>
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
        </div>
      </div>
    </div>
  );
}