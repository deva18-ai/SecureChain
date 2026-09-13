import { useState } from 'react';
import { AlertCircle, Box, FileText, Lock, Plus, RotateCcw, Key, ArrowRight, ChevronRight, Clock, ShieldCheck, Blocks } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useAssets, useApproveTransfer, useCreateTransfer, useRejectTransfer, useTransfers, useUsers } from '../hooks/useApi';
import { displayRole, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { Asset, Transfer, User } from '../types';
import { getApiErrorMessage } from '../utils/apiError';

const STATUS_BADGE_VARIANTS: Record<string, 'pending' | 'approved' | 'rejected' | 'executed' | 'info'> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'executed',
  EXECUTED: 'executed',
  CANCELLED: 'rejected',
  FAILED: 'rejected',
};

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                status === 'completed' ? 'bg-green-500 text-white' :
                status === 'current' ? 'bg-blue-600 text-white animate-pulse' :
                'bg-gray-100 border-2 border-gray-300 text-gray-400'
              }`}>
                {status === 'completed' ? '✓' : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={`absolute left-full w-16 h-0.5 -translate-x-full ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
            <div className="hidden sm:block ml-2 text-center min-w-[80px]">
              <div className={`text-xs font-semibold ${status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>{step.label}</div>
              <div className="text-[10px] text-gray-500">{step.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (!isOwner && !isManager) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm" style={{ maxWidth: '480px', margin: '60px auto' }}>
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
        <div className="font-heading font-semibold text-lg text-gray-900 mb-2">Access restricted</div>
        <div className="text-gray-600 mb-6">Your role does not have permission to view Request Center.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Center</h1>
          <p className="text-gray-600 mt-1">{isOwner ? 'Review and approve protected operations' : 'Create and track protected-operation requests'}</p>
        </div>
        {isManager && (
          <button 
            onClick={() => { setRequestType('Asset Transfer'); setShowRequestModal(true); }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">APPROVAL WORKFLOW</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">MANAGER requests</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">PENDING</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">OWNER decides</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">APPROVED</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">EXECUTED</span>
            <span className="text-gray-500">or</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">REJECTED</span>
          </div>
        </div>
      </div>

      {isManager && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REQUEST_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.type} onClick={() => { setRequestType(item.type); setShowRequestModal(true); }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{item.type}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => { setPage(1); setStatusFilter(status || undefined); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === (status || undefined) 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading && !transfersData ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visibleTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                        <p className="text-gray-500">No requests found.</p>
                      </td>
                    </tr>
                  ) : visibleTransfers.map((transfer) => {
                    const currentStep = getWorkflowStatus(transfer);
                    const getStatusBadge = (status: string) => {
                      if (status === 'APPROVED' || status === 'COMPLETED') {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{status === 'COMPLETED' ? 'EXECUTED' : status}</span>;
                      } else if (status === 'PENDING') {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">PENDING</span>;
                      } else if (status === 'REJECTED' || status === 'CANCELLED' || status === 'FAILED') {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">{status}</span>;
                      }
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{status}</span>;
                    };
                    return (
                      <tr key={transfer.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-gray-900">#{transfer.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                              {(transfer.initiator?.full_name || 'U').charAt(0)}
                            </div>
                            <span className="text-gray-900">{transfer.initiator?.full_name || `User ${transfer.initiator_id}`}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{displayRole(transfer.initiator?.role)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">Asset Transfer</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{transfer.asset?.name || `Asset ${transfer.asset_id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 max-w-[200px] truncate">{transfer.error_message || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(transfer.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transfer.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="w-[320px] inline-block">{renderWorkflow(currentStep)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {isOwner && transfer.status === 'PENDING' && (
                              <>
                                <button onClick={() => handleApprove(transfer.id)} disabled={approveMutation.isPending} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50">
                                  Approve
                                </button>
                                <button onClick={() => setRejectingId(transfer.id)} disabled={rejectMutation.isPending} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50">
                                  Reject
                                </button>
                              </>
                            )}
                            {!isOwner && transfer.status === 'PENDING' && <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Awaiting Owner</span>}
                            {transfer.status !== 'PENDING' && !isOwner && (
                              <button onClick={() => setSelectedRequest(transfer)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Details
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-gray-600 text-sm">{page}/{Math.max(totalPages, 1)} ({total})</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

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

      <Modal isOpen={rejectingId !== null} onClose={() => { setRejectingId(null); setRejectReason(''); }} title={`Reject Request #${rejectingId || ''}`} size="lg">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this request is being rejected"
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-y min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={rejectMutation.isPending}>Reject</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Request Details" size="lg">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <div className="font-heading font-semibold text-lg text-gray-900">Request #{selectedRequest.id}</div>
                <div className="text-sm text-gray-600">Asset Transfer</div>
              </div>
              <Badge variant={STATUS_BADGE_VARIANTS[selectedRequest.status] || 'info'}>
                {selectedRequest.status === 'COMPLETED' ? 'EXECUTED' : selectedRequest.status}
              </Badge>
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
                  <span className="font-mono text-gray-900 truncate max-w-[200px]">{selectedRequest.blockchain_tx_hash}</span>
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
          className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
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
          className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
        >
          <option value="">Select recipient</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)})</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading} disabled={!assetId || !recipientId}>Submit Request</Button>
      </div>
    </form>
  );
}