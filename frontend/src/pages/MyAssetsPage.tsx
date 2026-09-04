import { useState } from 'react';
import { Search, Eye, Loader2, Box, Hash } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useAssets } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ASSET_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  TRANSFERRED: 'primary',
  BURNED: 'danger',
  FROZEN: 'warning',
};

export default function MyAssetsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const { data: assetsData, isLoading, error, refetch } = useAssets({
    page,
    page_size: 20,
    status: statusFilter,
    owner_id: user?.id,
    search: search || undefined,
  });

  const handleViewAsset = (asset: any) => {
    setSelectedAsset(asset);
  };

  if (isLoading && !assetsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Assets</h1>
          <p className="text-dark-600 dark:text-dark-400">View your assigned digital assets</p>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-100 dark:bg-dark-800 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const assets = assetsData?.items || [];
  const total = assetsData?.total || 0;
  const totalPages = assetsData?.total_pages || 1;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Assets</h1>
          <p className="text-dark-600 dark:text-dark-400">View your assigned digital assets (NFTs)</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} size="sm">
          <Loader2 className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {assets.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <Box className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No Assets Found</h3>
          <p className="text-dark-600 dark:text-dark-400 mb-6 max-w-md mx-auto">
            You don't have any digital assets assigned to you yet. Assets will appear here when they are allocated to you by an administrator.
          </p>
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-sm">
            <strong>Security Note:</strong> As an assigned user, you cannot transfer or reassign these assets. 
            Only administrators and managers can change asset assignments.
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search your assets..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-dark-600 dark:text-dark-400">Status:</label>
                <select
                  value={statusFilter || 'all'}
                  onChange={(e) => { const val = e.target.value; setStatusFilter(val === 'all' ? undefined : val); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
                >
                  <option value="all">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="TRANSFERRED">Transferred</option>
                  <option value="BURNED">Burned</option>
                  <option value="FROZEN">Frozen</option>
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
                    <th>Status</th>
                    <th>Created</th>
                    <th>Blockchain</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="font-mono text-sm">{asset.token_id || '-'}</td>
                      <td className="font-mono text-sm">{asset.asset_id}</td>
                      <td className="font-medium text-dark-900 dark:text-white">{asset.name}</td>
                      <td className="text-sm text-dark-600 dark:text-dark-400">{asset.category}</td>
                      <td>
                        <Badge variant={ASSET_STATUS_COLORS[asset.status] || 'default'}>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="text-sm text-dark-600 dark:text-dark-400">{formatDate(asset.created_at)}</td>
                      <td>
                        {asset.blockchain_tx_hash ? (
                          <span className="font-mono text-xs text-green-600 dark:text-green-400">
                            {formatTxHash(asset.blockchain_tx_hash)}
                          </span>
                        ) : (
                          <span className="text-xs text-dark-500 dark:text-dark-400">Not on-chain</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewAsset(asset)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <p className="text-sm text-dark-600 dark:text-dark-400">
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

          <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Asset Details" size="lg">
            {selectedAsset && (
              <AssetDetailView asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}

function AssetDetailView({ asset, onClose }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Token ID</p>
          <p className="font-mono text-2xl font-bold text-dark-900 dark:text-white">{asset.token_id || 'Pending'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Asset ID</p>
          <p className="font-mono text-sm">{asset.asset_id}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Name</p>
          <p className="font-medium text-dark-900 dark:text-white">{asset.name}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Category</p>
          <p className="text-sm text-dark-900 dark:text-white">{asset.category}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-dark-500 dark:text-dark-400">Description</p>
          <p className="text-sm text-dark-900 dark:text-white">{asset.description || 'No description'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-dark-500 dark:text-dark-400">Metadata URI</p>
          <p className="font-mono text-xs break-all">{asset.metadata_uri}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Creator</p>
          <p className="text-sm text-dark-900 dark:text-white">{asset.creator?.full_name || 'Unknown'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Status</p>
          <Badge variant={ASSET_STATUS_COLORS[asset.status] || 'default'}>
            {asset.status}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Created</p>
          <p className="text-sm text-dark-900 dark:text-white">{formatDate(asset.created_at)}</p>
        </div>
        {asset.blockchain_tx_hash && (
          <div className="col-span-2">
            <p className="text-sm text-dark-500 dark:text-dark-400">Blockchain Transaction</p>
            <p className="font-mono text-sm text-green-600 dark:text-green-400">{asset.blockchain_tx_hash}</p>
          </div>
        )}
        {asset.blockchain_block_number && (
          <div>
            <p className="text-sm text-dark-500 dark:text-dark-400">Block Number</p>
            <p className="text-sm text-dark-900 dark:text-white">{asset.blockchain_block_number.toLocaleString()}</p>
          </div>
        )}
        <div className="col-span-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Security Notice</p>
          <p className="text-sm text-blue-600 dark:text-blue-500">
            This asset is assigned to you. You cannot transfer, reassign, or approve transfers of this asset. 
            Only administrators and managers can change asset assignments.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}