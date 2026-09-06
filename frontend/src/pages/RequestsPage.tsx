import { useState } from 'react';
import { AlertCircle, Box, FileText, Lock, Plus, RotateCcw, Key } from 'lucide-react';
import { Card } from '../components/ui/Card';
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

export default function RequestsPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('Asset Transfer');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const renderRequestTable = (list: Transfer[]) => (
    <div className="table-wrap">
      <Table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Requester</th>
            <th>Role</th>
            <th>Operation</th>
            <th>Target</th>
            <th>Reason</th>
            <th>Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-12" style={{ color: '#8991a3' }}>
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                No pending requests.
              </td>
            </tr>
          ) : list.map((transfer) => (
            <tr key={transfer.id} className="row-hover">
              <td className="mono">#{transfer.id}</td>
              <td>{transfer.initiator?.full_name || transfer.initiator_id || 'Requester'}</td>
              <td><Badge variant="info">{displayRole(transfer.initiator?.role)}</Badge></td>
              <td>Asset Transfer</td>
              <td>{transfer.asset?.name || `Asset ${transfer.asset_id}`}</td>
              <td>{transfer.error_message || '-'}</td>
              <td>{formatDate(transfer.created_at)}</td>
              <td><Badge variant={STATUS_BADGE_VARIANTS[transfer.status] || 'info'}>{transfer.status === 'COMPLETED' ? 'EXECUTED' : transfer.status}</Badge></td>
              <td>
                <div className="actions-cell">
                  {isOwner && transfer.status === 'PENDING' && <Button variant="success" size="sm" onClick={() => handleApprove(transfer.id)}>Approve</Button>}
                  {isOwner && transfer.status === 'PENDING' && <Button variant="danger" size="sm" onClick={() => setRejectingId(transfer.id)}>Reject</Button>}
                  {!isOwner && transfer.status === 'PENDING' && <Badge variant="pending">Awaiting Owner</Badge>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  if (!isOwner && !isManager) {
    return <div className="locked-panel"><AlertCircle className="icon" /><div><b>Access restricted.</b> Your role does not have permission to view Request Center.</div></div>;
  }

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Request Center</div>
          <div className="page-sub">{isOwner ? 'Review and approve protected operations' : 'Create and track protected-operation requests'}</div>
        </div>
        {isManager && <Button size="sm" onClick={() => { setRequestType('Asset Transfer'); setShowRequestModal(true); }}><Plus className="h-4 w-4" />New Request</Button>}
      </div>

      <Card className="glow" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', color: '#8991a3', fontSize: 13 }}>
          <Badge variant="info">MANAGER requests</Badge>
          <span>-</span>
          <Badge variant="pending">PENDING</Badge>
          <span>-</span>
          <Badge variant="violet">OWNER decides</Badge>
          <span>-</span>
          <Badge variant="approved">APPROVED</Badge>
          <span>-</span>
          <Badge variant="executed">EXECUTED</Badge>
          <span>or</span>
          <Badge variant="rejected">REJECTED</Badge>
        </div>
      </Card>

      {isManager && (
        <div className="grid grid-4">
          {REQUEST_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.type} onClick={() => { setRequestType(item.type); setShowRequestModal(true); }} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Icon className="h-5 w-5" style={{ color: '#3d6fe0' }} /><b>{item.type}</b></div>
                <div className="page-sub">{item.description}</div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((status) => (
          <Button key={status || 'all'} size="sm" variant={statusFilter === (status || undefined) ? 'primary' : 'outline'} onClick={() => { setPage(1); setStatusFilter(status || undefined); }}>
            {status || 'All'}
          </Button>
        ))}
      </div>

      <Card>{isLoading && !transfersData ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#191e29] rounded animate-pulse" />)}</div> : renderRequestTable(visibleTransfers)}</Card>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="page-sub" style={{ lineHeight: '32px' }}>{page}/{Math.max(totalPages, 1)} ({total})</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title={requestType} size="lg">
        {requestType === 'Asset Transfer' ? (
          <TransferRequestForm assets={assets} users={users} onSubmit={handleSubmitTransfer} onCancel={() => setShowRequestModal(false)} isLoading={createTransferMutation.isPending} />
        ) : (
          <div style={{ color: '#8991a3' }}>This protected operation is unavailable from the current API. Use Asset Transfer requests where supported.</div>
        )}
      </Modal>

      <Modal isOpen={rejectingId !== null} onClose={() => { setRejectingId(null); setRejectReason(''); }} title={`Reject Request #${rejectingId || ''}`} size="lg">
        <div className="space-y-4" style={{ color: '#e6e9ef' }}>
          <div className="field"><label>Rejection Reason</label><textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this request is being rejected" /></div>
          <div className="modal-actions"><Button variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</Button><Button variant="danger" onClick={handleReject} loading={rejectMutation.isPending}>Reject</Button></div>
        </div>
      </Modal>
    </div>
  );
}

function TransferRequestForm({ assets, users, onSubmit, onCancel, isLoading }: { assets: Asset[]; users: User[]; onSubmit: (assetId: number, recipientId: number) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [assetId, setAssetId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  return (
    <form className="space-y-4" style={{ color: '#e6e9ef' }} onSubmit={(e) => { e.preventDefault(); onSubmit(Number(assetId), Number(recipientId)); }}>
      <p className="modal-sub">Submit a request for Pending Owner Approval.</p>
      <div className="field"><label>Asset</label><select value={assetId} onChange={(e) => setAssetId(e.target.value)} required><option value="">Select asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.asset_id} - {asset.name}</option>)}</select></div>
      <div className="field"><label>Recipient</label><select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required><option value="">Select recipient</option>{users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)})</option>)}</select></div>
      <div className="modal-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" loading={isLoading} disabled={!assetId || !recipientId}>Submit Request</Button></div>
    </form>
  );
}
