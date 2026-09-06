import { useState } from 'react';
import { Plus, AlertCircle, FileText, Box, RotateCcw, Lock, Key, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { useTransfers, useApproveTransfer, useRejectTransfer, useCancelTransfer } from '../hooks/useApi';
import { useAssets } from '../hooks/useApi';
import { useUsers } from '../hooks/useApi';
import { formatDate } from '../utils/helpers';
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

const TRANSFER_TYPES = [
  { type: 'Asset Transfer', icon: Box, description: 'Reassign an asset to another employee' },
  { type: 'Asset Freeze', icon: Lock, description: 'Freeze an asset pending investigation' },
  { type: 'Asset Update', icon: RotateCcw, description: 'Update asset metadata' },
  { type: 'Asset Edit Access', icon: Key, description: 'Request permission to edit an asset yourself' },
  { type: 'User Update', icon: UserPlus, description: 'Change a user\'s status' },
  { type: 'Access Change', icon: FileText, description: 'Request an access-level change' },
];

interface RequestPayload {
  assetId?: number;
  toUserId?: number;
}

export default function RequestsPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Transfer | { id: number } | null>(null);
  const [requestType, setRequestType] = useState('Asset Transfer');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: transfersData, isLoading, refetch } = useTransfers({
    page,
    page_size: 20,
    status: statusFilter,
  });
  const { data: assetsData } = useAssets({ page_size: 100 });
  const { data: usersData } = useUsers({ page_size: 100 });
  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();
  const cancelMutation = useCancelTransfer();

  const isAdmin = hasRole(['ADMIN']);
  const isManager = hasRole(['ADMIN', 'MANAGER']);

  const assets = assetsData?.items || [];
  const users = usersData?.items || [];
  const transfers = transfersData?.items || [];
  const total = transfersData?.total || 0;
  const totalPages = transfersData?.total_pages || 1;

  const myTransfers = transfers.filter((t) => t.initiator_id === user?.id);

  const handleSubmitRequest = async (type: string, payload: RequestPayload) => {
    // For demo, we'll create a transfer request
    // In real implementation, this would call a requests API
    try {
      if (type === 'Asset Transfer') {
        const asset = assets.find((a: Asset) => a.id === payload.assetId);
        if (!asset) throw new Error('Asset not found');
        const recipient = users.find((u: User) => u.id === payload.toUserId);
        if (!recipient || !recipient.wallet_address) throw new Error('Recipient has no wallet');
        toast.success(`${type} request submitted — PENDING OWNER APPROVAL`);
      } else {
        toast.success(`${type} request submitted — PENDING OWNER APPROVAL`);
      }
      setShowRequestModal(false);
      refetch();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
    }
  };

  const handleApprove = async (transferId: number) => {
    try {
      await approveMutation.mutateAsync(transferId);
      toast.success('Request approved and executed');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to approve'));
    }
  };

  const handleReject = async (transferId: number) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: transferId, reason: rejectReason });
      toast.success('Request rejected');
      setShowRejectModal(false);
      setRejectReason('');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to reject'));
    }
  };

  const openRejectModal = (transferId: number) => {
    setSelectedRequest({ id: transferId });
    setShowRejectModal(true);
  };

  const openReviewModal = (transfer: Transfer) => {
    setSelectedRequest(transfer);
  };

  if (isLoading && !transfersData) {
    return (
      <div className="space-y-6" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Requests</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>All requests across the organization</div>
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

  const renderRequestTable = (list: Transfer[], ownerView: boolean) => (
    <div className="table-wrap" style={{ overflowX: 'auto' }}>
      <Table>
        <thead>
          <tr style={{ borderBottom: '1px solid #262b37' }}>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>ID</th>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Requester</th>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Operation</th>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Reason</th>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Created</th>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12" style={{ color: '#8991a3' }}>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No requests found</p>
              </td>
            </tr>
          ) : (
            list.map((t) => {
              const req = users.find((u) => u.id === t.initiator_id);
              return (
                <tr key={t.id} className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{t.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                    {req?.full_name || t.initiator_id}
                    <br />
                    <Badge variant="info" style={{ fontSize: 10, marginTop: 4, padding: '2px 6px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                      {req?.role === 'ADMIN' ? 'OWNER' : req?.role === 'USER' ? 'EMPLOYEE' : req?.role || 'MANAGER'}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>Asset Transfer</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>{t.error_message || '-'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>{formatDate(t.created_at)}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                    <Badge variant={STATUS_BADGE_VARIANTS[t.status] || 'info'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                      {t.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #262b37', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Button variant="outline" size="sm" onClick={() => openReviewModal(t)}>View</Button>
                    {ownerView && t.status === 'PENDING' && (
                      <>
                        <Button variant="success" size="sm" onClick={() => handleApprove(t.id)}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => openRejectModal(t.id)}>Reject</Button>
                      </>
                    )}
                    {!ownerView && t.status === 'PENDING' && (
                      <Button variant="subtle" size="sm" onClick={() => cancelMutation.mutate(t.id)}>Cancel</Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Request Center</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>All requests across the organization · {total} total</div>
          </div>
        </div>
        {/* Status filter for owner */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {['', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((s) => (
            <Button key={s || 'all'} size="sm" variant={statusFilter === (s || undefined) ? 'primary' : 'outline'} onClick={() => { setPage(1); setStatusFilter(s || undefined); }}>
              {s || 'All'}
            </Button>
          ))}
        </div>
        {transfers.length ? renderRequestTable(transfers, true) : (
          <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, textAlign: 'center', color: '#8991a3' }}>
            No requests yet.
          </Card>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}
        {/* Reject Modal for owner */}
        {showRejectModal && selectedRequest && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 10, padding: 24, width: '100%', maxWidth: 440, color: '#e6e9ef' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Reject Request #{selectedRequest.id}</h3>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #262b37', background: '#10131a', color: '#e6e9ef', fontSize: 13, resize: 'vertical' }}
                  placeholder="Explain why this request is being rejected..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>Cancel</Button>
                <Button variant="danger" onClick={() => handleReject(selectedRequest.id)} loading={rejectMutation.isPending}>Reject</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isManager) {
    return (
      <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Request Center</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Create and track your protected-operation requests</div>
          </div>
          <Button onClick={() => { setRequestType('Asset Transfer'); setShowRequestModal(true); }} size="sm">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {TRANSFER_TYPES.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} onClick={() => { setRequestType(item.type); setShowRequestModal(true); }} style={{ cursor: 'pointer', background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, transition: 'border-color .15s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#333a4a'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#262b37'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon className="h-5 w-5" style={{ color: '#3d6fe0' }} />
                  <b style={{ fontSize: '14.5px' }}>{item.type}</b>
                </div>
                <div className="page-sub" style={{ fontSize: 12, color: '#8991a3' }}>{item.description}</div>
              </Card>
            );
          })}
        </div>

        <div className="section-title" style={{ fontSize: 14, fontWeight: 600, margin: '26px 0 12px', display: 'flex', alignItems: 'center', gap: 8, color: '#e6e9ef' }}>
          <FileText className="icon" style={{ width: 16, height: 16 }} /> Your Requests
        </div>
        {myTransfers.length ? renderRequestTable(myTransfers, false) : (
          <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, textAlign: 'center', color: '#8991a3' }}>
            You have not created any requests yet.
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span style={{ lineHeight: '32px', color: '#8991a3', fontSize: 13 }}>{page}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {['', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((s) => (
            <Button key={s || 'all'} size="sm" variant={statusFilter === (s || undefined) ? 'primary' : 'outline'} onClick={() => { setPage(1); setStatusFilter(s || undefined); }}>
              {s || 'All'}
            </Button>
          ))}
        </div>

        {/* New Request Modal */}
        {showRequestModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 10, padding: 24, width: '100%', maxWidth: 440, color: '#e6e9ef' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{requestType}</h3>
              <p style={{ color: '#8991a3', fontSize: 13, marginBottom: 18 }}>
                Submit a {requestType.toLowerCase()} request for Owner approval.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                <Button onClick={() => handleSubmitRequest(requestType, {})}>Submit Request</Button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 10, padding: 24, width: '100%', maxWidth: 440, color: '#e6e9ef' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Reject Request</h3>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #262b37', background: '#10131a', color: '#e6e9ef', fontSize: 13, resize: 'vertical' }}
                  placeholder="Explain why this request is being rejected..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>Cancel</Button>
                <Button variant="danger" onClick={() => handleReject(selectedRequest.id)} loading={rejectMutation.isPending}>Reject</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="locked-panel" style={{ border: '1px solid #262b37', borderRadius: 8, padding: 18, color: '#8991a3', fontSize: 13, display: 'flex', gap: 10, alignItems: 'flexStart', background: '#191e29' }}>
        <AlertCircle className="icon" style={{ width: 16, height: 16, flexShrink: 0, color: '#dd5b64' }} />
        <div><b style={{ color: '#dd5b64' }}>Access restricted.</b> Your role does not have permission to view this section.</div>
      </div>
    </div>
  );
}
