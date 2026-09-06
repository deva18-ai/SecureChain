import { useState } from 'react';
import { AlertCircle, CheckCircle, Shield, Key, Plus, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useDids, useCreateDID, useVerifyDID, useMyDid } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { DID } from '../types';
import { getApiErrorMessage } from '../utils/apiError';

export default function IdentitiesPage() {
  const { hasRole, user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDid, setSelectedDid] = useState<DID | null>(null);
  const [isVerifying, setIsVerifying] = useState<number | null>(null);

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

  if (isLoading && !didsData) {
    return (
      <div className="space-y-6" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Digital Identity (DID)</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Decentralized identifiers & verification status</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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

  const dids = didsData?.items || [];
  const total = didsData?.total || 0;
  const totalPages = didsData?.total_pages || 1;

  const targets = isAdmin ? dids : dids.filter((d) => d.user_id === user?.id);

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Digital Identity (DID)</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Decentralized identifiers & verification status</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
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

      {myDid && !isAdmin && !isManager && (
        <Card className="p-4" style={{ background: '#141821', border: '1px solid rgba(61,111,224,0.3)', borderRadius: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="w-12 h-12 rounded-xl bg-[#3d6fe0]/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" style={{ color: '#3d6fe0' }} />
              </div>
              <div>
                <p className="font-medium" style={{ color: '#e6e9ef' }}>Your DID</p>
                <p className="font-mono text-sm" style={{ color: '#3d6fe0' }}>{myDid.did}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge variant={myDid.verified ? 'success' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                {myDid.verified ? 'Verified' : 'Pending Verification'}
              </Badge>
              {myDid.blockchain_tx_hash && (
                <span className="text-xs font-mono" style={{ color: '#8991a3' }}>
                  {formatTxHash(myDid.blockchain_tx_hash)}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {targets.map((x) => (
          <Card key={x.id} className="glow" style={{ background: '#141821', border: '1px solid #333a4a', borderRadius: 8, padding: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <b style={{ fontSize: '14.5px' }}>{x.user?.full_name || 'Unknown'}</b>
                {x.user && (
                  <Badge variant="info" style={{ fontSize: 10, marginLeft: 8, padding: '2px 6px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                    {x.user.role === 'ADMIN' ? 'OWNER' : x.user.role === 'USER' ? 'EMPLOYEE' : x.user.role}
                  </Badge>
                )}
              </div>
              <Badge variant={x.verified ? 'success' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                {x.verified ? 'VERIFIED' : 'PENDING'}
              </Badge>
            </div>
            <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
              <span style={{ color: '#8991a3' }}>DID</span>
              <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{x.did}</span>
            </div>
            <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
              <span style={{ color: '#8991a3' }}>Wallet</span>
              <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{formatAddress(x.wallet_address)}</span>
            </div>
            <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
              <span style={{ color: '#8991a3' }}>Identity Created</span>
              <span>{formatDate(x.created_at)}</span>
            </div>
            <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
              <span style={{ color: '#8991a3' }}>Verification</span>
              <Badge variant={x.verified ? 'success' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                {x.verified ? 'VERIFIED' : 'PENDING'}
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <Button size="sm" variant="outline" onClick={() => handleViewDid(x)}>
                <Shield className="h-3.5 w-3.5" />
                View
              </Button>
              {canVerify && !x.verified && (
                <Button size="sm" onClick={() => handleVerifyDID(x.id)} loading={isVerifying === x.id}>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verify
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="login-note" style={{ marginTop: 20, fontSize: 12, color: '#8991a3', background: '#191e29', border: '1px solid #262b37', borderRadius: 8, padding: '12px 14px' }}>
        A DID (Decentralized Identifier) represents a self-sovereign identity anchored to a blockchain wallet rather than a central authority.
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New DID">
        <div className="space-y-4" style={{ color: '#e6e9ef' }}>
          <p className="modal-sub" style={{ color: '#8991a3', fontSize: '12.5px', marginBottom: 18 }}>This will create a new decentralized identifier (DID) for your account. The DID will be registered on-chain if a wallet is connected.</p>
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18 }}>
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
          <div className="space-y-4" style={{ color: '#e6e9ef' }}>
            <div className="grid grid-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>DID</p>
                <p className="font-mono text-sm break-all">{selectedDid.did}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Wallet Address</p>
                <p className="font-mono text-sm">{formatAddress(selectedDid.wallet_address)}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Identity Hash</p>
                <p className="font-mono text-xs break-all">{selectedDid.identity_hash}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Status</p>
                <Badge variant={selectedDid.verified ? 'success' : 'warning'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                  {selectedDid.verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Created</p>
                <p className="text-sm">{formatDate(selectedDid.created_at)}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Verified At</p>
                <p className="text-sm">{selectedDid.verified_at ? formatDate(selectedDid.verified_at) : 'Not verified'}</p>
              </div>
              {selectedDid.blockchain_tx_hash && (
                <div style={{ gridColumn: 'span 2' }}>
                  <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Blockchain Transaction</p>
                  <p className="font-mono text-sm" style={{ color: '#2fa872' }}>{selectedDid.blockchain_tx_hash}</p>
                </div>
              )}
              {selectedDid.blockchain_block_number && (
                <div>
                  <p className="text-sm" style={{ color: '#8991a3', marginBottom: 4 }}>Block Number</p>
                  <p className="text-sm">{selectedDid.blockchain_block_number.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid #262b37' }}>
              <Button variant="outline" onClick={() => setSelectedDid(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
