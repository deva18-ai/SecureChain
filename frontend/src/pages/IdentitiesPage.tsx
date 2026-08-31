import { useState } from 'react';
import { Search, Plus, Eye, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { useDids, useCreateDID, useVerifyDID, useMyDid } from '../hooks/useApi';
import { formatAddress, formatDate, getStatusColor, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function IdentitiesPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDid, setSelectedDid] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<number | null>(null);

  const { data: didsData, isLoading, error, refetch } = useDids({
    page,
    page_size: 20,
    verified: verifiedFilter,
    search: search || undefined,
  });
  const { data: myDid } = useMyDid();
  const createDIDMutation = useCreateDID();
  const verifyDIDMutation = useVerifyDID();

  const isAdminOrManager = hasRole(['ADMIN', 'MANAGER']);
  const canCreate = hasRole(['ADMIN']);
  const canVerify = hasRole(['ADMIN']);

  const handleCreateDID = async () => {
    try {
      await createDIDMutation.mutateAsync();
      toast.success('DID created successfully');
      setShowCreateModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create DID');
    }
  };

  const handleVerifyDID = async (didId: number) => {
    setIsVerifying(didId);
    try {
      await verifyDIDMutation.mutateAsync(didId);
      toast.success('DID verified on blockchain');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to verify DID');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleViewDid = (did: any) => {
    setSelectedDid(did);
  };

  if (isLoading && !didsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Decentralized Identifiers</h1>
            <p className="text-dark-600 dark:text-dark-400">Manage DIDs and identity verification</p>
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

  const dids = didsData?.items || [];
  const total = didsData?.total || 0;
  const totalPages = didsData?.total_pages || 1;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Decentralized Identifiers</h1>
          <p className="text-dark-600 dark:text-dark-400">Manage DIDs and cryptographic identity verification</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4" />
              Create DID
            </Button>
          )}
        </div>
      </div>

      {myDid && !isAdminOrManager && (
        <Card className="p-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-white">Your DID</p>
                <p className="font-mono text-sm text-primary-600 dark:text-primary-400">{myDid.did}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={myDid.verified ? 'success' : 'warning'}>
                {myDid.verified ? 'Verified' : 'Pending Verification'}
              </Badge>
              {myDid.blockchain_tx_hash && (
                <span className="text-xs text-dark-500 dark:text-dark-400 font-mono">
                  {formatTxHash(myDid.blockchain_tx_hash)}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search DIDs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-dark-600 dark:text-dark-400">Status:</label>
            <select
              value={verifiedFilter === true ? 'verified' : verifiedFilter === false ? 'unverified' : 'all'}
              onChange={(e) => {
                const val = e.target.value;
                setVerifiedFilter(val === 'verified' ? true : val === 'unverified' ? false : undefined);
                setPage(1);
              }}
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
                <th>DID</th>
                <th>Wallet</th>
                <th>Identity Hash</th>
                <th>Status</th>
                <th>Created</th>
                <th>Blockchain</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dids.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-500 dark:text-dark-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No DIDs found</p>
                  </td>
                </tr>
              ) : (
                dids.map((did) => (
                  <tr key={did.id}>
                    <td className="font-mono text-sm">{did.did}</td>
                    <td className="font-mono text-sm">{formatAddress(did.wallet_address)}</td>
                    <td className="font-mono text-xs max-w-[200px] truncate">{did.identity_hash}</td>
                    <td>
                      <Badge variant={did.verified ? 'success' : 'warning'}>
                        {did.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="text-sm text-dark-600 dark:text-dark-400">{formatDate(did.created_at)}</td>
                    <td>
                      {did.blockchain_tx_hash ? (
                        <span className="font-mono text-xs text-green-600 dark:text-green-400">
                          {formatTxHash(did.blockchain_tx_hash)}
                        </span>
                      ) : (
                        <span className="text-xs text-dark-500 dark:text-dark-400">Not on-chain</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDid(did)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canVerify && !did.verified && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerifyDID(did.id)}
                            loading={isVerifying === did.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </Button>
                        )}
                      </div>
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
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} DIDs
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New DID">
        <div className="space-y-4">
          <p className="text-dark-600 dark:text-dark-400">
            This will create a new decentralized identifier (DID) for your account.
            The DID will be registered on-chain if a wallet is connected.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDID} loading={createDIDMutation.isPending}>
              <Plus className="h-4 w-4" />
              Create DID
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedDid} onClose={() => setSelectedDid(null)} title="DID Details" size="lg">
        {selectedDid && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">DID</p>
                <p className="font-mono text-sm break-all">{selectedDid.did}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Wallet Address</p>
                <p className="font-mono text-sm">{formatAddress(selectedDid.wallet_address)}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Identity Hash</p>
                <p className="font-mono text-xs break-all">{selectedDid.identity_hash}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Status</p>
                <Badge variant={selectedDid.verified ? 'success' : 'warning'}>
                  {selectedDid.verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Created</p>
                <p className="text-sm text-dark-900 dark:text-white">{formatDate(selectedDid.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400">Verified At</p>
                <p className="text-sm text-dark-900 dark:text-white">{selectedDid.verified_at ? formatDate(selectedDid.verified_at) : 'Not verified'}</p>
              </div>
              {selectedDid.blockchain_tx_hash && (
                <div className="col-span-2">
                  <p className="text-sm text-dark-500 dark:text-dark-400">Blockchain Transaction</p>
                  <p className="font-mono text-sm text-green-600 dark:text-green-400">{selectedDid.blockchain_tx_hash}</p>
                </div>
              )}
              {selectedDid.blockchain_block_number && (
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-400">Block Number</p>
                  <p className="text-sm text-dark-900 dark:text-white">{selectedDid.blockchain_block_number.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
              <Button variant="outline" onClick={() => setSelectedDid(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}