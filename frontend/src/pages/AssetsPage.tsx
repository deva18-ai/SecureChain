import { useState } from 'react';
import { AlertCircle, ArrowRightLeft, Plus, RotateCcw, Search, Filter, MoreVertical, Shield, CheckCircle, Box, Loader2 as LoaderIcon, Key, ExternalLink, Copy, FileText } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAssets, useCreateAsset, useCreateTransfer, useUsers } from '../hooks/useApi';
import { displayRole, formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { Asset, AssetCreate, User } from '../types';
import { getApiErrorMessage } from '../utils/apiError';
import { cn } from '../utils/helpers';

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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Assets</h1>
          <p className="page-sub mt-1">Manage blockchain-secured assets, ownership, and transfer requests</p>
        </div>
        <div className="page-header-actions flex items-center gap-3 flex-wrap">
          <div className="relative hidden sm:block w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => { setStatusFilter(e.target.value || undefined); setPage(1); }}
            className="hidden sm:block px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-sm"
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

      {/* Statistics Cards */}
      <div className="data-grid">
        <StatCard
          title="Total Assets"
          value={stats.total}
          icon={<Box className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Assigned"
          value={stats.assigned}
          icon={<Shield className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Available"
          value={stats.available}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
        <StatCard
          title="Frozen"
          value={stats.frozen}
          icon={<AlertCircle className="h-6 w-6" />}
          color="warning"
        />
      </div>

      {/* Manager Notice */}
      {isManager && (
        <Card variant="hover" padding="lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span className="text-sm text-gray-600">Manager operations enter <span className="font-semibold text-warning">Pending Owner Approval</span>. Requests do not execute until the Owner decides.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Request Transfer', 'Request Freeze', 'Request Update', 'Request Edit Access'].map((label) => <Badge key={label} variant="pending">{label}</Badge>)}
            </div>
          </div>
        </Card>
      )}

      {/* Assets Table */}
      <Card variant="hover" padding="none">
        {isLoading && !assetsData ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredAssets.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Asset ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Blockchain</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">{asset.asset_id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 text-gray-600">{asset.category}</td>
                      <td className="px-6 py-4 text-gray-600">{asset.creator?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {asset.owner ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-blue flex items-center justify-center text-white text-xs font-medium">
                              {asset.owner.full_name.charAt(0)}
                            </div>
                            <span className="text-gray-900">{asset.owner.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="px-6 py-4">
                        {asset.blockchain_tx_hash ? (
                          <span className="font-mono text-xs text-primary-blue truncate max-w-[120px] inline-block">
                            {formatTxHash(asset.blockchain_tx_hash)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No blockchain record</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(asset.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); }} className="p-2" aria-label="View details">
                            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-primary-blue" />
                          </Button>
                          {asset.blockchain_tx_hash && (
                            <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(asset.blockchain_tx_hash!); toast.success('TX Hash copied'); }} className="p-2" aria-label="Copy transaction hash">
                              <Copy className="h-4 w-4 text-gray-400 hover:text-primary-blue" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            {isOwner && (
              <Button className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                Register First Asset
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Create Asset Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register Asset" size="lg">
        <AssetCreateForm users={users} onSubmit={handleCreateAsset} onCancel={() => setShowCreateModal(false)} isLoading={createAssetMutation.isPending} />
      </Modal>

      {/* Transfer Request Modal */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Request Transfer" size="lg">
        <TransferRequestForm assets={assets} users={users} onSubmit={handleTransferRequest} onCancel={() => setShowTransferModal(false)} isLoading={createTransferMutation.isPending} />
      </Modal>

      {/* Asset Detail Modal */}
      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Asset Details" size="xl">
        {selectedAsset && <AssetDetailView asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      </Modal>
    </div>
  );
}

function AssetCreateForm({ users, onSubmit, onCancel, isLoading }: { users: User[]; onSubmit: (data: AssetCreate) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({ asset_id: '', name: '', category: '', metadata_uri: '', initial_owner_id: '' });

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, initial_owner_id: Number(formData.initial_owner_id || users[0]?.id) }); }}>
      <p className="text-gray-600 text-sm">Register a protected asset in SecureChain. The asset will be minted as an NFT on the blockchain.</p>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Asset ID" value={formData.asset_id} onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })} placeholder="SC-ASSET-001" required />
        <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Asset name" required />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Laptop, Server, Mobile, Land Record" required />
        <Input label="Metadata URI" value={formData.metadata_uri} onChange={(e) => setFormData({ ...formData, metadata_uri: e.target.value })} placeholder="ipfs:// or internal metadata URI" required />
      </div>

      <div className="space-y-2">
        <label className="label">Initial Assignee</label>
        <select
          value={formData.initial_owner_id}
          onChange={(e) => setFormData({ ...formData, initial_owner_id: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
        >
          {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({displayRole(u.role)})</option>)}
        </select>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-4">Blockchain Information (auto-populated after registration)</p>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Token ID</p>
            <p className="font-mono text-gray-900">Assigned on mint</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Contract</p>
            <p className="font-mono text-xs text-gray-900 truncate">0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Network</p>
            <p className="font-mono text-gray-900">Hardhat Localhost (Sepolia Ready)</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Transaction</p>
            <p className="font-mono text-xs text-gray-900">Pending</p>
          </div>
        </div>
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
    <div className="space-y-6">
      {/* Overview Section */}
      <div>
        <h3 className="section-title flex items-center gap-2 mb-4">
          <Box className="h-5 w-5 text-primary-blue" />
          Asset Overview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Asset ID</p>
            <p className="font-mono text-gray-900">{asset.asset_id}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Name</p>
            <p className="font-medium text-gray-900">{asset.name}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Category</p>
            <p className="text-gray-900">{asset.category}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Status</p>
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </div>

      {/* Blockchain Details */}
      <div>
        <h3 className="section-title flex items-center gap-2 mb-4">
          <Box className="h-5 w-5 text-primary-blue" />
          Blockchain Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Token ID</p>
            <p className="font-mono text-gray-900">{asset.token_id}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Contract Address</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-gray-900 truncate flex-1">{asset.contract_address}</p>
              {asset.contract_address && (
                <Button variant="ghost" size="xs" onClick={() => { navigator.clipboard.writeText(asset.contract_address!); toast.success('Contract address copied'); }} className="p-1" aria-label="Copy contract address">
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Network</p>
            <p className="font-mono text-gray-900">{asset.blockchain_network || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Block Number</p>
            <p className="font-mono text-gray-900">{asset.blockchain_block_number?.toLocaleString() || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 sm:col-span-2">
            <p className="text-gray-500 text-xs font-medium mb-1">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-gray-900 truncate flex-1">{asset.blockchain_tx_hash || 'N/A'}</p>
              {asset.blockchain_tx_hash && (
                <>
                  <Button variant="ghost" size="xs" onClick={() => { navigator.clipboard.writeText(asset.blockchain_tx_hash!); toast.success('TX Hash copied'); }} className="p-1" aria-label="Copy transaction hash">
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${asset.blockchain_tx_hash}`, '_blank')} className="p-1" aria-label="View on Etherscan">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Transaction Status</p>
            <StatusBadge status={asset.blockchain_tx_status || 'PENDING'} />
          </div>
        </div>
      </div>

      {/* Assignment Information */}
      <div>
        <h3 className="section-title flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary-blue" />
          Assignment Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Creator</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium text-sm">
                {asset.creator?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{asset.creator?.full_name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{displayRole(asset.creator?.role)}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Current Assignee</p>
            {asset.owner ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium text-sm">
                  {asset.owner.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{asset.owner.full_name}</p>
                  <p className="text-sm text-gray-500">{displayRole(asset.owner.role)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unassigned</p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Created</p>
            <p className="text-gray-900">{formatDate(asset.created_at)}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Last Updated</p>
            <p className="text-gray-900">{formatDate(asset.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Ownership Model Explanation */}
      <div className="p-4 rounded-lg bg-primary-blue/5 border border-primary-blue/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Ownership Model</p>
            <p className="text-sm text-gray-600">
              <strong>ERC-721 ownership remains with the SecureChain custodian.</strong> The employee receives an assignment, not transferable ERC-721 ownership. 
              This is a core security feature of SecureChain &mdash; the platform maintains custodial control while granting operational access to authorized personnel.
            </p>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div>
        <h3 className="section-title flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-success" />
          Security Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Verification Status</p>
            <Badge variant="success">VERIFIED</Badge>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Immutable Record</p>
            <Badge variant="primary">ON-CHAIN</Badge>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-1">Audit Trail</p>
            <Button variant="ghost" size="sm" leftIcon={<FileText className="h-4 w-4" />} className="justify-start">View History</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}