import { useState } from 'react';
import React from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Download, Search, Eye, Shield, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuditLogs, useVerifyOnBlockchain } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { AuditLog, VerificationResponse } from '../types';

export default function AuditPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string | undefined>(undefined);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [verification, setVerification] = useState({ txHash: '', tokenId: '', did: '' });
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

  void hasRole;

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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  if (isLoading && !logsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Audit & Security Log</h1>
          <p className="text-gray-600 mt-1">Full chronological event history with blockchain verification</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const logs = logsData?.items || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.total_pages || 1;

  const stats = {
    total: logs.length,
    verified: logs.filter(l => l.blockchain_verified).length,
    pending: logs.filter(l => !l.blockchain_verified).length,
    security: logs.filter(l => ['ROLE_ASSIGNED', 'ROLE_REVOKED', 'ASSET_FROZEN', 'ASSET_BURNED', 'IDENTITY_VERIFIED'].includes(l.action)).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit & Security Log</h1>
          <p className="text-gray-600 mt-1">Full chronological event history with blockchain verification</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
          <Button variant="outline" size="sm" onClick={exportLogs} leftIcon={<Download className="h-4 w-4" />}>Export</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.verified}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.security}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Blockchain Verification</h2>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">Direct RPC</span>
        </div>
        <p className="text-gray-600 text-sm mb-6">Verify any transaction, asset ownership, or identity proof directly on the blockchain.</p>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Input
            label="Transaction Hash"
            value={verification.txHash}
            onChange={(e) => setVerification({ ...verification, txHash: e.target.value })}
            placeholder="0x..."
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Input
            label="Asset Token ID"
            type="number"
            value={verification.tokenId}
            onChange={(e) => setVerification({ ...verification, tokenId: e.target.value })}
            placeholder="123"
          />
          <Input
            label="DID"
            value={verification.did}
            onChange={(e) => setVerification({ ...verification, did: e.target.value })}
            placeholder="did:securechain:..."
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleVerify} loading={verifying} className="flex-1" leftIcon={<CheckCircle className="h-4 w-4" />}>
            Verify on Blockchain
          </Button>
          <Button variant="outline" onClick={() => setVerification({ txHash: '', tokenId: '', did: '' })} leftIcon={<XCircle className="h-4 w-4" />}>
            Clear
          </Button>
        </div>

        {verificationResult && (
          <div className={`mt-6 p-5 rounded-lg border ${
            verificationResult.verified
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {verificationResult.verified ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <span className={`font-semibold text-lg ${verificationResult.verified ? 'text-green-900' : 'text-red-900'}`}>
                {verificationResult.verified ? 'VERIFIED ON BLOCKCHAIN' : 'VERIFICATION FAILED'}
              </span>
            </div>
            {verificationResult.verified && (
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-1">Block Number</p>
                  <p className="font-mono text-gray-900">{verificationResult.block_number || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-1">Contract</p>
                  <p className="font-mono text-xs text-gray-900 truncate">{verificationResult.contract_address || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-1">Event Type</p>
                  <p className="font-medium text-gray-900">{verificationResult.event_type || 'Unknown'}</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-1">Actor</p>
                  <p className="font-mono text-xs text-gray-900">{formatAddress(verificationResult.actor || '')}</p>
                </div>
              </div>
            )}
            {verificationResult.error_message && (
              <p className="text-sm text-red-700 mt-4">{verificationResult.error_message}</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={actionFilter || 'all'}
                onChange={(e) => { const val = e.target.value; setActionFilter(val === 'all' ? undefined : val); setPage(1); }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                {actions.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
              </select>
              <select
                value={resourceTypeFilter || 'all'}
                onChange={(e) => { const val = e.target.value; setResourceTypeFilter(val === 'all' ? undefined : val); setPage(1); }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">All Resources</option>
                {resourceTypes.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={verifiedFilter === true ? 'verified' : verifiedFilter === false ? 'unverified' : 'all'}
                onChange={(e) => { const val = e.target.value; setVerifiedFilter(val === 'verified' ? true : val === 'unverified' ? false : undefined); setPage(1); }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Blockchain</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Verified</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No audit logs found</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{formatRelativeTime(log.created_at)}</td>
                  <td className="px-4 py-3">
                    {log.actor ? (
                      <div>
                        <p className="font-medium text-gray-900">{log.actor.full_name}</p>
                        <p className="font-mono text-xs text-gray-500">{formatAddress(log.actor.wallet_address || '')}</p>
                      </div>
                    ) : log.actor_address ? (
                      <p className="font-mono text-sm text-gray-900">{formatAddress(log.actor_address)}</p>
                    ) : (
                      <span className="text-gray-500 text-sm">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{log.resource_type}</p>
                    <p className="font-mono text-xs text-gray-500">{log.resource_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    {log.role && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                        {log.role === 'ADMIN' ? 'OWNER' : log.role === 'USER' ? 'EMPLOYEE' : log.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.blockchain_tx_hash ? (
                      <span className="font-mono text-xs text-green-700">{formatTxHash(log.blockchain_tx_hash)}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No tx hash</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.blockchain_verified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                        <Shield className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => handleViewLog(log)} className="p-1.5">
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(log.id.toString(), 'Log ID')} className="p-1.5">
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Details" size="lg">
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">Log #{selectedLog.id}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {selectedLog.action.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Timestamp</p>
                <p className="text-gray-900">{formatDate(selectedLog.created_at)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Actor</p>
                <p className="font-medium text-gray-900">{selectedLog.actor?.full_name || 'System'}</p>
                {selectedLog.actor?.wallet_address && (
                  <p className="font-mono text-xs text-gray-500 mt-1">{formatAddress(selectedLog.actor.wallet_address)}</p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Actor Role</p>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                  {selectedLog.role === 'ADMIN' ? 'OWNER' : selectedLog.role === 'USER' ? 'EMPLOYEE' : selectedLog.role || 'N/A'}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Resource</p>
                <p className="font-medium text-gray-900">{selectedLog.resource_type}: {selectedLog.resource_id}</p>
              </div>
              {selectedLog.blockchain_tx_hash && (
                <div className="sm:col-span-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs font-medium">Blockchain Transaction</p>
                    <Button variant="ghost" size="xs" onClick={() => handleCopy(selectedLog.blockchain_tx_hash!, 'TX Hash')} className="p-1">
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm text-green-700 truncate">{selectedLog.blockchain_tx_hash}</p>
                </div>
              )}
              {selectedLog.blockchain_block_number && (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-2">Block Number</p>
                  <p className="font-mono text-gray-900">{selectedLog.blockchain_block_number.toLocaleString()}</p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Blockchain Verified</p>
                {selectedLog.blockchain_verified ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                    <CheckCircle className="h-3 w-3" /> Yes
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                    <Shield className="h-3 w-3" /> No
                  </span>
                )}
              </div>
            </div>

            {selectedLog.details && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Details</p>
                <p className="font-mono text-sm text-gray-900">{selectedLog.details}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                >
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
