import { AlertCircle, CheckCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
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
}

export default function SecurityCenterPage() {
  const { data: securityEventsData, isLoading, refetch } = useSecurityEvents({ page: 1, page_size: 50 });
  const resolveEventMutation = useResolveSecurityEvent();
  const events: SecurityEvent[] = securityEventsData?.items || [];
  const blockedEvents = events.filter((event) => (event.status || '').toUpperCase() === 'BLOCKED').length;
  const openEvents = events.filter((event) => (event.status || '').toUpperCase() !== 'RESOLVED').length;

  const handleResolveEvent = async (eventId: number) => {
    try {
      await resolveEventMutation.mutateAsync({ id: eventId, resolution_notes: 'Resolved by OWNER' });
      toast.success('Security event resolved');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to resolve security event'));
    }
  };

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Security Center</div>
          <div className="page-sub">Security events and authorization enforcement outcomes</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" />Refresh</Button>
      </div>

      <div className="grid grid-3">
        <Card className="stat-card glow"><div className="stat-top"><span className="stat-label">Security Events</span><span className="stat-icon"><ShieldAlert className="h-5 w-5" /></span></div><div className="stat-value">{events.length}</div><div className="stat-foot">From backend security API</div></Card>
        <Card className="stat-card glow"><div className="stat-top"><span className="stat-label">Open Events</span><span className="stat-icon"><AlertCircle className="h-5 w-5" /></span></div><div className="stat-value">{openEvents}</div><div className="stat-foot">Unresolved findings</div></Card>
        <Card className="stat-card glow"><div className="stat-top"><span className="stat-label">Blocked Attempts</span><span className="stat-icon"><ShieldAlert className="h-5 w-5" style={{ color: '#dd5b64' }} /></span></div><div className="stat-value">{blockedEvents}</div><div className="stat-foot">Owner-only operations blocked</div></Card>
      </div>

      <Card>
        <div className="section-title" style={{ marginTop: 0 }}>Security Events</div>
        {isLoading && !securityEventsData ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#191e29] rounded animate-pulse" />)}</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8991a3', padding: 30 }}><CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />No security events found.</div>
        ) : (
          <div className="table-wrap">
            <Table>
              <thead><tr><th>Event ID</th><th>Timestamp</th><th>Event Type</th><th>Actor</th><th>Role</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{events.map((event) => {
                const severity = (event.severity || 'INFO').toUpperCase();
                const status = (event.status || 'OPEN').toUpperCase();
                const isBlocked = status === 'BLOCKED';
                return (
                  <tr key={event.id} className="row-hover" style={isBlocked ? { background: 'rgba(221,91,100,0.06)' } : undefined}>
                    <td className="mono">#{event.id}</td>
                    <td>{formatDate(event.timestamp || event.created_at || new Date().toISOString())}</td>
                    <td>{event.event_type || event.action || 'Security Event'}</td>
                    <td>{event.actor || event.user_email || 'System'}</td>
                    <td><Badge variant="outline">{displayRole(event.actor_role || event.role)}</Badge></td>
                    <td><Badge variant={severity === 'SECURITY' || severity === 'CRITICAL' || severity === 'HIGH' ? 'danger' : severity === 'WARNING' ? 'warning' : 'info'}>{severity}</Badge></td>
                    <td><Badge variant={isBlocked ? 'danger' : status === 'RESOLVED' ? 'success' : 'warning'}>{status}</Badge></td>
                    <td>{status !== 'RESOLVED' && <Button variant="outline" size="sm" onClick={() => handleResolveEvent(event.id)} loading={resolveEventMutation.isPending}>Resolve</Button>}</td>
                  </tr>
                );
              })}</tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
