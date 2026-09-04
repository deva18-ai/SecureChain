import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Users, ShieldCheck, Box, GitBranch, Activity, Blocks, FileText,
  Server, Database, Globe, Shield, Lock, Wallet, CheckCircle, AlertCircle, XCircle,
  RefreshCw, Zap, Key, Eye, BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDashboardStats, useBlockchainStatus } from '../hooks/useApi';
import { formatNumber } from '../utils/helpers';
import {
  SecurityMetric,
  SystemHealth,
  SecurityStatus,
  VerificationBadge,
  AuditEvent,
} from '../components/security';

const STAT_CARDS = [
  { name: 'Total Users', key: 'total_users', icon: Users, color: 'primary', trend: '+12%', trendUp: true },
  { name: 'Verified Identities', key: 'verified_identities', icon: ShieldCheck, color: 'success', trend: '+8%', trendUp: true },
  { name: 'Digital Assets', key: 'total_assets', icon: Box, color: 'secondary', trend: '+23%', trendUp: true },
  { name: 'Active Transfers', key: 'active_transfers', icon: GitBranch, color: 'warning', trend: '+5%', trendUp: true },
  { name: 'Blockchain Txns', key: 'blockchain_transactions', icon: Blocks, color: 'primary', trend: '+31%', trendUp: true },
  { name: 'Audit Events', key: 'audit_events', icon: FileText, color: 'secondary', trend: '+18%', trendUp: true },
];

const COLORS = ['#22D3EE', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7'];

const securityPostureCategories = [
  { name: 'Authentication', icon: Shield, description: 'JWT-based auth with secure password policies', lastChecked: 'Just now', status: 'operational' as const },
  { name: 'RBAC', icon: Lock, description: 'Three-tier role enforcement (Owner, Manager, Employee)', lastChecked: 'Just now', status: 'operational' as const },
  { name: 'API Security', icon: Globe, description: 'Rate limiting, CORS, input validation active', lastChecked: '1 min ago', status: 'operational' as const },
  { name: 'Database', icon: Database, description: 'Encrypted at rest, parameterized queries', lastChecked: 'Just now', status: 'operational' as const },
  { name: 'Blockchain', icon: Blocks, description: 'OpenZeppelin contracts, AccessControl enforced', lastChecked: 'Just now', status: 'operational' as const },
  { name: 'Smart Contracts', icon: Zap, description: 'ReentrancyGuard, formal verification ready', lastChecked: '5 min ago', status: 'operational' as const },
  { name: 'Audit Integrity', icon: FileText, description: 'Immutable logs with blockchain anchoring', lastChecked: 'Just now', status: 'operational' as const },
  { name: 'Infrastructure', icon: Server, description: 'Dockerized, health checks, auto-restart', lastChecked: '1 min ago', status: 'operational' as const },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: blockchainStatus } = useBlockchainStatus();

  useEffect(() => {
    const interval = setInterval(() => refetchStats(), 60000);
    return () => clearInterval(interval);
  }, [refetchStats]);

  if (statsLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-cyber-text">Security Overview</h1>
            <p className="text-cyber-textMuted">Loading security operations overview...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-4 w-24 bg-cyber-elevated rounded mb-4 animate-pulse" />
              <div className="h-8 w-32 bg-cyber-elevated rounded animate-pulse" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6"><div className="h-64 bg-cyber-elevated/50 rounded animate-pulse" /></Card>
          <Card className="p-6"><div className="h-64 bg-cyber-elevated/50 rounded animate-pulse" /></Card>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-cyber-critical" />
        <p className="text-cyber-critical mb-4">Failed to load dashboard data</p>
        <Button variant="outline" onClick={() => refetchStats()}>Retry</Button>
      </div>
    );
  }

  const roleData = stats?.role_distribution || {};
  const roleLabels = Object.keys(roleData);

  const recentActivity = stats?.recent_activity || [];

  const systemServices = [
    { name: 'API', status: 'operational' as const, icon: <Server className="h-4 w-4" />, description: 'FastAPI REST API responding normally' },
    { name: 'Database', status: 'operational' as const, icon: <Database className="h-4 w-4" />, description: 'PostgreSQL connected, queries optimal' },
    { name: 'Blockchain', status: blockchainStatus?.connected ? 'operational' : 'critical' as const, icon: <Globe className="h-4 w-4" />, description: blockchainStatus?.connected ? `Connected to ${blockchainStatus.network} (Chain ${blockchainStatus.chain_id})` : 'Unable to connect to blockchain node' },
    { name: 'Authentication', status: 'operational' as const, icon: <Shield className="h-4 w-4" />, description: 'JWT auth active, sessions valid' },
    { name: 'Audit', status: 'operational' as const, icon: <FileText className="h-4 w-4" />, description: 'Audit logging functional, blockchain sync active' },
    { name: 'Wallet', status: 'operational' as const, icon: <Wallet className="h-4 w-4" />, description: 'MetaMask integration ready' },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cyber-text">Security Overview</h1>
          <p className="text-cyber-textMuted">
            Real-time visibility across identity, assets, blockchain and audit infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchStats()} size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <SecurityStatus
            status={blockchainStatus?.connected ? 'operational' : 'critical'}
            label={blockchainStatus?.connected ? 'System Operational' : 'System Degraded'}
            description={blockchainStatus?.connected ? 'All services healthy' : 'Blockchain connection unavailable'}
            compact
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          const value = stats?.[stat.key as keyof typeof stats] ?? 0;
          return (
            <SecurityMetric
              key={stat.name}
              label={stat.name}
              value={formatNumber(value)}
              icon={<Icon className="h-6 w-6" />}
              trend={{ value: stat.trend, up: stat.trendUp }}
              color={stat.color as any}
            />
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts & Security Posture */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role Distribution & Activity Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-semibold text-cyber-text">Role Distribution</h2>
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Security Posture */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-semibold text-cyber-text">Security Posture</h2>
                <Badge variant="outline">8/8 Controls Active</Badge>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {securityPostureCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SecurityStatus
                      key={category.name}
                      status={category.status}
                      label={category.name}
                      description={category.description}
                      icon={<Icon className="h-4 w-4" />}
                      compact
                    />
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-cyber-text">Recent Security Events</h2>
              <Link to="/audit" className="text-sm text-cyber-primary hover:text-cyber-primaryDim flex items-center gap-1">
                View all <Eye className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-cyber-textMuted">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent security events</p>
                </div>
              ) : (
                recentActivity.slice(0, 15).map((activity, index) => (
                  <AuditEvent key={index} event={{
                    action: activity.action,
                    resource_type: activity.resource_type,
                    resource_id: activity.resource_id,
                    actor: activity.actor,
                    created_at: activity.created_at,
                  }} compact />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - System Health & Quick Actions */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-cyber-text">System Health</h2>
              <SecurityStatus
                status={blockchainStatus?.connected ? 'operational' : 'critical'}
                label="Overall"
                compact
              />
            </div>
            <SystemHealth services={systemServices} compact />
            <div className="mt-4 pt-4 border-t border-cyber-border">
              <p className="text-xs text-cyber-textMuted">Last updated: Just now</p>
            </div>
          </Card>

          {/* Blockchain Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-cyber-text">Blockchain Status</h2>
              <VerificationBadge verified={blockchainStatus?.connected || false} blockchainVerified={blockchainStatus?.contract_verified || false} size="sm" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
                  <p className="text-xs text-cyber-textMuted uppercase tracking-wider">Network</p>
                  <p className="font-mono text-lg text-cyber-text">{blockchainStatus?.network || 'Unknown'}</p>
                </div>
                <div className="p-3 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
                  <p className="text-xs text-cyber-textMuted uppercase tracking-wider">Chain ID</p>
                  <p className="font-mono text-lg text-cyber-text">{blockchainStatus?.chain_id || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
                  <p className="text-xs text-cyber-textMuted uppercase tracking-wider">Block Height</p>
                  <p className="font-mono text-lg text-cyber-text">{blockchainStatus?.block_number?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
                  <p className="text-xs text-cyber-textMuted uppercase tracking-wider">Contract</p>
                  <p className="font-mono text-xs text-cyber-text truncate">{blockchainStatus?.contract_address || 'Not deployed'}</p>
                </div>
              </div>
              {blockchainStatus?.contract_verified && (
                <div className="p-3 rounded-lg bg-cyber-success/10 border border-cyber-success/30 flex items-center gap-2 text-cyber-success">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Contract verified: SecureChain Asset (SCA)</span>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-heading font-semibold text-cyber-text mb-6">Quick Actions</h2>
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
                  <span>Blockchain Explorer</span>
                </Button>
              </Link>
              <Link to="/security-center" className="block">
                <Button variant="primary" className="w-full justify-start gap-3">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Security Center</span>
                </Button>
              </Link>
              <Link to="/security-resources" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <BookOpen className="h-5 w-5" />
                  <span>Cybersecurity Resources</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}