import { useState } from 'react';
import { Search, Eye, Loader2, AlertCircle, RefreshCw, Blocks, Hash, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useBlockchainStatus, useBlockchainTransaction, useBlockchainAsset } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash, formatNumber, formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function BlockchainPage() {
  const { hasRole } = useAuth();
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [txDetail, setTxDetail] = useState<any>(null);
  const [assetDetail, setAssetDetail] = useState<any>(null);

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useBlockchainStatus();
  const { data: txData, isLoading: txLoading } = useBlockchainTransaction(selectedTxHash || '');
  const { data: assetData, isLoading: assetLoading } = useBlockchainAsset(selectedTokenId || 0);

  const isAuditor = hasRole(['OWNER', 'MANAGER']);

  const handleViewTx = (txHash: string) => {
    setSelectedTxHash(txHash);
  };

  const handleViewAsset = (tokenId: number) => {
    setSelectedTokenId(tokenId);
  };

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Blockchain Explorer</h1>
            <p className="text-dark-600 dark:text-dark-400">Monitor blockchain status and transactions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 w-24 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
              <div className="h-8 w-32 bg-dark-200 dark:bg-dark-700 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Blockchain Explorer</h1>
          <p className="text-dark-600 dark:text-dark-400">Monitor blockchain status, transactions, and contract state</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchStatus()} size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Network Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Connection Status</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">
                {status?.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {status?.connected ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className={status?.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {status?.connected ? '●' : '●'}
            </span>
            <span className="text-dark-500 dark:text-dark-400">
              {status?.connected ? 'Connected to blockchain' : 'Unable to connect'}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Network</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">{status?.network || 'Unknown'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Blocks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-500 dark:text-dark-400">
            Chain ID: {status?.chain_id || 'N/A'}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Block Height</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">{status?.block_number?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Hash className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-500 dark:text-dark-400">
            Latest block
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Contract</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">
                {status?.contract_verified ? 'Verified' : 'Not Deployed'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
              <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-dark-500 dark:text-dark-400 truncate">
            {status?.contract_address || 'No contract deployed'}
          </div>
        </Card>
      </div>

      {/* Contract Address */}
      {status?.contract_address && (
        <Card className="p-4 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-white">SecureChain Contract</p>
                <p className="font-mono text-sm text-primary-600 dark:text-primary-400">{status.contract_address}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(status.contract_address!)}>
              Copy Address
            </Button>
          </div>
        </Card>
      )}

      {/* Transaction Lookup */}
      <Card className="mb-6">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Transaction Lookup</h3>
          <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
            Look up any transaction by hash to see details and event logs.
          </p>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="0x..."
              value={selectedTxHash || ''}
              onChange={(e) => setSelectedTxHash(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Button onClick={() => selectedTxHash && setSelectedTxHash(selectedTxHash)}>
              Look Up
            </Button>
          </div>
        </div>
      </Card>

      {/* Asset Lookup */}
      <Card className="mb-6">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Asset Lookup</h3>
          <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
            Look up any ERC-721 asset by token ID to see on-chain state.
          </p>
          <div className="flex gap-3 max-w-md">
            <Input
              type="number"
              placeholder="Token ID (e.g., 1)"
              value={selectedTokenId || ''}
              onChange={(e) => setSelectedTokenId(e.target.value ? parseInt(e.target.value) : null)}
            />
            <Button onClick={() => selectedTokenId && setSelectedTokenId(selectedTokenId)}>
              Look Up
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Details Modal */}
      <Modal isOpen={!!selectedTxHash} onClose={() => setSelectedTxHash(null)} title="Transaction Details" size="xl">
        {selectedTxHash && (
          <div className="space-y-4">
            {txLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : txData ? (
              <TxDetailView tx={txData} onClose={() => setSelectedTxHash(null)} />
            ) : (
              <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Transaction not found</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Asset Details Modal */}
      <Modal isOpen={!!selectedTokenId} onClose={() => setSelectedTokenId(null)} title="Asset Details (On-Chain)" size="xl">
        {selectedTokenId && (
          <div className="space-y-4">
            {assetLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : assetData ? (
              <AssetDetailView asset={assetData} onClose={() => setSelectedTokenId(null)} />
            ) : (
              <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Asset not found on blockchain</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function TxDetailView({ tx, onClose }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Transaction Hash</p>
          <p className="font-mono text-sm break-all">{tx.tx_hash}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Status</p>
          <Badge variant={tx.status === 1 ? 'success' : 'danger'}>
            {tx.status === 1 ? 'Success' : 'Failed'}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Block Number</p>
          <p className="font-mono text-lg font-bold text-dark-900 dark:text-white">{tx.block_number?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Block Hash</p>
          <p className="font-mono text-xs break-all">{tx.block_hash}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">From</p>
          <p className="font-mono text-sm">{formatAddress(tx.from_address)}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">To</p>
          <p className="font-mono text-sm">{tx.to_address ? formatAddress(tx.to_address) : 'Contract Creation'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Value</p>
          <p className="font-mono text-sm">{formatNumber(parseInt(tx.value || '0') / 1e18)} ETH</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Gas Used</p>
          <p className="font-mono text-sm">{tx.gas_used?.toLocaleString() || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Gas Price</p>
          <p className="font-mono text-sm">{tx.gas_price ? formatNumber(parseInt(tx.gas_price) / 1e9) + ' Gwei' : 'N/A'}</p>
        </div>
        {tx.contract_address && (
          <div>
            <p className="text-sm text-dark-500 dark:text-dark-400">Contract</p>
            <p className="font-mono text-sm">{tx.contract_address}</p>
          </div>
        )}
        {tx.method_name && (
          <div>
            <p className="text-sm text-dark-500 dark:text-dark-400">Method</p>
            <p className="font-mono text-sm">{tx.method_name}</p>
          </div>
        )}
        {tx.event_data && (
          <div className="col-span-2">
            <p className="text-sm text-dark-500 dark:text-dark-400">Event Data</p>
            <pre className="p-4 rounded-lg bg-dark-100 dark:bg-dark-800 text-xs font-mono overflow-auto max-h-64">
              {tx.event_data}
            </pre>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function AssetDetailView({ asset, onClose }: any) {
  const statusMap: Record<number, string> = {
    0: 'ACTIVE',
    1: 'TRANSFERRED',
    2: 'BURNED',
    3: 'FROZEN',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Token ID</p>
          <p className="font-mono text-2xl font-bold text-dark-900 dark:text-white">{asset.tokenId}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Asset ID</p>
          <p className="font-mono text-sm">{asset.assetId}</p>
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
          <p className="text-sm text-dark-900 dark:text-white">{asset.description}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-dark-500 dark:text-dark-400">Metadata URI</p>
          <p className="font-mono text-xs break-all">{asset.metadataURI}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Creator</p>
          <p className="font-mono text-sm">{formatAddress(asset.creator)}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Current Owner</p>
          <p className="font-mono text-sm">{formatAddress(asset.currentOwner)}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Status</p>
          <Badge variant={['ACTIVE', 'TRANSFERRED', 'BURNED', 'FROZEN'][asset.status] === 'ACTIVE' ? 'success' : 
            ['ACTIVE', 'TRANSFERRED', 'BURNED', 'FROZEN'][asset.status] === 'TRANSFERRED' ? 'primary' :
            ['ACTIVE', 'TRANSFERRED', 'BURNED', 'FROZEN'][asset.status] === 'BURNED' ? 'danger' : 'warning'}>
            {statusMap[asset.status] || 'Unknown'}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Created At</p>
          <p className="font-mono text-sm">{new Date(Number(asset.createdAt) * 1000).toLocaleString()}</p>
        </div>
        {asset.mintTxHash && (
          <div className="col-span-2">
            <p className="text-sm text-dark-500 dark:text-dark-400">Mint Transaction</p>
            <p className="font-mono text-sm text-green-600 dark:text-green-400">{asset.mintTxHash}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}