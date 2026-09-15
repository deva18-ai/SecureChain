import { useState } from 'react';
import { AlertCircle, Box, FileText, Lock, Plus, RotateCcw, Key, ArrowRight, ChevronRight, Clock, ShieldCheck, Blocks, Loader2 as LoaderIcon, ExternalLink, Copy } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge, RoleBadge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useAssets, useApproveTransfer, useCreateTransfer, useRejectTransfer, useTransfers, useUsers } from '../hooks/useApi';
import { displayRole, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { Asset, Transfer, User } from '../types';
import { getApiErrorMessage } from '../utils/apiError';
import { cn } from '../utils/helpers';

const REQUEST_TYPES = [
  { type: 'Asset Transfer', icon: Box, description: 'Request asset reassignment to another user' },
  { type: 'Asset Freeze', icon: Lock, description: 'Request an Owner freeze decision' },
  { type: 'Asset Update', icon: RotateCcw, description: 'Request metadata or status changes' },
  { type: 'Asset Edit Access', icon: Key, description: 'Request temporary edit access' },
];

const WORKFLOW_STEPS = [
  { label: 'REQUESTED', desc: 'Manager submits request', icon: FileText, status: 'completed' },
  { label: 'PENDING OWNER', desc: 'Awaiting approval', icon: Clock, status: 'current' },
  { label: 'APPROVED', desc: 'Owner approves', icon: ShieldCheck, status: 'pending' },
  { label: 'EXECUTED', desc: 'Action performed', icon: ArrowRight, status: 'pending' },
  { label: 'ON-CHAIN', desc: 'Recorded on blockchain', icon: Blocks, status: 'pending' },
];

export default function RequestsPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('Asset Transfer');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Transfer | null>(null);

  const { data: transfersData, isLoading, refetch } = useTransfers({ page, page_size: 20, status: statusFilter });
  const { data: assetsData } = useAssets({ page_size: 100 });
  const { data: usersData } = useUsers({ page_size: 100 });
  const createTransferMutation = useCreateTransfer();
  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();

  const isOwner = hasRole(['ADMIN']);
  const isManager = user?.role === 'MANAGER';
  const transfers = transfersData?.items || [];
  const visibleTransfers = isOwner ? transfers : transfers.filter((transfer) => transfer.initiator_id === user?.id);
  const assets = assetsData?.items || [];
  const users = usersData?.items || [];
  const total = transfersData?.total || 0;
  const totalPages = transfersData?.total_pages || 1;

  const stats = {
    pending: transfers.filter(t => t.status === 'PENDING').length,
    approved: transfers.filter(t => t.status === 'APPROVED' || t.status === 'COMPLETED').length,
    rejected: transfers.filter(t => t.status === 'REJECTED' || t.status === 'CANCELLED' || t.status === 'FAILED').length,
    total: transfers.length,
  };

  const handleSubmitTransfer = async (assetId: number, recipientId: number) => {
    const recipient = users.find((candidate) => candidate.id === recipientId);
    if (!recipient?.wallet_address) {
      toast.error('Selected recipient does not have a wallet address.');
      return;
    }
    try {
      await createTransferMutation.mutateAsync({ asset_id: assetId, to_address: recipient.wallet_address });
      toast.success('Request submitted for Owner approval');
      setShowRequestModal(false);
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to submit request'));
    }
  };

  const handleApprove = async (transferId: number) => {
    try {
      await approveMutation.mutateAsync(transferId);
      toast.success('Request approved and executed');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to approve request'));
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: rejectingId, reason: rejectReason });
      toast.success('Request rejected');
      setRejectingId(null);
      setRejectReason('');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to reject request'));
    }
  };

  const getWorkflowStatus = (transfer: Transfer) => {
    if (transfer.status === 'PENDING') return 1;
    if (transfer.status === 'APPROVED') return 2;
    if (transfer.status === 'COMPLETED') return 3;
    if (transfer.status === 'REJECTED' || transfer.status === 'CANCELLED' || transfer.status === 'FAILED') return -1;
    return 0;
  };

  const renderWorkflow = (currentStep: number) => (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {WORKFLOW_STEPS.map((step, index) => {
        const stepNum = index + 1;
        let status: 'completed' | 'current' | 'pending' = 'pending';
        if (stepNum < currentStep) status = 'completed';
        else if (stepNum === currentStep) status = 'current';
        else if (currentStep === -1 && index === 1) status = 'completed'; // rejected at pending

        return (
          <div key={step.label} className="flex items-center flex-shrink-0">
            <div className="relative flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                status === 'completed' ? 'bg-success text-white' :
                status === 'current' ? 'bg-primary-blue text-white animate-pulse' :
                'bg-gray-100 border-2 border-gray-300 text-gray-400'
              )}>
                {status === 'completed' ? '✓' : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={cn('absolute left-full w-16 h-0.5 -translate-x-full',
                  status === 'completed' ? 'bg-success' : 'bg-gray-300'
                )} />
              )}
            </div>
            <div className="hidden sm:block ml-2 text-center min-w-[80px]">
              <div className={cn('text-xs font-semibold',
                status === 'current' ? 'text-primary-blue' :
                status === 'completed' ? 'text-success' :
                'text-gray-500'
              )}>{step.label}</div>
              <div className="text-[10px] text-gray-500">{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (!isOwner && !isManager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm" style={{ maxWidth: '480px' }}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-warning" />
          <div className="font-heading font-semibold text-lg text-gray-900 mb-2">Access restricted</div>
          <div className="text-gray-600 mb-6">Your role does not have permission to view Request Center.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Request Center</h1>
          <p className="page-sub mt-1">{isOwner ? 'Review and approve protected operations' : 'Create and track protected-operation requests'}</p>
        </div>
        {isManager && (
          <Button onClick={() => { setRequestType('Asset Transfer'); setShowRequestModal(true); }} size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            New Request
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="data-grid">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={<FileText className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="h-6 w-6" />}
          color="warning"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<ShieldCheck className="h-6 w-6" />}
          color="success"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<AlertCircle className="h-6 w-6" />}
          color="danger"
        />
      </div>

      {/* Approval Workflow */}
      <Card variant="hover" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">APPROVAL WORKFLOW</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary-blue/10 text-primary-blue">MANAGER requests</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-warning-bg text-warning">PENDING</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary-blue/10 text-primary-blue">OWNER decides</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-success-bg text-success">APPROVED</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-success-bg text-success">EXECUTED</span>
          <span className="text-gray-500 px-2">or</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-danger-bg text-danger">REJECTED</span>
        </div>
      </Card>

      {/* Quick Request Types for Managers */}
      {isManager && (
        <div className="data-grid">
          {REQUEST_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.type} variant="hover" onClick={() => { setRequestType(item.type); setShowRequestModal(true); }} padding="lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-blue/10 text-primary-blue flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{item.type}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((status) => (
          <Button
            key={status || 'all'}
            variant={statusFilter === (status || undefined) ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setPage(1); setStatusFilter(status || undefined); }}
          >
            {status || 'All'}
          </Button>
        ))}
      </div>

      {/* Transfers Table */}
      <Card variant="hover" padding="none">
        {isLoading && !transfersData ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-16">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                        <p className="text-gray-500">No requests found.</p>
                      </TableCell>
                    </TableRow>
                  ) : visibleTransfers.map((transfer) => {
                    const currentStep = getWorkflowStatus(transfer);
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-mono font-medium text-gray-900">#{transfer.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-blue flex items-center justify-center text-white text-xs font-medium">
                              {(transfer.initiator?.full_name || 'U').charAt(0)}
                            </div>
                            <span className="text-gray-900">{transfer.initiator?.full_name || `User ${transfer.initiator_id}`}</span>
                          </div>
                        </TableCell>
<TableCell>
  <RoleBadge role={transfer.initiator?.role || 'USER'} />
</TableCell>
                        <TableCell className="text-gray-900">Asset Transfer</TableCell>
                        <TableCell className="font-medium text-gray-900">{transfer.asset?.name || `Asset ${transfer.asset_id}`}</TableCell>
                        <TableCell className="text-gray-600 max-w-[200px] truncate">{transfer.error_message || '-'}</TableCell>
                        <TableCell className="text-gray-600">{formatDate(transfer.created_at)}</TableCell>
                        <TableCell>
                          <StatusBadge status={transfer.status} />
                        </TableCell>
                        <TableCell>
                          <div className="w-[320px] inline-block">{renderWorkflow(currentStep)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOwner && transfer.status === 'PENDING' && (
                              <>
                                <Button variant="primary" size="sm" onClick={() => handleApprove(transfer.id)} loading={approveMutation.isPending}>
                                  Approve
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setRejectingId(transfer.id)} loading={rejectMutation.isPending}>
                                  Reject
                                </Button>
                              </>
                            )}
                            {!isOwner && transfer.status === 'PENDING' && (
                              <StatusBadge status="PENDING" className="bg-warning-bg text-warning" />
                            )}
                            {transfer.status !== 'PENDING' && !isOwner && (
                              <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(transfer)} className="text-primary-blue">
                                View Details
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

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-gray-600 text-sm">{page}/{Math.max(totalPages, 1)} ({total})</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Request Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title={requestType} size="lg">
        {requestType === 'Asset Transfer' ? (
          <TransferRequestForm assets={assets} users={users} onSubmit={handleSubmitTransfer} onCancel={() => setShowRequestModal(false)} isLoading={createTransferMutation.isPending} />
        ) : (
          <div className="space-y-4 text-center py-8 text-gray-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <p>This protected operation is unavailable from the current API.</p>
            <p className="text-sm">Use Asset Transfer requests where supported.</p>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectingId !== null} onClose={() => { setRejectingId(null); setRejectReason(''); }} title={`Reject Request #${rejectingId || ''}`} size="lg">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="label">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this request is being rejected"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 resize-y min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={rejectMutation.isPending}>Reject</Button>
          </div>
        </div>
      </Modal>

      {/* Request Details Modal */}
      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Request Details" size="lg">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <div className="font-heading font-semibold text-lg text-gray-900">Request #{selectedRequest.id}</div>
                <div className="text-sm text-gray-600">Asset Transfer</div>
              </div>
              <StatusBadge status={selectedRequest.status} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-600">Requester</span>
                <span className="text-gray-900">{selectedRequest.initiator?.full_name || `User ${selectedRequest.initiator_id}`}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-600">Asset</span>
                <span className="text-gray-900">{selectedRequest.asset?.name || `Asset ${selectedRequest.asset_id}`}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">{formatDate(selectedRequest.created_at)}</span>
              </div>
              {selectedRequest.blockchain_tx_hash && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-gray-600">Blockchain TX</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 truncate max-w-[200px]">{selectedRequest.blockchain_tx_hash}</span>
                    <Button variant="ghost" size="xs" onClick={() => { navigator.clipboard.writeText(selectedRequest.blockchain_tx_hash!); toast.success('TX Hash copied'); }} className="p-1" aria-label="Copy transaction hash">
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${selectedRequest.blockchain_tx_hash}`, '_blank')} className="p-1" aria-label="View on Etherscan">
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-gray-200">
              {renderWorkflow(getWorkflowStatus(selectedRequest))}
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TransferRequestForm({ assets, users, onSubmit, onCancel, isLoading }: { assets: Asset[]; users: User[]; onSubmit: (assetId: number, recipientId: number) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [assetId, setAssetId] = useState('');
  const [recipientId, setRecipientId] = useState('');

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit(Number(assetId), Number(recipientId)); }}>
      <p className="text-gray-600 text-sm">Submit a request for Pending Owner Approval.</p>
      <div className="space-y-2">
        <label className="label">Asset</label>
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
        >
          <option value="">Select asset</option>
          {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.asset_id} - {asset.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="label">Recipient</label>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
        >
          <option value="">Select recipient</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)})</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading} disabled={!assetId || !recipientId}>Submit Request</Button>
      </div>
    </form>
  );
}