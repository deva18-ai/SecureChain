import { useState } from 'react';
import { Search, Eye, Loader2, AlertCircle, Clock, CheckCircle, XCircle, ArrowRight, Send } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useTransfers, useCancelTransfer } from '../hooks/useApi';
import { useAssets } from '../hooks/useApi';
import { useUsers } from '../hooks/useApi';
import { formatAddress, formatDate, getStatusColor, formatTxHash, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TRANSFER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'primary',
  FAILED: 'danger',
  CANCELLED: 'default',
};

export default function TransfersPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [assetFilter, setAssetFilter] = useState<number | undefined>(undefined);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [actionTransferId, setActionTransferId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: transfersData, isLoading, error, refetch } = useTransfers({
    page,
    page_size: 20,
    status: statusFilter,
    asset_id: assetFilter,
  });
  const cancelTransferMutation = useCancelTransfer();
  const { data: assetsData } = useAssets({ page_size: 100, status: 'ACTIVE' });
  const { data: usersData } = useUsers({ page_size: 100 });

  const isAdminOrManager = hasRole(['ADMIN', 'MANAGER']);
  const isAuditor = hasRole(['AUDITOR']);

  const handleCancel = async (transferId: number) => {
    setActionTransferId(transferId);
    try {
      await cancelTransferMutation.mutateAsync(transferId);
      toast.success('Transfer cancelled');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to cancel transfer');
    } finally {
      setActionTransferId(null);
    }
  };

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer);
  };

  if (isLoading && !transfersData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Asset Transfers</h1>
            <p className="text-dark-600 dark:text-dark-400">View asset assignment history</p>
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

  const transfers = transfersData?.items || [];
  const total = transfersData?.total || 0;
  const totalPages = transfersData?.total_pages || 1;
  const assets = assetsData?.items || [];
  const users = usersData?.items || [];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Asset Transfers</h1>
          <p className="text-dark-600 dark:text-dark-400">View asset assignment history and status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Security Model</p>
            <p className="text-sm text-blue-600 dark:text-blue-500">
              Users cannot transfer assigned assets. All asset assignments and reassignments are performed by 
              Administrators and Managers only. This page shows the history of all assignment changes.
            </p>
          </div>
        </div>

        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search transfers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-dark-600 dark:text-dark-400">Status:</label>
            <select
              value={statusFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setStatusFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <label className="text-sm text-dark-600 dark:text-dark-400">Asset:</label>
            <select
              value={assetFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setAssetFilter(val === 'all' ? undefined : parseInt(val)); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All Assets</option>
              {assets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.asset_id})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>From</th>
                <th>To</th>
                <th>Assigned By</th>
                <th>Status</th>
                <th>Created</th>
                <th>Completed</th>
                <th>Blockchain</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-dark-500 dark:text-dark-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assignment records found</p>
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="font-mono text-sm">#{transfer.id}</td>
                    <td>
                      {transfer.asset ? (
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white">{transfer.asset.name}</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{transfer.asset.asset_id}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-dark-500 dark:text-dark-400">Unknown</span>
                      )}
                    </td>
                    <td>
                      <p className="text-sm font-mono">{formatAddress(transfer.from_address)}</p>
                      {transfer.initiator && (
                        <p className="text-xs text-dark-500 dark:text-dark-400">{transfer.initiator.full_name}</p>
                      )}
                    </td>
                    <td>
                      <p className="text-sm font-mono">{formatAddress(transfer.to_address)}</p>
                      {transfer.recipient && (
                        <p className="text-xs text-dark-500 dark:text-dark-400">{transfer.recipient.full_name}</p>
                      )}
                    </td>
                    <td>
                      {transfer.asset?.creator ? (
                        <p className="text-sm text-dark-900 dark:text-white">{transfer.asset.creator.full_name}</p>
                      ) : (
                        <span className="text-sm text-dark-500 dark:text-dark-400">System</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={TRANSFER_STATUS_COLORS[transfer.status] || 'default'}>
                        {transfer.status}
                      </Badge>
                    </td>
                    <td className="text-sm text-dark-600 dark:text-dark-400">
                      {formatRelativeTime(transfer.created_at)}
                    </td>
                    <td className="text-sm text-dark-600 dark:text-dark-400">
                      {transfer.completed_at ? formatRelativeTime(transfer.completed_at) : '-'}
                    </td>
                    <td>
                      {transfer.blockchain_tx_hash ? (
                        <span className="font-mono text-xs text-green-600 dark:text-green-400">
                          {formatTxHash(transfer.blockchain_tx_hash)}
                        </span>
                      ) : (
                        <span className="text-xs text-dark-500 dark:text-dark-400">Pending</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewTransfer(transfer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(transfer.initiator_id === user?.id || isAdminOrManager) && transfer.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(transfer.id)}
                            loading={actionTransferId === transfer.id}
                          >
                            Cancel
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
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} transfers
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

      <Modal isOpen={!!selectedTransfer} onClose={() => setSelectedTransfer(null)} title="Transfer Details" size="lg">
        {selectedTransfer && (
          <TransferDetailView transfer={selectedTransfer} onClose={() => setSelectedTransfer(null)} />
        )}
      </Modal>
    </div>
  );
}

function TransferDetailView({ transfer, onClose }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Transfer ID</p>
          <p className="font-mono text-lg font-bold text-dark-900 dark:text-white">#{transfer.id}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Status</p>
          <Badge variant={TRANSFER_STATUS_COLORS[transfer.status] || 'default'}>
            {transfer.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Asset</p>
          <p className="font-medium text-dark-900 dark:text-white">{transfer.asset?.name || 'Unknown'}</p>
          <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{transfer.asset?.asset_id}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Token ID</p>
          <p className="font-mono text-sm">{transfer.asset?.token_id || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">From Address</p>
          <p className="font-mono text-sm">{formatAddress(transfer.from_address)}</p>
          {transfer.initiator && <p className="text-xs text-dark-500 dark:text-dark-400">{transfer.initiator.full_name}</p>}
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">To Address</p>
          <p className="font-mono text-sm">{formatAddress(transfer.to_address)}</p>
          {transfer.recipient && <p className="text-xs text-dark-500 dark:text-dark-400">{transfer.recipient.full_name}</p>}
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Assigned By</p>
          {transfer.asset?.creator ? (
            <p className="text-sm text-dark-900 dark:text-white">{transfer.asset.creator.full_name}</p>
          ) : (
            <p className="text-sm text-dark-500 dark:text-dark-400">System</p>
          )}
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Initiated</p>
          <p className="text-sm text-dark-900 dark:text-white">{formatDate(transfer.created_at)}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Completed</p>
          <p className="text-sm text-dark-900 dark:text-white">{transfer.completed_at ? formatDate(transfer.completed_at) : 'Not completed'}</p>
        </div>
        {transfer.blockchain_tx_hash && (
          <div className="col-span-2">
            <p className="text-sm text-dark-500 dark:text-dark-400">Blockchain Transaction</p>
            <p className="font-mono text-sm text-green-600 dark:text-green-400">{transfer.blockchain_tx_hash}</p>
          </div>
        )}
        {transfer.blockchain_block_number && (
          <div>
            <p className="text-sm text-dark-500 dark:text-dark-400">Block Number</p>
            <p className="text-sm text-dark-900 dark:text-white">{transfer.blockchain_block_number.toLocaleString()}</p>
          </div>
        )}
        {transfer.error_message && (
          <div className="col-span-2">
            <p className="text-sm text-dark-500 dark:text-dark-400">Error / Rejection Reason</p>
            <p className="text-sm text-red-600 dark:text-red-400">{transfer.error_message}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}