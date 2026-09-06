import { useState } from 'react';
import { Plus, Loader2, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAssets, useCreateAsset, useAllocateAsset, useRevokeAssignment } from '../hooks/useApi';
import { useUsers } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';
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
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [allocatingId, setAllocatingId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [allocateOwnerId, setAllocateOwnerId] = useState<number | null>(null);

  const { data: assetsData, isLoading, error, refetch } = useAssets({
    page,
    page_size: 20,
    status: statusFilter,
    category: categoryFilter,
    search: search || undefined,
  });
  const createAssetMutation = useCreateAsset();
  const allocateAssetMutation = useAllocateAsset();
  const revokeAssignmentMutation = useRevokeAssignment();
  const { data: usersData } = useUsers({ page_size: 100 });

  const isAdmin = hasRole(['ADMIN']);
  const isManager = hasRole(['ADMIN', 'MANAGER']);
  const canCreate = isAdmin;
  const canAllocate = isManager;

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

  const handleAllocate = async (assetId: number, newOwnerId: number) => {
    setAllocatingId(assetId);
    try {
      await allocateAssetMutation.mutateAsync({ id: assetId, new_owner_id: newOwnerId });
      toast.success('Asset allocated successfully');
      setAllocateOwnerId(null);
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to allocate asset'));
    } finally {
      setAllocatingId(null);
    }
  };

  const handleRevoke = async (assetId: number) => {
    setRevokingId(assetId);
    try {
      await revokeAssignmentMutation.mutateAsync(assetId);
      toast.success('Asset assignment revoked successfully');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to revoke assignment'));
    } finally {
      setRevokingId(null);
    }
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const categories = Array.from(new Set(assetsData?.items?.map((asset) => asset.category).filter(Boolean) || []));

  if (isLoading && !assetsData) {
    return (
      <div className="space-y-6" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Assets</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>All registered SecureChain assets</div>
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

  const assets = assetsData?.items || [];
  const total = assetsData?.total || 0;
  const totalPages = assetsData?.total_pages || 1;
  const users = usersData?.items || [];

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Assets</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>All registered SecureChain assets</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4" />
              Register Asset
            </Button>
          )}
          {canAllocate && (
            <Button onClick={() => setShowCreateModal(true)} size="sm" variant="outline">
              <ArrowRightLeft className="h-4 w-4" />
              Request Transfer
            </Button>
          )}
        </div>
      </div>

      {assets.length > 0 ? (
        <div className="asset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="asset-card"
              onClick={() => handleViewAsset(asset)}
              style={{
                border: '1px solid #262b37',
                borderRadius: 8,
                padding: 16,
                background: '#141821',
                cursor: 'pointer',
                transition: 'border-color .15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#333a4a'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#262b37'}
            >
              <div className="asset-id" style={{ fontFamily: 'var(--mono)', color: '#8991a3', fontSize: 12 }}>{asset.asset_id}</div>
              <div className="asset-name" style={{ fontWeight: 600, margin: '6px 0 4px', fontSize: '14.5px' }}>{asset.name}</div>
              <div className="asset-meta" style={{ fontSize: 12, color: '#8991a3', marginBottom: 10 }}>
                {asset.category} · {asset.owner?.full_name || 'Unassigned'}
              </div>
              <div className="asset-foot" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'center' }}>
                <Badge variant={ASSET_STATUS_BADGES[asset.status] || 'default'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                  {asset.status}
                </Badge>
                <Badge variant="success" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(47,168,114,0.1)', color: '#2fa872', border: '1px solid rgba(47,168,114,0.3)' }}>VERIFIED</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, padding: 18, textAlign: 'center', color: '#8991a3' }}>
          No assets to display.
        </Card>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t" style={{ borderColor: '#262b37', display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween' }}>
          <p className="text-sm" style={{ color: '#8991a3' }}>
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} assets
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register New Asset" size="lg">
        <AssetCreateForm users={users} onSubmit={handleCreateAsset} onCancel={() => setShowCreateModal(false)} isLoading={createAssetMutation.isPending} />
      </Modal>

      <Modal isOpen={allocateOwnerId !== null} onClose={() => setAllocateOwnerId(null)} title="Request Transfer" size="lg">
        <AssetActionForm
          title="Request Transfer"
          users={users}
          onSubmit={(ownerId: number) => {
            if (allocateOwnerId !== null) {
              void handleAllocate(allocateOwnerId, ownerId);
            }
          }}
          onCancel={() => setAllocateOwnerId(null)}
          isLoading={allocatingId !== null}
          actionLabel="Request Transfer"
        />
      </Modal>

      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Asset Details" size="lg">
        {selectedAsset && (
          <AssetDetailView asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        )}
      </Modal>
    </div>
  );
}

interface AssetCreateFormProps {
  users: User[];
  onSubmit: (data: AssetCreate) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function AssetCreateForm({ users, onSubmit, onCancel, isLoading }: AssetCreateFormProps) {
  const [formData, setFormData] = useState({
    asset_id: '',
    name: '',
    category: 'Laptop',
    assigned_to: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      asset_id: formData.asset_id,
      name: formData.name,
      category: formData.category,
      metadata_uri: '',
      initial_owner_id: formData.assigned_to ? parseInt(formData.assigned_to) : users[0]?.id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ color: '#e6e9ef' }}>
      <p className="modal-sub" style={{ color: '#8991a3', fontSize: '12.5px', marginBottom: 18 }}>Add a new asset directly to the SecureChain registry — Owner privilege.</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Asset Name</label>
        <Input
          id="ca_name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. MacBook Pro 16"
          required
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Category</label>
        <Input
          id="ca_category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g. Laptop, Server, Mobile"
          required
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Asset ID</label>
        <Input
          id="ca_asset_id"
          value={formData.asset_id}
          onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
          placeholder="e.g. SC-LAP-001"
          required
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Assign To (optional)</label>
        <select
          id="ca_assignee"
          value={formData.assigned_to}
          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #262b37', background: '#10131a', color: '#e6e9ef', fontSize: '13.5px' }}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
          ))}
        </select>
      </div>
      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18 }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Create Asset</Button>
      </div>
    </form>
  );
}

interface AssetActionFormProps {
  title: string;
  users: User[];
  onSubmit: (ownerId: number) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  actionLabel: string;
}

function AssetActionForm({ users, onSubmit, onCancel, isLoading, actionLabel }: AssetActionFormProps) {
  const [ownerId, setOwnerId] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ownerId) onSubmit(parseInt(ownerId)); }} className="space-y-4" style={{ color: '#e6e9ef' }}>
      <p style={{ color: '#8991a3' }}>Select the recipient for this {actionLabel.toLowerCase()} request.</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Recipient</label>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #262b37', background: '#10131a', color: '#e6e9ef', fontSize: '13.5px' }}
          required
        >
          <option value="">Select recipient</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name} ({u.email}) - {u.wallet_address ? formatAddress(u.wallet_address) : 'No wallet'}</option>
          ))}
        </select>
      </div>
      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18 }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading} disabled={!ownerId}>{actionLabel}</Button>
      </div>
    </form>
  );
}

function AssetDetailView({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const assignee = asset.owner;

  return (
    <div className="space-y-4" style={{ color: '#e6e9ef' }}>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Owner</span>
        <span>SecureChain Corp</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Assigned To</span>
        <span>{assignee?.full_name || 'Unassigned'}</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Status</span>
        <Badge variant={ASSET_STATUS_BADGES[asset.status] || 'default'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>{asset.status}</Badge>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Security State</span>
        <Badge variant="success" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(47,168,114,0.1)', color: '#2fa872', border: '1px solid rgba(47,168,114,0.3)' }}>VERIFIED</Badge>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Created</span>
        <span>{formatDate(asset.created_at)}</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Blockchain Record</span>
        <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{asset.blockchain_tx_hash ? formatTxHash(asset.blockchain_tx_hash) : '—'}</span>
      </div>
      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18 }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
