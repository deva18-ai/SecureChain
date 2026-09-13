import { AlertCircle, CheckCircle, RefreshCw, ShieldAlert, Shield, Activity, XCircle, ChevronDown, ChevronUp, Eye, Copy, Filter } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { useSecurityEvents, useResolveSecurityEvent } from '../hooks/useApi';
import { displayRole, formatDate } from '../utils/helpers';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';

interface SecurityEvent {
  id: number;
  timestamp?: string;
  created_at?: string;
  event_type?: string;
  action?: string;
  actor?: string;
  actor_role?: string;
  role?: string;
  user_email?: string;
  severity?: string;
  status?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

export default function SecurityCenterPage() {
  const { data: securityEventsData, isLoading, refetch } = useSecurityEvents({ page: 1, page_size: 50 });
  const resolveEventMutation = useResolveSecurityEvent();
  const events: SecurityEvent[] = securityEventsData?.items || [];
  const blockedEvents = events.filter((event) => (event.status || '').toUpperCase() === 'BLOCKED').length;
  const openEvents = events.filter((event) => (event.status || '').toUpperCase() !== 'RESOLVED').length;
  const criticalEvents = events.filter((event) => ['CRITICAL', 'SECURITY', 'HIGH'].includes((event.severity || '').toUpperCase())).length;

  const handleResolveEvent = async (eventId: number) => {
    try {
      await resolveEventMutation.mutateAsync({ id: eventId, resolution_notes: 'Resolved by OWNER' });
      toast.success('Security event resolved');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to resolve security event'));
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="space-y-6 animate-in bg-gray-50 min-h-screen p-6" style={{ color: '#F0F4FA' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Security Center</div>
          <div className="page-sub">Security events, authorization enforcement outcomes, and threat monitoring</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Events" value={events.length} icon={<ShieldAlert className="h-5 w-5" />} color="primary" />
        <StatCard title="Open Events" value={openEvents} icon={<AlertCircle className="h-5 w-5" />} color="warning" />
        <StatCard title="Blocked Attempts" value={blockedEvents} icon={<XCircle className="h-5 w-5" />} color="danger" />
        <StatCard title="Critical Severity" value={criticalEvents} icon={<Shield className="h-5 w-5" />} color="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card variant="hover" padding="lg" className="lg:col-span-2">
          <div className="section-title flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-accent-cyan" />
            Recent Security Events
          </div>
          <div className="space-y-3">
            {events.slice(0, 10).map((event) => {
              const severity = (event.severity || 'INFO').toUpperCase();
              const status = (event.status || 'OPEN').toUpperCase();
              const isBlocked = status === 'BLOCKED';
              const isCritical = ['CRITICAL', 'SECURITY', 'HIGH'].includes(severity);

              return (
                <div key={event.id} className={`p-4 rounded-xl border transition-colors ${
                  isBlocked ? 'bg-danger/5 border-danger/20' :
                  isCritical ? 'bg-warning/5 border-warning/20' :
                  'bg-bg-elevated/50 border-border-subtle'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isBlocked ? 'bg-danger/10 text-danger' :
                        isCritical ? 'bg-warning/10 text-warning' :
                        'bg-accent-cyan/10 text-accent-cyan'
                      }`}>
                        {isBlocked ? <XCircle className="h-5 w-5" /> : isCritical ? <Shield className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-text-primary">{event.event_type || event.action || 'Security Event'}</span>
                          <Badge variant={isBlocked ? 'danger' : status === 'RESOLVED' ? 'success' : 'warning'} className="text-xs">{status}</Badge>
                          <Badge variant={isCritical ? 'danger' : severity === 'WARNING' ? 'warning' : 'info'} className="text-xs">{severity}</Badge>
                        </div>
                        <div className="text-sm text-text-muted mt-1 flex items-center gap-3 flex-wrap">
                          <span className="font-mono">{event.actor || event.user_email || 'System'}</span>
                          <span className="text-text-dim">•</span>
                          <Badge variant="outline" className="text-xs">{displayRole(event.actor_role || event.role)}</Badge>
                          <span className="text-text-dim">•</span>
                          <span className="font-mono text-xs">{formatDate(event.timestamp || event.created_at || new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(event.id.toString(), 'Event ID')} className="p-1.5" aria-label="Copy ID">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {status !== 'RESOLVED' && (
                        <Button variant="outline" size="sm" onClick={() => handleResolveEvent(event.id)} loading={resolveEventMutation.isPending}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length > 10 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-accent-cyan">
                  View all {events.length} security events
                  <Activity className="h-4 w-4" />
                </Button>
              </div>
            )}
            {events.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-text-primary mb-1">No security events found</p>
                <p>Your system appears secure.</p>
              </div>
            )}
          </div>
        </Card>

        <Card variant="hover" padding="lg">
          <div className="section-title flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-success" />
            System Status
          </div>
          <div className="space-y-4">
            {[
              { label: 'Authentication', status: 'SECURE', icon: Shield, color: 'success', desc: 'JWT + RBAC enforced' },
              { label: 'Authorization', status: 'ENFORCED', icon: ShieldAlert, color: 'success', desc: 'Owner approval required' },
              { label: 'Blockchain', status: 'CONNECTED', icon: Activity, color: 'success', desc: 'RPC responsive' },
              { label: 'Audit Logging', status: 'ACTIVE', icon: Activity, color: 'success', desc: 'All events recorded' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-bg-elevated/50 border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${item.color}/10 text-${item.color} flex items-center justify-center`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-text-primary">{item.label}</span>
                  </div>
                  <Badge variant={item.color === 'success' ? 'success' : 'warning'}>{item.status}</Badge>
                </div>
                <p className="text-xs text-text-dim">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="hover" padding="none">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="section-title flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-accent-cyan" />
            All Security Events
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all duration-200 text-sm appearance-none bg-no-repeat bg-right pr-10"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="BLOCKED">Blocked</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              className="px-4 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all duration-200 text-sm appearance-none bg-no-repeat bg-right pr-10"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="SECURITY">Security</option>
              <option value="HIGH">High</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <Table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Severity</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: '#6B7A94' }} />
                    <p className="text-text-muted">No security events found</p>
                  </td>
                </tr>
              ) : events.map((event) => {
                const severity = (event.severity || 'INFO').toUpperCase();
                const status = (event.status || 'OPEN').toUpperCase();
                const isBlocked = status === 'BLOCKED';
                const isCritical = ['CRITICAL', 'SECURITY', 'HIGH'].includes(severity);

                return (
                  <tr key={event.id} className={`row-hover ${isBlocked ? 'bg-danger/5' : isCritical ? 'bg-warning/5' : ''}`}>
                    <td className="font-mono text-sm">#{event.id}</td>
                    <td className="text-text-muted">{formatDate(event.timestamp || event.created_at || new Date().toISOString())}</td>
                    <td className="font-medium text-text-primary">{event.event_type || event.action || 'Security Event'}</td>
                    <td>{event.actor || event.user_email || 'System'}</td>
                    <td><Badge variant="outline" className="text-xs">{displayRole(event.actor_role || event.role)}</Badge></td>
                    <td><Badge variant={isCritical ? 'danger' : severity === 'WARNING' ? 'warning' : 'info'} className="text-xs">{severity}</Badge></td>
                    <td><Badge variant={isBlocked ? 'danger' : status === 'RESOLVED' ? 'success' : 'warning'} className="text-xs">{status}</Badge></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => handleCopy(event.id.toString(), 'Event ID')} className="p-1.5" aria-label="Copy ID">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        {status !== 'RESOLVED' && (
                          <Button variant="outline" size="sm" onClick={() => handleResolveEvent(event.id)} loading={resolveEventMutation.isPending}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}