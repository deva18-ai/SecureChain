import { useState } from 'react';
import { AlertCircle, ArrowRightLeft, Plus, RotateCcw, Search, Filter, MoreVertical, Shield, CheckCircle, Box } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAssets, useCreateAsset, useCreateTransfer, useUsers } from '../hooks/useApi';
import { displayRole, formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { Asset, AssetCreate, User } from '../types';
import { getApiErrorMessage } from '../utils/apiError';

const ASSET_STATUS_BADGES: Record<string, 'success' | 'primary' | 'danger' | 'warning' | 'violet' | 'outline'> = {
  ACTIVE: 'success',
  TRANSFERRED: 'primary',
  BURNED: 'danger',
  FROZEN: 'warning',
  PROTECTED: 'violet',
};

export default function AssetsPage() {
  const { hasRole, user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
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

  const stats = {
    total: assets.length,
    assigned: assets.filter(a => a.owner).length,
    available: assets.filter(a => !a.owner).length,
    frozen: assets.filter(a => a.status === 'FROZEN').length,
  };

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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_id.toLowerCase().includes(search.toLowerCase()) ||
      asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Assets</h1>
          <p className="text-gray-600 mt-1">Manage blockchain-secured assets, ownership, and transfer requests</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative hidden sm:block w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => { setStatusFilter(e.target.value || undefined); setPage(1); }}
            className="hidden sm:block px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="FROZEN">Frozen</option>
            <option value="PROTECTED">Protected</option>
          </select>
          <div className="flex gap-2">
            {isOwner && <Button onClick={() => setShowCreateModal(true)} size="sm" leftIcon={<Plus className="h-4 w-4" />}>Register Asset</Button>}
            {isManager && <Button onClick={() => setShowTransferModal(true)} size="sm" variant="outline" leftIcon={<ArrowRightLeft className="h-4 w-4" />}>Request Transfer</Button>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Box className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Frozen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.frozen}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {isManager && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-gray-600">Manager operations enter <span className="font-semibold text-amber-600">Pending Owner Approval</span>. Requests do not execute until the Owner decides.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Request Transfer', 'Request Freeze', 'Request Update', 'Request Edit Access'].map((label) => <Badge key={label} variant="pending">{label}</Badge>)}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isLoading && !assetsData ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredAssets.length > 0 ? (
          <>
            <div className="grid gap-4 p-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group p-5 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="font-mono text-xs text-gray-500">{asset.asset_id}</div>
                    <Badge variant={ASSET_STATUS_BADGES[asset.status] || 'outline'}>{asset.status}</Badge>
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{asset.name}</div>
                  <div className="text-sm text-gray-600 mb-3">{asset.category} • {asset.owner?.full_name || 'Unassigned'}</div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <Badge variant="success">VERIFIED</Badge>
                    <div className="font-mono text-xs text-gray-500 truncate max-w-[120px]">
                      {asset.blockchain_tx_hash ? formatTxHash(asset.blockchain_tx_hash) : 'No blockchain record'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assets registered yet.</p>
          </div>
        )}
      </div>

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
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, initial_owner_id: Number(formData.initial_owner_id || users[0]?.id) }); }}>
      <p className="text-gray-600 text-sm">Register a protected asset in SecureChain.</p>
      <Input label="Asset ID" value={formData.asset_id} onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })} placeholder="SC-ASSET-001" required />
      <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Asset name" required />
      <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Laptop, Server, Mobile" required />
      <Input label="Metadata URI" value={formData.metadata_uri} onChange={(e) => setFormData({ ...formData, metadata_uri: e.target.value })} placeholder="ipfs:// or internal metadata URI" required />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Assigned User</label>
        <select
          value={formData.initial_owner_id}
          onChange={(e) => setFormData({ ...formData, initial_owner_id: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)})</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Register Asset</Button>
      </div>
    </form>
  );
}

function TransferRequestForm({ assets, users, onSubmit, onCancel, isLoading }: { assets: Asset[]; users: User[]; onSubmit: (assetId: number, recipientId: number) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [assetId, setAssetId] = useState('');
  const [recipientId, setRecipientId] = useState('');

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit(Number(assetId), Number(recipientId)); }}>
      <p className="text-gray-600 text-sm">Submit a transfer request. The Owner must approve it before execution.</p>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Asset</label>
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Select asset</option>
          {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.asset_id} - {asset.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Recipient</label>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Select recipient</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)}) - {u.wallet_address ? formatAddress(u.wallet_address) : 'No wallet'}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isLoading} disabled={!assetId || !recipientId}>Request Transfer</Button>
      </div>
    </form>
  );
}

function AssetDetailView({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
        <div>
          <div className="font-semibold text-lg text-gray-900">{asset.name}</div>
          <div className="font-mono text-sm text-gray-500">{asset.asset_id}</div>
        </div>
        <Badge variant={ASSET_STATUS_BADGES[asset.status] || 'outline'}>{asset.status}</Badge>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Category</span>
          <span className="text-gray-900">{asset.category}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Assigned User</span>
          <span className="text-gray-900">{asset.owner?.full_name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Security</span>
          <Badge variant="success">VERIFIED</Badge>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Created</span>
          <span className="text-gray-900">{formatDate(asset.created_at)}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Blockchain Record</span>
          <span className="font-mono text-gray-900 truncate max-w-[200px]">{asset.blockchain_tx_hash ? formatTxHash(asset.blockchain_tx_hash) : '-'}</span>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}