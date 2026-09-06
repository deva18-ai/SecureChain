import { useState } from 'react';
import { AlertCircle, ArrowRightLeft, Plus, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAssets, useCreateAsset, useCreateTransfer, useUsers } from '../hooks/useApi';
import { displayRole, formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { Asset, AssetCreate, User } from '../types';
import { getApiErrorMessage } from '../utils/apiError';

const ASSET_STATUS_BADGES: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  TRANSFERRED: 'primary',
  BURNED: 'danger',
  FROZEN: 'warning',
  PROTECTED: 'violet',
};

export default function AssetsPage() {
  const { hasRole, user } = useAuth();
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: assetsData, isLoading, refetch } = useAssets({ page, page_size: 20 });
  const { data: usersData } = useUsers({ page_size: 100 });
  const createAssetMutation = useCreateAsset();
  const createTransferMutation = useCreateTransfer();

  const isOwner = hasRole(['ADMIN']);
  const isManager = user?.role === 'MANAGER';
  const assets = assetsData?.items || [];
  const users = usersData?.items || [];
  const total = assetsData?.total || 0;
  const totalPages = assetsData?.total_pages || 1;

  const handleCreateAsset = async (data: AssetCreate) => {
    try {
      await createAssetMutation.mutateAsync(data);
      toast.success('Asset registered successfully');
      setShowCreateModal(false);
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to register asset'));
    }
  };

  const handleTransferRequest = async (assetId: number, recipientId: number) => {
    const recipient = users.find((candidate) => candidate.id === recipientId);
    if (!recipient?.wallet_address) {
      toast.error('Selected recipient does not have a wallet address.');
      return;
    }

    try {
      await createTransferMutation.mutateAsync({ asset_id: assetId, to_address: recipient.wallet_address });
      toast.success('Transfer request submitted for Owner approval');
      setShowTransferModal(false);
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to submit transfer request'));
    }
  };

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Assets</div>
          <div className="page-sub">Registered assets, assignment state, and blockchain records</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isOwner && <Button onClick={() => setShowCreateModal(true)} size="sm"><Plus className="h-4 w-4" />Register Asset</Button>}
          {isManager && <Button onClick={() => setShowTransferModal(true)} size="sm" variant="outline"><ArrowRightLeft className="h-4 w-4" />Request Transfer</Button>}
        </div>
      </div>

      {isManager && (
        <Card className="glow" style={{ padding: 14 }}>
          <div className="page-sub">Manager operations enter Pending Owner Approval. Requests do not execute until the Owner decides.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['Request Transfer', 'Request Freeze', 'Request Update', 'Request Edit Access'].map((label) => <Badge key={label} variant="pending">{label}</Badge>)}
          </div>
        </Card>
      )}

      {isLoading && !assetsData ? (
        <Card className="p-6 space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-[#191e29] rounded animate-pulse" />)}
        </Card>
      ) : assets.length > 0 ? (
        <div className="asset-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="asset-card" onClick={() => setSelectedAsset(asset)}>
              <div className="asset-id">{asset.asset_id}</div>
              <div className="asset-name">{asset.name}</div>
              <div className="asset-meta">{asset.category} - {asset.owner?.full_name || 'Unassigned'}</div>
              <div className="asset-foot">
                <Badge variant={ASSET_STATUS_BADGES[asset.status] || 'default'}>{asset.status}</Badge>
                <Badge variant="success">VERIFIED</Badge>
              </div>
              <div className="mono" style={{ marginTop: 10 }}>{asset.blockchain_tx_hash ? formatTxHash(asset.blockchain_tx_hash) : 'No blockchain record'}</div>
            </div>
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', color: '#8991a3', padding: 30 }}>
          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
          No assets registered yet.
        </Card>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <span className="page-sub">Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register Asset" size="lg">
        <AssetCreateForm users={users} onSubmit={handleCreateAsset} onCancel={() => setShowCreateModal(false)} isLoading={createAssetMutation.isPending} />
      </Modal>

      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Request Transfer" size="lg">
        <TransferRequestForm assets={assets} users={users} onSubmit={handleTransferRequest} onCancel={() => setShowTransferModal(false)} isLoading={createTransferMutation.isPending} />
      </Modal>

      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Asset Details" size="lg">
        {selectedAsset && <AssetDetailView asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      </Modal>
    </div>
  );
}

function AssetCreateForm({ users, onSubmit, onCancel, isLoading }: { users: User[]; onSubmit: (data: AssetCreate) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({ asset_id: '', name: '', category: '', metadata_uri: '', initial_owner_id: '' });
  return (
    <form className="space-y-4" style={{ color: '#e6e9ef' }} onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, initial_owner_id: Number(formData.initial_owner_id || users[0]?.id) }); }}>
      <p className="modal-sub">Register a protected asset in SecureChain.</p>
      <div className="field"><label>Asset ID</label><Input value={formData.asset_id} onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })} placeholder="SC-ASSET-001" required /></div>
      <div className="field"><label>Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Asset name" required /></div>
      <div className="field"><label>Category</label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Laptop, Server, Mobile" required /></div>
      <div className="field"><label>Metadata URI</label><Input value={formData.metadata_uri} onChange={(e) => setFormData({ ...formData, metadata_uri: e.target.value })} placeholder="ipfs:// or internal metadata URI" required /></div>
      <div className="field"><label>Assigned User</label><select value={formData.initial_owner_id} onChange={(e) => setFormData({ ...formData, initial_owner_id: e.target.value })} required>{users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)})</option>)}</select></div>
      <div className="modal-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" loading={isLoading}>Register Asset</Button></div>
    </form>
  );
}

function TransferRequestForm({ assets, users, onSubmit, onCancel, isLoading }: { assets: Asset[]; users: User[]; onSubmit: (assetId: number, recipientId: number) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [assetId, setAssetId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  return (
    <form className="space-y-4" style={{ color: '#e6e9ef' }} onSubmit={(e) => { e.preventDefault(); onSubmit(Number(assetId), Number(recipientId)); }}>
      <p className="modal-sub">Submit a transfer request. The Owner must approve it before execution.</p>
      <div className="field"><label>Asset</label><select value={assetId} onChange={(e) => setAssetId(e.target.value)} required><option value="">Select asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.asset_id} - {asset.name}</option>)}</select></div>
      <div className="field"><label>Recipient</label><select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required><option value="">Select recipient</option>{users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)}) - {u.wallet_address ? formatAddress(u.wallet_address) : 'No wallet'}</option>)}</select></div>
      <div className="modal-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" loading={isLoading} disabled={!assetId || !recipientId}>Request Transfer</Button></div>
    </form>
  );
}

function AssetDetailView({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  return (
    <div className="space-y-4" style={{ color: '#e6e9ef' }}>
      <div className="kv"><span>Asset ID</span><span className="mono">{asset.asset_id}</span></div>
      <div className="kv"><span>Name</span><span>{asset.name}</span></div>
      <div className="kv"><span>Category</span><span>{asset.category}</span></div>
      <div className="kv"><span>Assigned User</span><span>{asset.owner?.full_name || 'Unassigned'}</span></div>
      <div className="kv"><span>Status</span><Badge variant={ASSET_STATUS_BADGES[asset.status] || 'default'}>{asset.status}</Badge></div>
      <div className="kv"><span>Security</span><Badge variant="success">VERIFIED</Badge></div>
      <div className="kv"><span>Created</span><span>{formatDate(asset.created_at)}</span></div>
      <div className="kv"><span>Blockchain Record</span><span className="mono">{asset.blockchain_tx_hash ? formatTxHash(asset.blockchain_tx_hash) : '-'}</span></div>
      <div className="modal-actions"><Button variant="outline" onClick={onClose}>Close</Button></div>
    </div>
  );
}
