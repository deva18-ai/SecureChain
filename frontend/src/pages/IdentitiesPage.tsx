import { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, Key, Plus, Loader2, Search, User, Hash, ExternalLink, Copy, BadgeCheck, Loader2 as LoaderIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge, RoleBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Card, StatCard, CardContent } from '../components/ui/Card';
import { useDids, useCreateDID, useVerifyDID, useMyDid } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { DID } from '../types';
import { getApiErrorMessage } from '../utils/apiError';
import { cn } from '../utils/helpers';

export default function IdentitiesPage() {
  const { hasRole, user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDid, setSelectedDid] = useState<DID | null>(null);
  const [isVerifying, setIsVerifying] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: didsData, isLoading, refetch } = useDids({
    page,
    page_size: 20,
    verified: verifiedFilter,
    search: search || undefined,
  });
  const { data: myDid } = useMyDid();
  const createDIDMutation = useCreateDID();
  const verifyDIDMutation = useVerifyDID();

  const isAdmin = hasRole(['ADMIN']);
  const isManager = hasRole(['ADMIN', 'MANAGER']);
  const canCreate = isAdmin;
  const canVerify = isAdmin;

  const handleCreateDID = async () => {
    try {
      await createDIDMutation.mutateAsync();
      toast.success('DID created successfully');
      setShowCreateModal(false);
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to create DID'));
    }
  };

  const handleVerifyDID = async (didId: number) => {
    setIsVerifying(didId);
    try {
      await verifyDIDMutation.mutateAsync(didId);
      toast.success('DID verified on blockchain');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to verify DID'));
    } finally {
      setIsVerifying(null);
    }
  };

  const handleViewDid = (did: DID) => {
    setSelectedDid(did);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${field} copied`);
  };

  if (isLoading && !didsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6 animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Digital Identity (DID)</h1>
            <p className="page-sub mt-1">Decentralized identifiers anchored to blockchain wallets</p>
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
        <Card variant="hover" padding="lg">
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dids = didsData?.items || [];
  const total = didsData?.total || 0;
  const totalPages = didsData?.total_pages || 1;

  const targets = isAdmin ? dids : dids.filter((d) => d.user_id === user?.id);
  const verifiedCount = targets.filter(d => d.verified).length;
  const pendingCount = targets.filter(d => !d.verified).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Identity (DID)</h1>
          <p className="page-sub mt-1">Decentralized identifiers anchored to blockchain wallets</p>
        </div>
        <div className="page-header-actions flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<LoaderIcon className="h-4 w-4" />}>Refresh</Button>
          {canCreate && <Button size="sm" onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>Create DID</Button>}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="data-grid">
        <StatCard
          title="Total Identities"
          value={total}
          icon={<Key className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Verified"
          value={verifiedCount}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={<Shield className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          title="Your DID"
          value={myDid ? 'Active' : 'None'}
          icon={<User className="h-6 w-6" />}
          color={myDid ? 'success' : 'secondary'}
        />
      </div>

      {/* Current User's DID Panel */}
      {myDid && !isAdmin && !isManager && (
        <Card variant="hover" padding="lg" className="bg-gradient-to-r from-primary-blue to-primary-blue-hover text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-lg">Your Decentralized Identity</p>
                <p className="font-mono text-sm mt-1 opacity-90">{myDid.did}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {myDid.verified ? (
                <StatusBadge status="VERIFIED" className="bg-white/20 text-white border-white/30" />
              ) : (
                <StatusBadge status="PENDING" className="bg-white/20 text-white border-white/30" />
              )}
              {myDid.blockchain_tx_hash && (
                <span className="font-mono text-xs px-3 py-1.5 bg-white/20 rounded-lg">
                  {formatTxHash(myDid.blockchain_tx_hash)}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* DIDs Table */}
      <Card variant="hover" padding="none">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search DIDs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>
          <select
            value={verifiedFilter !== undefined ? String(verifiedFilter) : ''}
            onChange={(e) => { setVerifiedFilter(e.target.value === '' ? undefined : e.target.value === 'true'); setPage(1); }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Pending</option>
          </select>
        </div>

        {targets.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-1">No identities found</p>
            <p className="text-sm text-gray-600">{isAdmin ? 'No DIDs have been created yet.' : 'Your DID will appear here once created.'}</p>
            {canCreate && (
              <Button className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                Create Your First DID
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {targets.map((x) => (
              <div key={x.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary-blue flex items-center justify-center flex-shrink-0">
                      <Key className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-gray-900">{x.user?.full_name || 'Unknown User'}</span>
                        {x.user && (
                          <RoleBadge role={x.user.role} />
                        )}
                        {x.verified ? (
                          <StatusBadge status="VERIFIED" dot />
                        ) : (
                          <StatusBadge status="PENDING" dot />
                        )}
                      </div>
                      <p className="font-mono text-xs text-gray-500 truncate mt-1">{x.did}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="xs" onClick={() => handleCopy(x.did, 'DID')} className="p-2" aria-label="Copy DID">
                      <Copy className={cn('h-4 w-4', copiedField === 'DID' ? 'text-primary-blue' : 'text-gray-400')} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewDid(x)}>
                      View
                    </Button>
                    {canVerify && !x.verified && (
                      <Button size="sm" onClick={() => handleVerifyDID(x.id)} loading={isVerifying === x.id} leftIcon={<CheckCircle className="h-3.5 w-3.5" />}>
                        Verify
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Wallet</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-gray-900 truncate">{formatAddress(x.wallet_address)}</p>
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(x.wallet_address, 'Wallet')} className="p-1" aria-label="Open in explorer">
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Identity Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-gray-900 truncate">{x.identity_hash}</p>
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(x.identity_hash, 'Hash')} className="p-1" aria-label="Copy hash">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Created</p>
                    <p className="text-gray-900">{formatDate(x.created_at)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Verified</p>
                    <p className="text-gray-900">{x.verified_at ? formatDate(x.verified_at) : 'Not verified'}</p>
                  </div>
                </div>

                {x.blockchain_tx_hash && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-medium">Blockchain Transaction</span>
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(x.blockchain_tx_hash!, 'TX Hash')} className="p-1" aria-label="Copy transaction hash">
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    <p className="font-mono text-xs text-gray-900 truncate mt-1">{x.blockchain_tx_hash}</p>
                    {x.blockchain_block_number && (
                      <span className="text-xs text-gray-500 mt-1 inline-block">Block: {x.blockchain_block_number.toLocaleString()}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create DID Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New DID" size="md">
        <div className="space-y-5">
          <p className="text-gray-600 text-sm">This will create a new decentralized identifier (DID) for your account. The DID will be registered on-chain if a wallet is connected.</p>
          <div className="p-4 rounded-lg bg-primary-blue/5 border border-primary-blue/20">
            <div className="flex items-center gap-3 text-gray-700 text-sm">
              <Shield className="h-5 w-5 text-primary-blue" />
              <span>Self-sovereign identity &bull; No central authority &bull; Blockchain-anchored</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDID} loading={createDIDMutation.isPending} leftIcon={<Plus className="h-4 w-4" />}>Create DID</Button>
          </div>
        </div>
      </Modal>

      {/* DID Details Modal */}
      <Modal isOpen={!!selectedDid} onClose={() => setSelectedDid(null)} title="DID Details" size="lg">
        {selectedDid && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">DID Details</span>
                {selectedDid.verified ? (
                  <StatusBadge status="VERIFIED" />
                ) : (
                  <StatusBadge status="PENDING" />
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">DID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-gray-900 break-all flex-1">{selectedDid.did}</p>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(selectedDid.did, 'DID')} className="p-1" aria-label="Copy DID">
                    <Copy className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-gray-900">{formatAddress(selectedDid.wallet_address)}</p>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(selectedDid.wallet_address, 'Wallet')} className="p-1" aria-label="Open in explorer">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Identity Hash</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-gray-900 break-all flex-1">{selectedDid.identity_hash}</p>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(selectedDid.identity_hash, 'Hash')} className="p-1" aria-label="Copy hash">
                    <Hash className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Status</p>
                <StatusBadge status={selectedDid.verified ? 'VERIFIED' : 'PENDING'} />
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Created</p>
                <p className="text-gray-900">{formatDate(selectedDid.created_at)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Verified At</p>
                <p className="text-gray-900">{selectedDid.verified_at ? formatDate(selectedDid.verified_at) : 'Not verified'}</p>
              </div>
              {selectedDid.blockchain_tx_hash && (
                <div className="sm:col-span-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs font-medium">Blockchain Transaction</p>
                    <Button variant="ghost" size="xs" onClick={() => handleCopy(selectedDid.blockchain_tx_hash!, 'TX Hash')} className="p-1" aria-label="Copy transaction hash">
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <p className="font-mono text-sm text-gray-900 truncate">{selectedDid.blockchain_tx_hash}</p>
                </div>
              )}
              {selectedDid.blockchain_block_number && (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-2">Block Number</p>
                  <p className="font-mono text-gray-900">{selectedDid.blockchain_block_number.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setSelectedDid(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}