import { useEffect } from 'react';
import { LayoutDashboard, Users, Box, FileText, ShieldCheck, Blocks, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDashboardStats } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats } from '../types';

type RecentActivity = DashboardStats['recent_activity'][number];

const STAT_CARDS = [
  { label: 'Total Users', key: 'total_users', icon: Users, color: 'accent' },
  { label: 'Total Assets', key: 'total_assets', icon: Box, color: 'accent' },
  { label: 'Pending Approvals', key: 'active_transfers', icon: FileText, color: 'warning' },
  { label: 'Approved Requests', key: 'approved_requests', icon: FileText, color: 'success' },
  { label: 'Security Events', key: 'audit_events', icon: ShieldCheck, color: 'critical' },
  { label: 'Blockchain Records', key: 'blockchain_transactions', icon: Blocks, color: 'violet' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();

  useEffect(() => {
    const interval = setInterval(() => refetchStats(), 60000);
    return () => clearInterval(interval);
  }, [refetchStats]);

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold" style={{ color: '#e6e9ef' }}>Welcome, {user?.full_name?.split(' ')[0]}</h1>
            <p style={{ color: '#8991a3' }}>
              {user?.role === 'ADMIN' ? 'OWNER' : user?.role === 'USER' ? 'EMPLOYEE' : user?.role} · SecureChain Control Center
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 stat-card glow" style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#141821', border: '1px solid #333a4a', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.18)' }}>
              <div className="stat-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-label" style={{ fontSize: '11.5px', color: '#8991a3', letterSpacing: '.03em', fontWeight: 600 }}>Loading...</span>
                <span className="stat-icon" style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#191e29', border: '1px solid #262b37', color: '#8991a3' }}>
                  <LayoutDashboard className="h-5 w-5" />
                </span>
              </div>
              <div className="stat-value" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.01em' }}>â€”</div>
              <div className="stat-foot" style={{ fontSize: '11.5px', color: '#8991a3' }}>Loading...</div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}><div className="h-64 bg-[#191e29] rounded animate-pulse" /></Card>
          <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}><div className="h-64 bg-[#191e29] rounded animate-pulse" /></Card>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12" style={{ color: '#e6e9ef' }}>
        <Activity className="h-12 w-12 mx-auto mb-4" style={{ color: '#dd5b64' }} />
        <p className="mb-4" style={{ color: '#dd5b64' }}>Failed to load dashboard data</p>
        <Button variant="outline" onClick={() => refetchStats()}>Retry</Button>
      </div>
    );
  }

  const pending = stats?.active_transfers || 0;
  const approved = stats?.blockchain_transactions || 0;  // Use blockchain txs as approved count
  const secEvents = stats?.audit_events || 0;
  const chainRecs = stats?.blockchain_transactions || 0;

  // We'll use a mock since we don't have category data from the API directly
  // In a real app, you'd fetch this from an assets endpoint

  const bars = [
    { label: 'Laptop', value: 2 },
    { label: 'Server', value: 1 },
  ];
  const maxBar = Math.max(1, ...bars.map(b => b.value));

  let ownerBlock: JSX.Element | null = null;
  if (user?.role === 'ADMIN') {
    ownerBlock = (
      <div>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, margin: '26px 0 12px', color: '#e6e9ef' }}>
          <FileText className="icon" style={{ width: 16, height: 16 }} /> Pending Approval Requests
        </div>
        <div className="card" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, textAlign: 'center', color: '#8991a3' }}>
          No pending approvals right now.
        </div>
      </div>
    );
  } else if (user?.role === 'MANAGER') {
    ownerBlock = (
      <div>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, margin: '26px 0 12px', color: '#e6e9ef' }}>
          <FileText className="icon" style={{ width: 16, height: 16 }} /> Your Recent Requests
        </div>
        <div className="card" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, textAlign: 'center', color: '#8991a3' }}>
          You have not submitted any requests yet. Go to Assets or Requests to create one.
        </div>
      </div>
    );
  } else {
    ownerBlock = (
      <div>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, margin: '26px 0 12px', color: '#e6e9ef' }}>
          <Box className="icon" style={{ width: 16, height: 16 }} /> Your Assigned Assets
        </div>
        <div className="card" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, textAlign: 'center', color: '#8991a3' }}>
          No assets assigned to you.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Welcome, {user?.full_name?.split(' ')[0]}</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>
            {user?.role === 'ADMIN' ? 'OWNER' : user?.role === 'USER' ? 'EMPLOYEE' : user?.role} · SecureChain Control Center
          </div>
        </div>
      </div>

      <div className="grid grid-4" style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 8 }}>
        {STAT_CARDS.map((c) => (
          <Card key={c.label} className="stat-card glow" style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#141821', border: '1px solid #333a4a', borderRadius: 8, padding: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.18)' }}>
            <div className="stat-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label" style={{ fontSize: '11.5px', color: '#8991a3', letterSpacing: '.03em', fontWeight: 600 }}>{c.label}</span>
              <span className="stat-icon" style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#191e29', border: '1px solid #262b37', color: '#8991a3' }}>
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <div className="stat-value" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.01em' }}>
              {c.key === 'active_transfers' ? pending : c.key === 'approved_requests' ? approved : c.key === 'audit_events' ? secEvents : c.key === 'blockchain_transactions' ? chainRecs : Number(stats?.[c.key as keyof typeof stats] || 0)}
            </div>
            <div className="stat-foot" style={{ fontSize: '11.5px', color: '#8991a3' }}>Live data</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-2" style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18 }}>
          <div className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#e6e9ef' }}>Assets by Category</div>
          <div className="bar-chart" style={{ display: 'flex', alignItems: 'flexEnd', gap: 10, height: 140, paddingTop: 10 }}>
            {bars.map((b) => (
              <div key={b.label} className="bar-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flexEnd', height: '100%' }}>
                <div className="bar-fill" style={{ width: '100%', borderRadius: '3px 3px 0 0', background: '#3d6fe0', minHeight: 4, height: `${(b.value / maxBar * 100)}%` }} />
                <div className="bar-label" style={{ fontSize: '10.5px', color: '#8991a3', textAlign: 'center' }}>{b.label}<br />{b.value}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18 }}>
          <div className="section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#e6e9ef' }}>Recent Audit Activity</div>
          <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stats?.recent_activity?.slice(0, 4).map((log: RecentActivity, index: number) => (
              <div key={index} className="tl-item" style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #262b37' }}>
                <div className="tl-dot" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: '#3d6fe022', color: '#3d6fe0' }}>â—</div>
                <div className="tl-body" style={{ flex: 1 }}>
                  <div className="tl-top" style={{ display: 'flex', justifyContent: 'spaceBetween', gap: 10, flexWrap: 'wrap' }}>
                    <span className="tl-msg" style={{ fontSize: '13.5px', fontWeight: 600 }}>{log.action}</span>
                    <Badge variant="info" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(61,111,224,0.12)', color: '#9db4ec', border: '1px solid rgba(61,111,224,0.32)' }}>INFO</Badge>
                  </div>
                  <div className="tl-meta" style={{ fontSize: '11.5px', color: '#8991a3', marginTop: 3 }}>{log.actor} Â· {log.resource_type} Â· {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {!stats?.recent_activity?.length && (
              <div className="card" style={{ textAlign: 'center', color: '#8991a3', padding: 30, background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
                No activity yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {ownerBlock}
    </div>
  );
}
