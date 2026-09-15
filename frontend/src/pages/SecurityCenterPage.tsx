import { AlertCircle, CheckCircle, RefreshCw, ShieldAlert, Shield, Activity, XCircle, ChevronDown, ChevronUp, Eye, Copy, Filter, Loader2 as LoaderIcon } from 'lucide-react';
import { Card, StatCard, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge, RoleBadge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useSecurityEvents, useResolveSecurityEvent } from '../hooks/useApi';
import { displayRole, formatDate } from '../utils/helpers';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';
import { cn } from '../utils/helpers';

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

  const getSeverityBadge = (severity: string) => {
    const sev = severity.toUpperCase();
    if (['CRITICAL', 'SECURITY', 'HIGH'].includes(sev)) return 'danger';
    if (sev === 'WARNING' || sev === 'MEDIUM') return 'warning';
    return 'primary';
  };

  const getStatusBadge = (status: string) => {
    const st = status.toUpperCase();
    if (st === 'BLOCKED') return 'danger';
    if (st === 'RESOLVED') return 'success';
    return 'warning';
  };

  if (isLoading && !securityEventsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6 animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Security Center</h1>
            <p className="page-sub">Security events, authorization enforcement outcomes, and threat monitoring</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<LoaderIcon className="h-4 w-4" />}>Refresh</Button>
        </div>
        <div className="data-grid">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Security Center</h1>
          <p className="page-sub">Security events, authorization enforcement outcomes, and threat monitoring</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<LoaderIcon className="h-4 w-4" />}>Refresh</Button>
      </div>

      {/* Statistics Cards */}
      <div className="data-grid">
        <StatCard
          title="Total Events"
          value={events.length}
          icon={<ShieldAlert className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Open Events"
          value={openEvents}
          icon={<AlertCircle className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          title="Blocked Attempts"
          value={blockedEvents}
          icon={<XCircle className="h-6 w-6" />}
          color="danger"
        />
        <StatCard
          title="Critical Severity"
          value={criticalEvents}
          icon={<Shield className="h-6 w-6" />}
          color="danger"
        />
      </div>

      {/* Main Content Grid */}
      <div className="data-grid-3">
        {/* Recent Security Events */}
        <Card className="lg:col-span-2" variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-blue" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => {
                const severity = (event.severity || 'INFO').toUpperCase();
                const status = (event.status || 'OPEN').toUpperCase();
                const isBlocked = status === 'BLOCKED';
                const isCritical = ['CRITICAL', 'SECURITY', 'HIGH'].includes(severity);

                return (
                  <div key={event.id} className={cn(
                    'p-4 rounded-xl border transition-colors',
                    isBlocked ? 'bg-danger-bg border-danger/30' :
                    isCritical ? 'bg-warning-bg border-warning/30' :
                    'bg-gray-50 border-gray-200'
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          isBlocked ? 'bg-danger-bg text-danger' :
                          isCritical ? 'bg-warning-bg text-warning' :
                          'bg-primary-blue/10 text-primary-blue'
                        )}>
                          {isBlocked ? <XCircle className="h-5 w-5" /> : isCritical ? <Shield className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-gray-900">{event.event_type || event.action || 'Security Event'}</span>
                            <StatusBadge status={status} />
                            <Badge variant={getSeverityBadge(severity)}>{severity}</Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                            <span className="font-mono">{event.actor || event.user_email || 'System'}</span>
                            <span className="text-gray-400">•</span>
                            <RoleBadge role={event.actor_role || event.role || 'USER'} />
                            <span className="text-gray-400">•</span>
                            <span className="font-mono text-xs">{formatDate(event.timestamp || event.created_at || new Date().toISOString())}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="xs" onClick={() => handleCopy(event.id.toString(), 'Event ID')} className="p-1.5" aria-label="Copy Event ID">
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
                  <Button variant="ghost" size="sm" className="text-primary-blue">
                    View all {events.length} security events
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {events.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-gray-900 mb-1">No security events found</p>
                  <p>Your system appears secure.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Authentication', status: 'SECURE', icon: Shield, color: 'success', desc: 'JWT + RBAC enforced' },
                { label: 'Authorization', status: 'ENFORCED', icon: ShieldAlert, color: 'success', desc: 'Owner approval required' },
                { label: 'Blockchain', status: 'CONNECTED', icon: Activity, color: 'success', desc: 'RPC responsive' },
                { label: 'Audit Logging', status: 'ACTIVE', icon: Activity, color: 'success', desc: 'All events recorded' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', `bg-${item.color}/10 text-${item.color}`)}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Security Events Table */}
        <Card variant="hover" padding="none" className="lg:col-span-3">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="section-title flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary-blue" />
              All Security Events
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-sm appearance-none bg-no-repeat bg-right pr-10"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="BLOCKED">Blocked</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <select
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-sm appearance-none bg-no-repeat bg-right pr-10"
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                      <p className="text-gray-500">No security events found</p>
                    </TableCell>
                  </TableRow>
                ) : events.map((event) => {
                  const severity = (event.severity || 'INFO').toUpperCase();
                  const status = (event.status || 'OPEN').toUpperCase();
                  const isBlocked = status === 'BLOCKED';
                  const isCritical = ['CRITICAL', 'SECURITY', 'HIGH'].includes(severity);

                  return (
                    <TableRow
                      key={event.id}
                      className={cn(
                        isBlocked ? 'bg-danger-bg' :
                        isCritical ? 'bg-warning-bg' : ''
                      )}
                    >
                      <TableCell className="font-mono text-sm">#{event.id}</TableCell>
                      <TableCell className="text-gray-500">{formatDate(event.timestamp || event.created_at || new Date().toISOString())}</TableCell>
                      <TableCell className="font-medium text-gray-900">{event.event_type || event.action || 'Security Event'}</TableCell>
                      <TableCell>{event.actor || event.user_email || 'System'}</TableCell>
                      <TableCell><RoleBadge role={event.actor_role || event.role || 'USER'} /></TableCell>
                      <TableCell><Badge variant={getSeverityBadge(severity)}>{severity}</Badge></TableCell>
                      <TableCell><StatusBadge status={status} /></TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}