import { Activity, Blocks, Box, FileText, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAssets, useDashboardStats, useTransfers } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { displayRole, firstName, formatDate } from '../utils/helpers';
import type { DashboardStats } from '../types';

type StatKey = keyof DashboardStats | 'pending_requests' | 'approved_requests' | 'security_events';

type RecentActivity = DashboardStats['recent_activity'][number];

const STAT_CARDS: Array<{ label: string; key: StatKey; icon: typeof Users }> = [
  { label: 'Total Users', key: 'total_users', icon: Users },
  { label: 'Total Assets', key: 'total_assets', icon: Box },
  { label: 'Pending Approvals', key: 'pending_requests', icon: FileText },
  { label: 'Approved Requests', key: 'approved_requests', icon: FileText },
  { label: 'Security Events', key: 'security_events', icon: ShieldCheck },
  { label: 'Blockchain Records', key: 'blockchain_transactions', icon: Blocks },
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

  const getStatValue = (key: StatKey) => {
    if (key === 'pending_requests') return pending;
    if (key === 'approved_requests') return approved;
    if (key === 'security_events') return stats?.audit_events || 0;
    return Number(stats?.[key] || 0);
  };

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
        <div className="topbar">
          <div>
            <div className="page-title">Welcome, {firstName(user?.full_name)}</div>
            <div className="page-sub">{displayRole(user?.role)} - SecureChain Control Center</div>
          </div>
        </div>
        <div className="grid grid-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="stat-card glow">
              <div className="stat-top"><span className="stat-label">Loading</span><span className="stat-icon"><LayoutDashboard className="h-5 w-5" /></span></div>
              <div className="stat-value">-</div>
              <div className="stat-foot">Fetching live data</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="locked-panel">
        <Activity className="icon" />
        <div><b>Dashboard unavailable.</b> Unable to load SecureChain metrics.</div>
        <Button variant="outline" size="sm" onClick={() => refetchStats()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Welcome, {firstName(user?.full_name)}</div>
          <div className="page-sub">{displayRole(user?.role)} - SecureChain Control Center</div>
        </div>
      </div>

      <div className="grid grid-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="stat-card glow">
              <div className="stat-top">
                <span className="stat-label">{card.label}</span>
                <span className="stat-icon"><Icon className="h-5 w-5" /></span>
              </div>
              <div className="stat-value">{getStatValue(card.key)}</div>
              <div className="stat-foot">Live API data</div>
            </Card>
          );
        })}
      </div>

      {user?.role === 'ADMIN' && (
        <div>
          <div className="section-title"><FileText className="icon" /> Pending Approval Requests</div>
          <Card className="glow">
            {!pendingTransfers?.items?.length ? (
              <div style={{ color: '#8991a3', textAlign: 'center', padding: 18 }}>No pending approval requests.</div>
            ) : (
              <div className="timeline">
                {pendingTransfers.items.map((request) => (
                  <div className="tl-item" key={request.id}>
                    <div className="tl-dot" style={{ background: 'rgba(201,154,62,0.12)', color: '#c99a3e' }}>!</div>
                    <div className="tl-body">
                      <div className="tl-top">
                        <span className="tl-msg">Request #{request.id} - Asset Transfer</span>
                        <Badge variant="pending">PENDING</Badge>
                      </div>
                      <div className="tl-meta">
                        {request.initiator?.full_name || 'Requester'} - {request.asset?.name || `Asset ${request.asset_id}`} - {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <div className="grid grid-2">
        <Card>
          <div className="section-title" style={{ marginTop: 0 }}>Assets by Category</div>
          {assetsLoading ? (
            <div className="h-32 bg-[#191e29] rounded animate-pulse" />
          ) : bars.length === 0 ? (
            <div style={{ color: '#8991a3', textAlign: 'center', padding: 30 }}>No assets registered yet.</div>
          ) : (
            <div className="bar-chart">
              {bars.map((bar) => (
                <div key={bar.label} className="bar-col">
                  <div className="bar-fill" style={{ height: `${(bar.value / maxBar) * 100}%` }} />
                  <div className="bar-label">{bar.label}<br />{bar.value}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="section-title" style={{ marginTop: 0 }}>Recent Audit Activity</div>
          <div className="timeline">
            {stats?.recent_activity?.slice(0, 4).map((log: RecentActivity, index: number) => (
              <div key={`${log.action}-${index}`} className="tl-item">
                <div className="tl-dot" style={{ background: 'rgba(61,111,224,0.12)', color: '#9db4ec' }}>i</div>
                <div className="tl-body">
                  <div className="tl-top">
                    <span className="tl-msg">{log.action.replace(/_/g, ' ')}</span>
                    <Badge variant="info">INFO</Badge>
                  </div>
                  <div className="tl-meta">{log.actor} - {log.resource_type} - {formatDate(log.created_at)}</div>
                </div>
              </div>
            ))}
            {!stats?.recent_activity?.length && (
              <div style={{ color: '#8991a3', textAlign: 'center', padding: 30 }}>No audit activity found.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
