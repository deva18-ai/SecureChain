import { useState } from 'react';
import { Search, Plus, Eye, Loader2, AlertCircle, ArrowRightLeft, Send, Trash2, Lock, Unlock, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useAssets, useCreateAsset, useAllocateAsset, useRevokeAssignment } from '../hooks/useApi';
import { useUsers } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash, formatNumber } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ASSET_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  TRANSFERRED: 'primary',
  BURNED: 'danger',
  FROZEN: 'warning',
};

export default function AssetsPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
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

  const isAdmin = hasRole(['OWNER']);
  const isManager = hasRole(['OWNER', 'MANAGER']);
  const canCreate = isAdmin;
  const canAllocate = isManager;

  const handleCreateAsset = async (data: any) => {
    try {
      await createAssetMutation.mutateAsync(data);
      toast.success('Asset minted successfully');
      setShowCreateModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to mint asset');
    }
  };

  const handleAllocate = async (assetId: number, newOwnerId: number) => {
    setAllocatingId(assetId);
    try {
      await allocateAssetMutation.mutateAsync({ id: assetId, new_owner_id: newOwnerId });
      toast.success('Asset allocated successfully');
      setAllocateOwnerId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to allocate asset');
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
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to revoke assignment');
    } finally {
      setRevokingId(null);
    }
  };

  const handleViewAsset = (asset: any) => {
    setSelectedAsset(asset);
  };

  const categories = Array.from(new Set(assetsData?.items?.map((a: any) => a.category).filter(Boolean) || []));

  if (isLoading && !assetsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-cyber-text">Digital Assets (NFTs)</h1>
            <p className="text-cyber-textMuted">Manage ERC-721 assets and ownership</p>
          </div>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-48 bg-cyber-elevated rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-cyber-elevated/50 rounded" />
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
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cyber-text">Digital Assets (NFTs)</h1>
          <p className="text-cyber-textMuted">Manage ERC-721 assets and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4" />
              Mint Asset
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-cyber-border flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-cyber-textMuted">Status:</label>
            <select
              value={statusFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setStatusFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text text-sm"
            >
              <option value="all">All</option>
              <option value="ACTIVE">Active</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="BURNED">Burned</option>
              <option value="FROZEN">Frozen</option>
            </select>
            <label className="text-sm text-cyber-textMuted">Category:</label>
            <select
              value={categoryFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setCategoryFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text text-sm"
            >
              <option value="all">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Token ID</th>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Created</th>
                <th>Blockchain</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-cyber-textMuted">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assets found</p>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="font-mono text-sm">{asset.token_id || '-'}</td>
                    <td className="font-mono text-sm">{asset.asset_id}</td>
                    <td className="font-medium text-cyber-text">{asset.name}</td>
                    <td className="text-sm text-cyber-textMuted">{asset.category}</td>
                    <td>
                      {asset.owner ? (
                        <div>
                          <p className="font-medium text-cyber-text">{asset.owner.full_name}</p>
                          <p className="text-xs text-cyber-textMuted font-mono">{formatAddress(asset.owner.wallet_address || '')}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-cyber-textMuted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={ASSET_STATUS_COLORS[asset.status] || 'default'}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="text-sm text-cyber-textMuted">{formatDate(asset.created_at)}</td>
                    <td>
                      {asset.blockchain_tx_hash ? (
                        <span className="font-mono text-xs text-cyber-success">
                          {formatTxHash(asset.blockchain_tx_hash)}
                        </span>
                      ) : (
                        <span className="text-xs text-cyber-textMuted">Not on-chain</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canAllocate && asset.status === 'ACTIVE' && asset.owner_id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAllocateOwnerId(asset.id)}
                            loading={allocatingId === asset.id}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                            Allocate
                          </Button>
                        )}
                        {canAllocate && asset.owner_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(asset.id)}
                            loading={revokingId === asset.id}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Revoke
                          </Button>
                        )}
                        {isAdmin && asset.status !== 'BURNED' && asset.status !== 'FROZEN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast('Burn functionality coming soon');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && asset.status !== 'FROZEN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast('Freeze functionality coming soon');
                            }}
                          >
                            <Lock className="h-4 w-4" />
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
          <div className="p-4 border-t border-cyber-border flex items-center justify-between">
            <p className="text-sm text-cyber-textMuted">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} assets
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

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Mint New Asset" size="lg">
        <AssetCreateForm
          users={users}
          onSubmit={handleCreateAsset}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createAssetMutation.isPending}
        />
      </Modal>

      <Modal isOpen={allocateOwnerId !== null} onClose={() => setAllocateOwnerId(null)} title="Allocate Asset" size="lg">
        <AssetActionForm
          title="Allocate Asset"
          users={users.filter(u => u.id !== assets.find((a: any) => a.id === allocateOwnerId)?.owner_id)}
          onSubmit={(ownerId) => handleAllocate(allocateOwnerId!, ownerId)}
          onCancel={() => setAllocateOwnerId(null)}
          isLoading={allocatingId !== null}
          actionLabel="Allocate"
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

function AssetCreateForm({ users, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    asset_id: '',
    name: '',
    description: '',
    category: '',
    metadata_uri: '',
    initial_owner_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      initial_owner_id: parseInt(formData.initial_owner_id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Asset ID"
        value={formData.asset_id}
        onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
        placeholder="asset-001"
        required
      />
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Asset Name"
        required
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Asset description"
        type="textarea"
        rows={3}
      />
      <Input
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Equipment, Vehicle, Document, etc."
        required
      />
      <Input
        label="Metadata URI (IPFS)"
        value={formData.metadata_uri}
        onChange={(e) => setFormData({ ...formData, metadata_uri: e.target.value })}
        placeholder="ipfs://QmHash..."
        required
      />
      <div>
        <label className="block text-sm font-medium text-cyber-textMuted mb-1.5">Initial Owner</label>
        <select
          value={formData.initial_owner_id}
          onChange={(e) => setFormData({ ...formData, initial_owner_id: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary"
          required
        >
          <option value="">Select owner</option>
          {users.map((u: any) => (
            <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Mint Asset</Button>
      </div>
    </form>
  );
}

function AssetActionForm({ title, users, onSubmit, onCancel, isLoading, actionLabel }: any) {
  const [ownerId, setOwnerId] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ownerId) onSubmit(parseInt(ownerId)); }} className="space-y-4">
      <p className="text-cyber-textMuted">
        Select the recipient for this {actionLabel.toLowerCase()} action.
      </p>
      <div>
        <label className="block text-sm font-medium text-cyber-textMuted mb-1.5">Recipient</label>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary"
          required
        >
          <option value="">Select recipient</option>
          {users.map((u: any) => (
            <option key={u.id} value={u.id}>{u.full_name} ({u.email}) - {u.wallet_address ? formatAddress(u.wallet_address) : 'No wallet'}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading} disabled={!ownerId}>{actionLabel}</Button>
      </div>
    </form>
  );
}

function AssetDetailView({ asset, onClose }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-cyber-textMuted">Token ID</p>
          <p className="font-mono text-2xl font-bold text-cyber-text">{asset.token_id || 'Pending'}</p>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Asset ID</p>
          <p className="font-mono text-sm">{asset.asset_id}</p>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Name</p>
          <p className="font-medium text-cyber-text">{asset.name}</p>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Category</p>
          <p className="text-sm text-cyber-text">{asset.category}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-cyber-textMuted">Description</p>
          <p className="text-sm text-cyber-text">{asset.description || 'No description'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-cyber-textMuted">Metadata URI</p>
          <p className="font-mono text-xs break-all">{asset.metadata_uri}</p>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Creator</p>
          <p className="text-sm text-cyber-text">{asset.creator?.full_name || 'Unknown'}</p>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Owner</p>
          <p className="text-sm text-cyber-text">{asset.owner?.full_name || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Status</p>
          <Badge variant={ASSET_STATUS_COLORS[asset.status] || 'default'}>
            {asset.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-cyber-textMuted">Created</p>
          <p className="text-sm text-cyber-text">{formatDate(asset.created_at)}</p>
        </div>
        {asset.blockchain_tx_hash && (
          <div className="col-span-2">
            <p className="text-sm text-cyber-textMuted">Blockchain Transaction</p>
            <p className="font-mono text-sm text-cyber-success">{asset.blockchain_tx_hash}</p>
          </div>
        )}
        {asset.blockchain_block_number && (
          <div>
            <p className="text-sm text-cyber-textMuted">Block Number</p>
            <p className="text-sm text-cyber-text">{asset.blockchain_block_number.toLocaleString()}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}