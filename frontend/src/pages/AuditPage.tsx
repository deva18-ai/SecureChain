import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Download, Search, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useAuditLogs, useVerifyOnBlockchain } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { AuditLog, VerificationResponse } from '../types';

const AUDIT_ACTION_COLORS: Record<string, BadgeVariant> = {
  IDENTITY_CREATED: 'primary',
  IDENTITY_VERIFIED: 'success',
  ROLE_ASSIGNED: 'primary',
  ROLE_REVOKED: 'warning',
  ASSET_MINTED: 'primary',
  ASSET_ALLOCATED: 'success',
  ASSET_TRANSFERRED: 'primary',
  ASSET_BURNED: 'danger',
  ASSET_FROZEN: 'warning',
  ASSET_UNFROZEN: 'success',
  USER_CREATED: 'primary',
  USER_UPDATED: 'primary',
  LOGIN: 'default',
  LOGOUT: 'default',
};

export default function AuditPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string | undefined>(undefined);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [verification, setVerification] = useState<{
    txHash: string;
    tokenId: string;
    did: string;
  }>({ txHash: '', tokenId: '', did: '' });
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  const { data: logsData, isLoading, refetch } = useAuditLogs({
    page,
    page_size: 50,
    action: actionFilter,
    resource_type: resourceTypeFilter,
    blockchain_verified: verifiedFilter,
  });
  const verifyMutation = useVerifyOnBlockchain();

  void hasRole; // role-based logic available for future use

  const actions = [
    'IDENTITY_CREATED', 'IDENTITY_VERIFIED', 'ROLE_ASSIGNED', 'ROLE_REVOKED',
    'ASSET_MINTED', 'ASSET_ALLOCATED', 'ASSET_TRANSFERRED', 'ASSET_BURNED',
    'ASSET_FROZEN', 'ASSET_UNFROZEN', 'USER_CREATED', 'USER_UPDATED', 'LOGIN', 'LOGOUT'
  ];

  const resourceTypes = ['USER', 'DID', 'ASSET', 'TRANSFER', 'ROLE'];

  const handleVerify = async () => {
    const { txHash, tokenId, did } = verification;
    if (!txHash && !tokenId && !did) {
      toast.error('Provide at least one verification parameter');
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyMutation.mutateAsync({
        tx_hash: txHash || undefined,
        token_id: tokenId ? parseInt(tokenId) : undefined,
        did: did || undefined,
      });
      setVerificationResult(result);
      toast.success(result.verified ? 'Verified on blockchain' : 'Verification failed');
    } catch (error: unknown) {
      toast.error('Verification request failed');
      setVerificationResult({ verified: false, error_message: error instanceof Error ? error.message : 'Verification request failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    if (log.blockchain_tx_hash) {
      setVerification({ txHash: log.blockchain_tx_hash, tokenId: '', did: '' });
    }
  };

  const exportLogs = () => {
    toast('Export functionality coming soon');
  };

  if (isLoading && !logsData) {
    return (
      <div className="space-y-6" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Audit & Security Log</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Full chronological event history</div>
          </div>
        </div>
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div className="h-4 w-48 bg-[#191e29] rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#191e29] rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const logs = logsData?.items || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.total_pages || 1;

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Audit & Security Log</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Full chronological event history</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs} size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <div className="p-4 border-b" style={{ borderColor: '#262b37' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef', marginBottom: 4 }}>Blockchain Verification</h3>
          <p style={{ fontSize: 12, color: '#8991a3', marginBottom: 16 }}>
            Verify any transaction, asset ownership, or identity proof directly on the blockchain.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#8991a3', marginBottom: 6 }}>Transaction Hash</label>
              <Input
                value={verification.txHash}
                onChange={(e) => setVerification({ ...verification, txHash: e.target.value })}
                placeholder="0x..."
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#8991a3', marginBottom: 6 }}>Asset Token ID</label>
              <Input
                value={verification.tokenId}
                onChange={(e) => setVerification({ ...verification, tokenId: e.target.value })}
                placeholder="123"
                type="number"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#8991a3', marginBottom: 6 }}>DID</label>
              <Input
                value={verification.did}
                onChange={(e) => setVerification({ ...verification, did: e.target.value })}
                placeholder="did:securechain:..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleVerify} loading={verifying} style={{ flex: 1 }}>
              <CheckCircle className="h-4 w-4" />
              Verify on Blockchain
            </Button>
            <Button variant="outline" onClick={() => setVerification({ txHash: '', tokenId: '', did: '' })} loading={verifying}>
              <XCircle className="h-4 w-4" />
              Clear
            </Button>
          </div>
          {verificationResult && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: verificationResult.verified ? 'rgba(47,168,114,0.1)' : 'rgba(221,91,100,0.1)', border: `1px solid ${verificationResult.verified ? 'rgba(47,168,114,0.3)' : 'rgba(221,91,100,0.3)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {verificationResult.verified ? (
                  <CheckCircle className="h-5 w-5" style={{ color: '#2fa872' }} />
                ) : (
                  <XCircle className="h-5 w-5" style={{ color: '#dd5b64' }} />
                )}
                <span className="font-semibold" style={{ color: verificationResult.verified ? '#2fa872' : '#dd5b64' }}>
                  {verificationResult.verified ? 'VERIFIED ON BLOCKCHAIN' : 'VERIFICATION FAILED'}
                </span>
              </div>
              {verificationResult.verified && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 12 }}>
                  <div>
                    <p style={{ color: '#8991a3', marginBottom: 2 }}>Block Number</p>
                    <p className="font-mono" style={{ color: '#e6e9ef' }}>{verificationResult.block_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#8991a3', marginBottom: 2 }}>Contract</p>
                    <p className="font-mono text-xs truncate" style={{ color: '#e6e9ef' }}>{verificationResult.contract_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#8991a3', marginBottom: 2 }}>Event Type</p>
                    <p className="font-medium" style={{ color: '#e6e9ef' }}>{verificationResult.event_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#8991a3', marginBottom: 2 }}>Actor</p>
                    <p className="font-mono text-xs" style={{ color: '#e6e9ef' }}>{formatAddress(verificationResult.actor || '')}</p>
                  </div>
                  {verificationResult.token_id && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ color: '#8991a3', marginBottom: 2 }}>Token ID</p>
                      <p className="font-mono" style={{ color: '#e6e9ef' }}>{verificationResult.token_id}</p>
                    </div>
                  )}
                  {verificationResult.from_address && verificationResult.to_address && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ color: '#8991a3', marginBottom: 2 }}>Transfer</p>
                      <p className="font-mono text-xs" style={{ color: '#e6e9ef' }}>
                        {formatAddress(verificationResult.from_address)} → {formatAddress(verificationResult.to_address)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {verificationResult.error_message && (
                <p style={{ fontSize: 12, color: '#dd5b64', marginTop: 8 }}>{verificationResult.error_message}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <div className="p-4 border-b" style={{ borderColor: '#262b37', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="flex-1" style={{ maxWidth: 320 }}>
            <Input
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#8991a3' }}>Action:</label>
            <select
              value={actionFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setActionFilter(val === 'all' ? undefined : val); setPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #333a4a', background: '#191e29', color: '#e6e9ef', fontSize: 12 }}
            >
              <option value="all">All Actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <label style={{ fontSize: 12, color: '#8991a3' }}>Resource:</label>
            <select
              value={resourceTypeFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setResourceTypeFilter(val === 'all' ? undefined : val); setPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #333a4a', background: '#191e29', color: '#e6e9ef', fontSize: 12 }}
            >
              <option value="all">All Types</option>
              {resourceTypes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <label style={{ fontSize: 12, color: '#8991a3' }}>Verified:</label>
            <select
              value={verifiedFilter === true ? 'verified' : verifiedFilter === false ? 'unverified' : 'all'}
              onChange={(e) => { const val = e.target.value; setVerifiedFilter(val === 'verified' ? true : val === 'unverified' ? false : undefined); setPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #333a4a', background: '#191e29', color: '#e6e9ef', fontSize: 12 }}
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid #262b37' }}>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Actor</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Action</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Resource</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Role</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Blockchain</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Verified</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12" style={{ color: '#8991a3' }}>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37', fontSize: 12, color: '#8991a3', whiteSpace: 'nowrap' }}>
                      {formatRelativeTime(log.created_at)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      {log.actor ? (
                        <div>
                          <p className="font-medium" style={{ color: '#e6e9ef' }}>{log.actor.full_name}</p>
                          <p className="text-xs font-mono" style={{ color: '#8991a3' }}>{formatAddress(log.actor.wallet_address || '')}</p>
                        </div>
                      ) : log.actor_address ? (
                        <p className="font-mono text-sm">{formatAddress(log.actor_address)}</p>
                      ) : (
                        <span style={{ fontSize: 12, color: '#8991a3' }}>System</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Badge variant={AUDIT_ACTION_COLORS[log.action] || 'default'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <p className="font-medium" style={{ color: '#e6e9ef' }}>{log.resource_type}</p>
                      <p className="text-xs font-mono" style={{ color: '#8991a3' }}>{log.resource_id}</p>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      {log.role && (
                        <Badge variant="outline" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, borderColor: '#333a4a' }}>
                          {log.role === 'ADMIN' ? 'OWNER' : log.role === 'USER' ? 'EMPLOYEE' : log.role}
                        </Badge>
                      )}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      {log.blockchain_tx_hash ? (
                        <span className="font-mono text-xs" style={{ color: '#2fa872' }}>
                          {formatTxHash(log.blockchain_tx_hash)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#8991a3' }}>No tx hash</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Badge variant={log.blockchain_verified ? 'success' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                        {log.blockchain_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: '#262b37', display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween' }}>
            <p className="text-sm" style={{ color: '#8991a3' }}>
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} audit logs
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Details" size="lg">
        {selectedLog && (
          <div className="space-y-4" style={{ color: '#e6e9ef' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Log ID</p>
                <p className="font-mono text-lg font-bold" style={{ color: '#e6e9ef' }}>#{selectedLog.id}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Timestamp</p>
                <p className="text-sm" style={{ color: '#e6e9ef' }}>{formatDate(selectedLog.created_at)}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Actor</p>
                <p className="font-medium" style={{ color: '#e6e9ef' }}>{selectedLog.actor?.full_name || 'System'}</p>
                {selectedLog.actor?.wallet_address && (
                  <p className="text-xs font-mono" style={{ color: '#8991a3' }}>{formatAddress(selectedLog.actor.wallet_address)}</p>
                )}
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Actor Role</p>
                <Badge variant="outline" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, borderColor: '#333a4a' }}>
                  {selectedLog.role === 'ADMIN' ? 'OWNER' : selectedLog.role === 'USER' ? 'EMPLOYEE' : selectedLog.role || 'N/A'}
                </Badge>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Action</p>
                <Badge variant={AUDIT_ACTION_COLORS[selectedLog.action] || 'default'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                  {selectedLog.action.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Resource</p>
                <p className="font-medium" style={{ color: '#e6e9ef' }}>{selectedLog.resource_type}: {selectedLog.resource_id}</p>
              </div>
              {selectedLog.blockchain_tx_hash && (
                <div style={{ gridColumn: 'span 2' }}>
                  <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Blockchain Transaction</p>
                  <p className="font-mono text-sm" style={{ color: '#2fa872' }}>{selectedLog.blockchain_tx_hash}</p>
                </div>
              )}
              {selectedLog.blockchain_block_number && (
                <div>
                  <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Block Number</p>
                  <p className="text-sm" style={{ color: '#e6e9ef' }}>{selectedLog.blockchain_block_number.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Blockchain Verified</p>
                <Badge variant={selectedLog.blockchain_verified ? 'success' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                  {selectedLog.blockchain_verified ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            {selectedLog.details && (
              <div style={{ padding: 16, borderRadius: 8, background: 'rgba(25,30,41,0.5)', border: '1px solid rgba(38,43,55,0.5)' }}>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Details</p>
                <p className="text-sm font-mono" style={{ color: '#e6e9ef' }}>{selectedLog.details}</p>
              </div>
            )}
            {selectedLog.ip_address && (
              <div style={{ padding: 16, borderRadius: 8, background: 'rgba(25,30,41,0.5)', border: '1px solid rgba(38,43,55,0.5)' }}>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Network Info</p>
                <p className="text-xs font-mono" style={{ color: '#8991a3' }}>
                  IP: {selectedLog.ip_address} | UA: {selectedLog.user_agent?.substring(0, 50)}...
                </p>
              </div>
            )}
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid #262b37' }}>
              {selectedLog.blockchain_tx_hash && !selectedLog.blockchain_verified && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const txHash = selectedLog.blockchain_tx_hash;
                    if (!txHash) return;
                    setVerification({ txHash, tokenId: '', did: '' });
                    handleVerify();
                    setSelectedLog(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify on Blockchain
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
