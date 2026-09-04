import { useState } from 'react';
import {
  Shield, Lock, Database, Globe, Server, FileText, Wallet, Blocks,
  CheckCircle, AlertCircle, XCircle, HelpCircle, Zap, Key, UserCog,
  ChevronDown, ChevronUp, Eye, Code, Network, HardDrive, Fingerprint
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  SecurityStatus,
  SystemHealth,
  VerificationBadge,
  ThreatLevel,
} from '../components/security';
import { useBlockchainStatus } from '../hooks/useApi';

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

export default function SecurityCenterPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { data: blockchainStatus } = useBlockchainStatus();

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

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cyber-text">Security Center</h1>
          <p className="text-cyber-textMuted">
            Centralized visibility into security controls implemented by SecureChain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <VerificationBadge
            verified={blockchainStatus?.connected || false}
            blockchainVerified={blockchainStatus?.contract_verified || false}
            size="md"
          />
        </div>
      </div>

      {/* Overall Security Posture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyber-critical/10 text-cyber-critical flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-cyber-textMuted">Critical</p>
              <p className="text-3xl font-heading font-bold text-cyber-text">{overall.critical}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyber-warning/10 text-cyber-warning flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-cyber-textMuted">Degraded</p>
              <p className="text-3xl font-heading font-bold text-cyber-text">{overall.degraded}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyber-success/10 text-cyber-success flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-cyber-textMuted">Operational</p>
              <p className="text-3xl font-heading font-bold text-cyber-text">{overall.operational}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyber-textDim/10 text-cyber-textDim flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-cyber-textMuted">Not Assessed</p>
              <p className="text-3xl font-heading font-bold text-cyber-text">{overall.unknown}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Posture Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-semibold text-cyber-text">Security Posture Score</h2>
          <ThreatLevel level={overall.critical > 0 ? 'critical' : overall.degraded > 0 ? 'medium' : 'low'} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
            <p className="text-4xl font-heading font-bold text-cyber-success">
              {Math.round((overall.operational / overall.total) * 100)}%
            </p>
            <p className="text-sm text-cyber-textMuted mt-1">Controls Operational</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
            <p className="text-4xl font-heading font-bold text-cyber-primary">
              {overall.total}
            </p>
            <p className="text-sm text-cyber-textMuted mt-1">Total Controls</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
            <p className="text-4xl font-heading font-bold text-cyber-warning">
              {overall.degraded + overall.unknown}
            </p>
            <p className="text-sm text-cyber-textMuted mt-1">Need Attention</p>
          </div>
        </div>
      </Card>

      {/* Security Sections */}
      <div className="space-y-4">
        {securitySections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections[section.id];
          const operationalCount = section.controls.filter(c => c.status === 'operational').length;
          const totalCount = section.controls.length;

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-cyber-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyber-primary/10 text-cyber-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-cyber-text">{section.title}</h3>
                    <p className="text-sm text-cyber-textMuted">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    operationalCount === totalCount
                      ? 'bg-cyber-success/10 text-cyber-success border border-cyber-success/30'
                      : operationalCount > totalCount / 2
                      ? 'bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/30'
                      : 'bg-cyber-critical/10 text-cyber-critical border border-cyber-critical/30'
                  )}>
                    {operationalCount}/{totalCount} Operational
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-cyber-textMuted" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-cyber-textMuted" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-cyber-border p-6 animate-in">
                  <div className="space-y-3">
                    {section.controls.map((control, index) => (
                      <SecurityStatus
                        key={`${section.id}-${index}`}
                        status={control.status}
                        label={control.name}
                        description={control.description}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Compliance Frameworks */}
      <Card className="p-6">
        <h2 className="text-lg font-heading font-semibold text-cyber-text mb-6">Compliance Framework Alignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'NIST Cybersecurity Framework', status: 'partial', description: 'Identify, Protect, Detect, Respond, Recover partially covered' },
            { name: 'ISO 27001', status: 'partial', description: 'Access control, audit logging, encryption aligned' },
            { name: 'SOC 2 Type II', status: 'planned', description: 'Audit trail, access controls, monitoring foundation ready' },
            { name: 'CIS Controls v8', status: 'partial', description: 'Inventory, secure config, access control, audit logging' },
            { name: 'GDPR', status: 'partial', description: 'Data minimization, access rights, audit logging supported' },
            { name: 'CERT-In Guidelines', status: 'partial', description: 'Incident response, log retention, vulnerability mgmt' },
          ].map((framework) => (
            <div key={framework.name} className="p-4 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-cyber-text">{framework.name}</h4>
                <Badge variant={
                  framework.status === 'full' ? 'success' :
                  framework.status === 'partial' ? 'warning' :
                  framework.status === 'planned' ? 'info' : 'default'
                }>
                  {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-cyber-textMuted">{framework.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}