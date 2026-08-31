import { useState } from 'react';
import { Search, Eye, Loader2, AlertCircle, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useAuditLogs, useVerifyOnBlockchain } from '../hooks/useApi';
import { formatAddress, formatDate, getStatusColor, formatTxHash, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AUDIT_ACTION_COLORS: Record<string, string> = {
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
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [verification, setVerification] = useState<{
    txHash: string;
    tokenId: string;
    did: string;
  }>({ txHash: '', tokenId: '', did: '' });
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const { data: logsData, isLoading, error, refetch } = useAuditLogs({
    page,
    page_size: 50,
    action: actionFilter,
    resource_type: resourceTypeFilter,
    blockchain_verified: verifiedFilter,
  });
  const verifyMutation = useVerifyOnBlockchain();

  const isAdmin = hasRole(['ADMIN']);
  const isAuditor = hasRole(['ADMIN', 'AUDITOR']);

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
    } catch (error: any) {
      toast.error('Verification request failed');
      setVerificationResult({ verified: false, error_message: error.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleViewLog = (log: any) => {
    setSelectedLog(log);
    if (log.blockchain_tx_hash) {
      setVerification({ txHash: log.blockchain_tx_hash, tokenId: '', did: '' });
    }
  };

  const exportLogs = () => {
    // In a real app, this would call an export endpoint
    toast('Export functionality coming soon');
  };

  if (isLoading && !logsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Audit Trail</h1>
            <p className="text-dark-600 dark:text-dark-400">Immutable audit logs with blockchain verification</p>
          </div>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-100 dark:bg-dark-800 rounded" />
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
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Audit Trail</h1>
          <p className="text-dark-600 dark:text-dark-400">Immutable audit logs with blockchain verification capability</p>
        </div>
        <div className="flex items-center gap-3">
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

      <Card className="mb-6">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Blockchain Verification</h3>
          <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
            Verify any transaction, asset ownership, or identity proof directly on the blockchain.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Transaction Hash</label>
              <Input
                value={verification.txHash}
                onChange={(e) => setVerification({ ...verification, txHash: e.target.value })}
                placeholder="0x..."
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Asset Token ID</label>
              <Input
                value={verification.tokenId}
                onChange={(e) => setVerification({ ...verification, tokenId: e.target.value })}
                placeholder="123"
                type="number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">DID</label>
              <Input
                value={verification.did}
                onChange={(e) => setVerification({ ...verification, did: e.target.value })}
                placeholder="did:securechain:..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleVerify} loading={verifying} className="flex-1">
              <CheckCircle className="h-4 w-4" />
              Verify on Blockchain
            </Button>
            <Button variant="outline" onClick={() => setVerification({ txHash: '', tokenId: '', did: '' })} loading={verifying}>
              <XCircle className="h-4 w-4" />
              Clear
            </Button>
          </div>
          {verificationResult && (
            <div className={`mt-4 p-4 rounded-lg ${verificationResult.verified ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                {verificationResult.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className="font-semibold text-dark-900 dark:text-white">
                  {verificationResult.verified ? 'VERIFIED ON BLOCKCHAIN' : 'VERIFICATION FAILED'}
                </span>
              </div>
              {verificationResult.verified && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-dark-500 dark:text-dark-400">Block Number</p>
                    <p className="font-mono text-dark-900 dark:text-white">{verificationResult.block_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 dark:text-dark-400">Contract</p>
                    <p className="font-mono text-xs text-dark-900 dark:text-white truncate">{verificationResult.contract_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 dark:text-dark-400">Event Type</p>
                    <p className="font-medium text-dark-900 dark:text-white">{verificationResult.event_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-dark-500 dark:text-dark-400">Actor</p>
                    <p className="font-mono text-xs text-dark-900 dark:text-white">{formatAddress(verificationResult.actor || '')}</p>
                  </div>
                  {verificationResult.token_id && (
                    <div className="col-span-2">
                      <p className="text-dark-500 dark:text-dark-400">Token ID</p>
                      <p className="font-mono text-dark-900 dark:text-white">{verificationResult.token_id}</p>
                    </div>
                  )}
                  {verificationResult.from_address && verificationResult.to_address && (
                    <div className="col-span-2">
                      <p className="text-dark-500 dark:text-dark-400">Transfer</p>
                      <p className="font-mono text-xs text-dark-900 dark:text-white">
                        {formatAddress(verificationResult.from_address)} → {formatAddress(verificationResult.to_address)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {verificationResult.error_message && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{verificationResult.error_message}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-dark-600 dark:text-dark-400">Action:</label>
            <select
              value={actionFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setActionFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All Actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <label className="text-sm text-dark-600 dark:text-dark-400">Resource:</label>
            <select
              value={resourceTypeFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setResourceTypeFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              {resourceTypes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <label className="text-sm text-dark-600 dark:text-dark-400">Verified:</label>
            <select
              value={verifiedFilter === true ? 'verified' : verifiedFilter === false ? 'unverified' : 'all'}
              onChange={(e) => { const val = e.target.value; setVerifiedFilter(val === 'verified' ? true : val === 'unverified' ? false : undefined); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Role</th>
                <th>Blockchain</th>
                <th>Verified</th>
                <th className="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-dark-500 dark:text-dark-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-sm text-dark-600 dark:text-dark-400 whitespace-nowrap">
                      {formatRelativeTime(log.created_at)}
                    </td>
                    <td>
                      {log.actor ? (
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white">{log.actor.full_name}</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{formatAddress(log.actor.wallet_address || '')}</p>
                        </div>
                      ) : log.actor_address ? (
                        <p className="font-mono text-sm">{formatAddress(log.actor_address)}</p>
                      ) : (
                        <span className="text-sm text-dark-500 dark:text-dark-400">System</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={AUDIT_ACTION_COLORS[log.action] || 'default'}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-dark-900 dark:text-white">{log.resource_type}</p>
                      <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{log.resource_id}</p>
                    </td>
                    <td>
                      {log.role && (
                        <Badge variant="outline">{log.role}</Badge>
                      )}
                    </td>
                    <td>
                      {log.blockchain_tx_hash ? (
                        <span className="font-mono text-xs text-green-600 dark:text-green-400">
                          {formatTxHash(log.blockchain_tx_hash)}
                        </span>
                      ) : (
                        <span className="text-xs text-dark-500 dark:text-dark-400">No tx hash</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={log.blockchain_verified ? 'success' : 'warning'}>
                        {log.blockchain_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="text-right">
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
          <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} audit logs
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Details" size="lg">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Log ID</p>
                <p className="font-mono text-lg font-bold text-dark-900 dark:text-white">#{selectedLog.id}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Timestamp</p>
                <p className="text-sm text-dark-900 dark:text-white">{formatDate(selectedLog.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Actor</p>
                <p className="font-medium text-dark-900 dark:text-white">{selectedLog.actor?.full_name || 'System'}</p>
                {selectedLog.actor?.wallet_address && (
                  <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{formatAddress(selectedLog.actor.wallet_address)}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Actor Role</p>
                <Badge variant="outline">{selectedLog.role || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Action</p>
                <Badge variant={AUDIT_ACTION_COLORS[selectedLog.action] || 'default'}>
                  {selectedLog.action.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Resource</p>
                <p className="font-medium text-dark-900 dark:text-white">{selectedLog.resource_type}: {selectedLog.resource_id}</p>
              </div>
              {selectedLog.blockchain_tx_hash && (
                <div className="col-span-2">
                  <p className="text-sm text-dark-500 dark:text-dark-400">Blockchain Transaction</p>
                  <p className="font-mono text-sm text-green-600 dark:text-green-400">{selectedLog.blockchain_tx_hash}</p>
                </div>
              )}
              {selectedLog.blockchain_block_number && (
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Block Number</p>
                  <p className="text-sm text-dark-900 dark:text-white">{selectedLog.blockchain_block_number.toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Blockchain Verified</p>
                <Badge variant={selectedLog.blockchain_verified ? 'success' : 'warning'}>
                  {selectedLog.blockchain_verified ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            {selectedLog.details && (
              <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Details</p>
                <p className="text-sm text-dark-900 dark:text-white font-mono">{selectedLog.details}</p>
              </div>
            )}
            {selectedLog.ip_address && (
              <div className="p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Network Info</p>
                <p className="text-xs text-dark-600 dark:text-dark-400 font-mono">
                  IP: {selectedLog.ip_address} | UA: {selectedLog.user_agent?.substring(0, 50)}...
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
              {selectedLog.blockchain_tx_hash && !selectedLog.blockchain_verified && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setVerification({ txHash: selectedLog.blockchain_tx_hash, tokenId: '', did: '' });
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