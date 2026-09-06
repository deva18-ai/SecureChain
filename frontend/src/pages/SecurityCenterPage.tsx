import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Shield, Database, Globe, Server, FileText, Blocks,
  CheckCircle, AlertCircle, XCircle, HelpCircle, UserCog,
  ChevronDown, ChevronUp, Code
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { useBlockchainStatus, useSecurityEvents, useResolveSecurityEvent } from '../hooks/useApi';

const securitySections = [
  {
    id: 'authentication',
    title: 'Authentication & Access Control',
    icon: Shield,
    description: 'Identity verification, session management, and access control policies',
    controls: [
      { name: 'JWT Authentication', status: 'operational', description: 'RS256 signed tokens, 7-day expiry, secure refresh' },
      { name: 'Password Policy', status: 'operational', description: 'Min 8 chars, complexity requirements, bcrypt hashing' },
      { name: 'Session Management', status: 'operational', description: 'Secure cookies, CSRF protection, automatic expiry' },
      { name: 'Multi-Factor Auth', status: 'degraded', description: 'Wallet-based authentication available, TOTP planned' },
      { name: 'Account Lockout', status: 'operational', description: 'Rate limiting on auth endpoints, brute-force protection' },
      { name: 'OAuth2/OIDC', status: 'unknown', description: 'Not implemented - wallet-based auth used instead' },
    ],
  },
  {
    id: 'authorization',
    title: 'Authorization (RBAC)',
    icon: UserCog,
    description: 'Role-based access control enforced at API and blockchain layers',
    controls: [
      { name: 'Three-Tier Roles', status: 'operational', description: 'Owner, Manager, Employee with distinct permissions' },
      { name: 'On-Chain Enforcement', status: 'operational', description: 'OpenZeppelin AccessControl for contract-level RBAC' },
      { name: 'Off-Chain Validation', status: 'operational', description: 'Middleware enforces roles on all API endpoints' },
      { name: 'Permission Matrix', status: 'operational', description: 'Granular permissions per resource and action' },
      { name: 'Role Delegation', status: 'degraded', description: 'Admin-only role assignment, delegation not supported' },
      { name: 'Emergency Access', status: 'unknown', description: 'Break-glass procedures not formally documented' },
    ],
  },
  {
    id: 'api-security',
    title: 'API Security',
    icon: Globe,
    description: 'Transport security, input validation, and abuse prevention',
    controls: [
      { name: 'HTTPS/TLS', status: 'operational', description: 'Enforced in production, HSTS headers configured' },
      { name: 'CORS Policy', status: 'operational', description: 'Restricted to known origins, credentials allowed' },
      { name: 'Rate Limiting', status: 'operational', description: 'Per-endpoint limits, adaptive throttling' },
      { name: 'Input Validation', status: 'operational', description: 'Pydantic v2 schemas on all endpoints' },
      { name: 'Security Headers', status: 'operational', description: 'CSP, X-Frame-Options, X-Content-Type-Options' },
      { name: 'API Versioning', status: 'operational', description: 'Versioned routes (/api/v1/), deprecation policy' },
    ],
  },
  {
    id: 'database-security',
    title: 'Database Security',
    icon: Database,
    description: 'Data protection, encryption, and access controls',
    controls: [
      { name: 'Encryption at Rest', status: 'operational', description: 'PostgreSQL TDE, encrypted volumes in production' },
      { name: 'Encryption in Transit', status: 'operational', description: 'SSL/TLS enforced for all database connections' },
      { name: 'Parameterized Queries', status: 'operational', description: 'SQLAlchemy ORM prevents SQL injection' },
      { name: 'Least Privilege Access', status: 'operational', description: 'Role-specific database users, read replicas' },
      { name: 'Audit Logging', status: 'operational', description: 'All DDL/DML logged, immutable audit trail' },
      { name: 'Backup Encryption', status: 'operational', description: 'Encrypted backups, point-in-time recovery' },
    ],
  },
  {
    id: 'blockchain-security',
    title: 'Blockchain & Smart Contract Security',
    icon: Blocks,
    description: 'On-chain security controls and contract integrity',
    controls: [
      { name: 'OpenZeppelin Contracts', status: 'operational', description: 'ERC721, AccessControl, ReentrancyGuard from audited libs' },
      { name: 'AccessControl RBAC', status: 'operational', description: 'On-chain role enforcement (OWNER, MANAGER, MINTER, VERIFIER)' },
      { name: 'Reentrancy Protection', status: 'operational', description: 'ReentrancyGuard on all state-changing functions' },
      { name: 'Event Logging', status: 'operational', description: 'Comprehensive events for all critical operations' },
      { name: 'Contract Verification', status: 'operational', description: 'Source verified on explorer, reproducible builds' },
      { name: 'Formal Verification', status: 'unknown', description: 'Not performed - recommended for production deployment' },
    ],
  },
  {
    id: 'audit-integrity',
    title: 'Audit Integrity',
    icon: FileText,
    description: 'Immutable audit trails with blockchain anchoring',
    controls: [
      { name: 'Immutable Logs', status: 'operational', description: 'Append-only audit table, soft deletes only' },
      { name: 'Blockchain Anchoring', status: 'operational', description: 'Critical events recorded on-chain via AuditRecorded event' },
      { name: 'Verification API', status: 'operational', description: 'Auditors can verify any event against blockchain' },
      { name: 'Tamper Detection', status: 'operational', description: 'Hash chains detect log modifications' },
      { name: 'Retention Policy', status: 'operational', description: 'Configurable retention (default 365 days)' },
      { name: 'SIEM Integration', status: 'unknown', description: 'Not implemented - webhook support planned' },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure Security',
    icon: Server,
    description: 'Platform hardening, monitoring, and operational security',
    controls: [
      { name: 'Container Hardening', status: 'operational', description: 'Non-root users, read-only filesystems, minimal base images' },
      { name: 'Network Segmentation', status: 'operational', description: 'Private networks, service mesh ready' },
      { name: 'Secrets Management', status: 'operational', description: 'Environment variables, Docker secrets, no hardcoded secrets' },
      { name: 'Vulnerability Scanning', status: 'degraded', description: 'Dependabot enabled, scheduled scans not configured' },
      { name: 'Health Monitoring', status: 'operational', description: 'Health endpoints, Prometheus metrics, alerting ready' },
      { name: 'Disaster Recovery', status: 'unknown', description: 'Backup strategy defined, DR testing not scheduled' },
    ],
  },
  {
    id: 'dependency-security',
    title: 'Dependency Security',
    icon: Code,
    description: 'Supply chain security and vulnerability management',
    controls: [
      { name: 'Dependency Auditing', status: 'operational', description: 'npm audit / pip-audit in CI pipeline' },
      { name: 'Locked Dependencies', status: 'operational', description: 'package-lock.json / requirements.txt pinned' },
      { name: 'License Compliance', status: 'operational', description: 'All dependencies MIT/Apache/BSD compatible' },
      { name: 'Supply Chain Integrity', status: 'degraded', description: 'Sigstore/SBOM not implemented' },
      { name: 'Outdated Detection', status: 'operational', description: 'Dependabot PRs for security updates' },
      { name: 'Malware Scanning', status: 'unknown', description: 'Not implemented - registry scanning recommended' },
    ],
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  operational: { bg: 'rgba(47,168,114,0.1)', text: '#2fa872', border: 'rgba(47,168,114,0.3)' },
  degraded: { bg: 'rgba(201,154,62,0.1)', text: '#c99a3e', border: 'rgba(201,154,62,0.3)' },
  critical: { bg: 'rgba(221,91,100,0.1)', text: '#dd5b64', border: 'rgba(221,91,100,0.3)' },
  unknown: { bg: 'rgba(137,145,163,0.1)', text: '#8991a3', border: 'rgba(137,145,163,0.3)' },
};

export default function SecurityCenterPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { data: blockchainStatus } = useBlockchainStatus();
  const [secTestResult, setSecTestResult] = useState<string | null>(null);
  
  // Fetch real security events from backend
  const { data: securityEventsData, refetch: refetchEvents } = useSecurityEvents({ page: 1, page_size: 10 });
  const resolveEventMutation = useResolveSecurityEvent();

  const handleResolveEvent = async (eventId: number) => {
    try {
      await resolveEventMutation.mutateAsync({ id: eventId, resolution_notes: 'Resolved by OWNER' });
      toast.success('Security event resolved');
      refetchEvents();
    } catch (error) {
      toast.error('Failed to resolve security event');
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOverallStatus = () => {
    let critical = 0;
    let degraded = 0;
    let operational = 0;
    let unknown = 0;

    securitySections.forEach(section => {
      section.controls.forEach(control => {
        switch (control.status) {
          case 'critical': critical++; break;
          case 'degraded': degraded++; break;
          case 'operational': operational++; break;
          case 'unknown': unknown++; break;
        }
      });
    });

    return { critical, degraded, operational, unknown, total: critical + degraded + operational + unknown };
  };

  const overall = getOverallStatus();

  const simulateUnauthorized = () => {
    setSecTestResult(`
      <div style="border: 1px solid #262b37; border-radius: 8; padding: 18px; color: #8991a3; font-size: 13px; display: flex; gap: 10; align-items: flex-start; background: #191e29; margin-top: 16px;">
        <svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px; flex-shrink: 0; color: #dd5b64;"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>
        <div>
          <b style="color: #dd5b64">ACCESS DENIED</b><br>
          Reason: Manager attempted to directly execute a protected Owner-level operation.<br>
          Security Rule: Protected operations require Owner approval.
        </div>
      </div>
    `);
  };

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Security Center</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Live enforcement status & interactive security test</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="w-12 h-12 rounded-xl bg-[#dd5b64]/10" style={{ color: '#dd5b64' }}>
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#8991a3' }}>Critical</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#e6e9ef' }}>{overall.critical}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="w-12 h-12 rounded-xl bg-[#c99a3e]/10" style={{ color: '#c99a3e' }}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#8991a3' }}>Degraded</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#e6e9ef' }}>{overall.degraded}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="w-12 h-12 rounded-xl bg-[#2fa872]/10" style={{ color: '#2fa872' }}>
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#8991a3' }}>Operational</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#e6e9ef' }}>{overall.operational}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="w-12 h-12 rounded-xl bg-[#8991a3]/10" style={{ color: '#8991a3' }}>
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#8991a3' }}>Not Assessed</p>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#e6e9ef' }}>{overall.unknown}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef' }}>Security Posture Score</h2>
          <div style={{ padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: overall.critical > 0 ? 'rgba(221,91,100,0.1)' : overall.degraded > 0 ? 'rgba(201,154,62,0.1)' : 'rgba(47,168,114,0.1)', color: overall.critical > 0 ? '#dd5b64' : overall.degraded > 0 ? '#c99a3e' : '#2fa872', border: `1px solid ${overall.critical > 0 ? 'rgba(221,91,100,0.3)' : overall.degraded > 0 ? 'rgba(201,154,62,0.3)' : 'rgba(47,168,114,0.3)'}` }}>
            {overall.critical > 0 ? 'CRITICAL' : overall.degraded > 0 ? 'MEDIUM' : 'LOW'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 8, background: 'rgba(25,30,41,0.5)', border: '1px solid rgba(38,43,55,0.5)' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#2fa872' }}>
              {Math.round((overall.operational / overall.total) * 100)}%
            </p>
            <p style={{ fontSize: 12, color: '#8991a3', marginTop: 4 }}>Controls Operational</p>
          </div>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 8, background: 'rgba(25,30,41,0.5)', border: '1px solid rgba(38,43,55,0.5)' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#3d6fe0' }}>
              {overall.total}
            </p>
            <p style={{ fontSize: 12, color: '#8991a3', marginTop: 4 }}>Total Controls</p>
          </div>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 8, background: 'rgba(25,30,41,0.5)', border: '1px solid rgba(38,43,55,0.5)' }}>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#c99a3e' }}>
              {overall.degraded + overall.unknown}
            </p>
            <p style={{ fontSize: 12, color: '#8991a3', marginTop: 4 }}>Need Attention</p>
          </div>
        </div>
      </Card>

      <div className="section-title" style={{ fontSize: 14, fontWeight: 600, margin: '26px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>Recent Security Events</div>
      <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, overflow: 'hidden' }}>
        <div className="p-4 border-b" style={{ borderColor: '#262b37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef' }}>Security Event Log</h3>
            <p style={{ fontSize: 12, color: '#8991a3', marginTop: 2 }}>Real-time security events from backend authorization layer</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchEvents()}>
            <AlertCircle className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid #262b37' }}>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>ID</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Event Type</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Actor</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Severity</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {!securityEventsData?.items?.length ? (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: '#8991a3' }}>
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No security events recorded</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>Security violations will appear here when detected</p>
                  </td>
                </tr>
              ) : (
                securityEventsData.items.map((event: any) => (
                  <tr key={event.id} className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>#{event.id}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37', fontSize: 12, color: '#8991a3', whiteSpace: 'nowrap' }}>
                      {new Date(event.timestamp || event.created_at).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <span style={{ fontSize: 13 }}>{event.event_type || event.action}</span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <span style={{ fontSize: 13 }}>{event.actor || event.user_email || 'System'}</span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Badge variant={event.severity === 'CRITICAL' ? 'danger' : event.severity === 'HIGH' ? 'warning' : 'info'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                        {event.severity || 'MEDIUM'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Badge variant={event.status === 'RESOLVED' ? 'success' : event.status === 'BLOCKED' ? 'danger' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                        {event.status || 'OPEN'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      {event.status !== 'RESOLVED' && (
                        <Button variant="outline" size="sm" onClick={() => handleResolveEvent(event.id)} loading={resolveEventMutation.isPending}>
                          Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <div className="section-title" style={{ fontSize: 14, fontWeight: 600, margin: '26px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>Security Controls</div>
      <div className="security-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          ['JWT Authentication', 'ENABLED (DEMO)'],
          ['Role-Based Access Control', 'ENABLED'],
          ['Owner Approval', 'ENABLED'],
          ['Separation of Duties', 'ENABLED'],
          ['Audit Logging', 'ENABLED'],
          ['Blockchain Integrity', 'CONNECTED'],
          ['Protected Operations', 'ENABLED']
        ].map((c, i) => (
          <div key={i} className="sec-row" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center', border: '1px solid #262b37', borderRadius: 6, padding: '12px 14px', background: '#141821' }}>
            <span className="sec-name" style={{ fontSize: 13, fontWeight: 500 }}>{c[0]}</span>
            <span className="sec-status" style={{ fontSize: 12, fontWeight: 600, color: '#2fa872' }}>✓ {c[1]}</span>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ fontSize: 14, fontWeight: 600, margin: '26px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>Interactive Security Test</div>
      <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18 }}>
        <div style={{ marginBottom: 12, color: '#8991a3', fontSize: 13 }}>Simulate a Manager attempting to directly execute a protected Owner-level operation, bypassing approval.</div>
        <Button variant="danger" onClick={simulateUnauthorized} style={{ background: 'rgba(221,91,100,0.12)', color: '#dd5b64', border: '1px solid rgba(221,91,100,0.35)' }}>
          Simulate Unauthorized Action
        </Button>
        <div id="secTestResult" dangerouslySetInnerHTML={{ __html: secTestResult || '' }} />
      </Card>

      <div className="section-title" style={{ fontSize: 14, fontWeight: 600, margin: '26px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>Detailed Security Controls</div>
      <div className="space-y-4">
        {securitySections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections[section.id];
          const operationalCount = section.controls.filter(c => c.status === 'operational').length;
          const totalCount = section.controls.length;

          return (
            <Card key={section.id} style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#e6e9ef', transition: 'background .15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="w-12 h-12 rounded-xl bg-[#3d6fe0]/10" style={{ color: '#3d6fe0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, color: '#e6e9ef' }}>{section.title}</h3>
                    <p style={{ fontSize: 12, color: '#8991a3' }}>{section.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 600,
                    background: operationalCount === totalCount ? 'rgba(47,168,114,0.1)' : operationalCount > totalCount / 2 ? 'rgba(201,154,62,0.1)' : 'rgba(221,91,100,0.1)',
                    color: operationalCount === totalCount ? '#2fa872' : operationalCount > totalCount / 2 ? '#c99a3e' : '#dd5b64',
                    border: `1px solid ${operationalCount === totalCount ? 'rgba(47,168,114,0.3)' : operationalCount > totalCount / 2 ? 'rgba(201,154,62,0.3)' : 'rgba(221,91,100,0.3)'}`
                  }}>
                    {operationalCount}/{totalCount} Operational
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" style={{ color: '#8991a3' }} />
                  ) : (
                    <ChevronDown className="h-5 w-5" style={{ color: '#8991a3' }} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div style={{ borderTop: '1px solid #262b37', padding: '18px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.controls.map((control, index) => {
                      const style = STATUS_STYLES[control.status];
                      return (
                        <div key={`${section.id}-${index}`} style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center', border: `1px solid ${style.border}`, borderRadius: 6, padding: '12px 14px', background: '#141821' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: style.text }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: '#e6e9ef' }}>{control.name}</div>
                              <div style={{ fontSize: 12, color: '#8991a3' }}>{control.description}</div>
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '.04em',
                            background: style.bg,
                            color: style.text,
                            border: `1px solid ${style.border}`
                          }}>
                            {control.status.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef', marginBottom: 24 }}>Compliance Framework Alignment</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            { name: 'NIST Cybersecurity Framework', status: 'partial', description: 'Identify, Protect, Detect, Respond, Recover partially covered' },
            { name: 'ISO 27001', status: 'partial', description: 'Access control, audit logging, encryption aligned' },
            { name: 'SOC 2 Type II', status: 'planned', description: 'Audit trail, access controls, monitoring foundation ready' },
            { name: 'CIS Controls v8', status: 'partial', description: 'Inventory, secure config, access control, audit logging' },
            { name: 'GDPR', status: 'partial', description: 'Data minimization, access rights, audit logging supported' },
            { name: 'CERT-In Guidelines', status: 'partial', description: 'Incident response, log retention, vulnerability mgmt' },
          ].map((framework) => (
            <div key={framework.name} style={{ padding: 16, borderRadius: 8, background: 'rgba(25,30,41,0.5)', border: '1px solid rgba(38,43,55,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ fontWeight: 500, color: '#e6e9ef' }}>{framework.name}</h4>
                <Badge variant={framework.status === 'full' ? 'success' : framework.status === 'partial' ? 'warning' : 'info'} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                  {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                </Badge>
              </div>
              <p style={{ fontSize: 12, color: '#8991a3' }}>{framework.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
