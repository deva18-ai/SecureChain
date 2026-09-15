import React, { useState } from 'react';
import { AlertCircle, Blocks, CheckCircle, Hash, RefreshCw, Search, Wallet, XCircle, ChevronDown, Copy, Loader2 as LoaderIcon, Globe, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, StatCard, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useBlockchainAsset, useBlockchainStatus, useBlockchainTransaction, useBlockchainTransactions } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { cn } from '../utils/helpers';

export default function BlockchainPage() {
  const [txHash, setTxHash] = useState('');
  const [selectedTxHash, setSelectedTxHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useBlockchainStatus();
  const { data: txData } = useBlockchainTransaction(selectedTxHash);
  const { data: assetData } = useBlockchainAsset(selectedTokenId || 0);
  const { data: txsData, isLoading: txsLoading } = useBlockchainTransactions({ page: 1, page_size: 20 });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const getNetworkBadge = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'network-mainnet';
      case 11155111: return 'network-sepolia';
      case 31337: return 'network-hardhat';
      default: return 'network-badge';
    }
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 31337: return 'Hardhat Localhost';
      default: return chainId ? `Chain ${chainId}` : 'Not Connected';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Blockchain Explorer</h1>
          <p className="page-sub mt-1">Connection status, network metadata, and verifiable records</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStatus()} leftIcon={<LoaderIcon className="h-4 w-4" />}>Refresh</Button>
      </div>

      {/* Network Status Cards */}
      <div className="data-grid">
        <StatCard
          title="Connection Status"
          value={statusLoading ? '...' : status?.connected ? 'Connected' : 'Disconnected'}
          icon={statusLoading ? <LoaderIcon className="h-6 w-6 animate-spin" /> : status?.connected ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          color={status?.connected ? 'success' : 'danger'}
        />
        <StatCard
          title="Network"
          value={statusLoading ? '...' : getNetworkName(status?.chain_id ?? null)}
          icon={<Globe className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Chain ID"
          value={statusLoading ? '...' : status?.chain_id?.toString() || 'N/A'}
          icon={<Hash className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Block Height"
          value={statusLoading ? '...' : status?.block_number?.toLocaleString() || 'N/A'}
          icon={<Blocks className="h-6 w-6" />}
          color="success"
        />
      </div>

      {/* Network Badge */}
      {status?.chain_id && (
        <div className="flex items-center gap-3">
          <span className={cn(getNetworkBadge(status.chain_id ?? null), 'hidden sm:inline-flex')}>
            <Globe className="h-3.5 w-3.5" />
            {getNetworkName(status.chain_id ?? null)}
          </span>
        </div>
      )}

      {/* Contract Information */}
      <Card variant="hover" padding="lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-primary-blue" />
            Contract Information
          </CardTitle>
          <CardDescription>Smart contract deployment and verification details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {status?.contract_verified ? (
              <StatusBadge status="VERIFIED" />
            ) : (
              <StatusBadge status="PENDING" />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-500 text-xs font-medium mb-2">Contract Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gray-900 break-all flex-1">{status?.contract_address || 'Unavailable'}</p>
                {status?.contract_address && (
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(status.contract_address!, 'Contract Address')} className="p-1" aria-label="Copy contract address">
                    <Copy className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-500 text-xs font-medium mb-2">Network</p>
              <p className="font-mono text-sm text-gray-900">{status?.network || 'Unavailable'}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-500 text-xs font-medium mb-2">Chain ID</p>
              <p className="font-mono text-sm text-gray-900">{status?.chain_id?.toString() || 'Unavailable'}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-gray-500 text-xs font-medium mb-2">Current Block</p>
              <p className="font-mono text-sm text-gray-900">{status?.block_number?.toLocaleString() || 'Unavailable'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction & Asset Lookup */}
      <div className="data-grid-2">
        {/* Transaction Lookup */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary-blue" />
              Transaction Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <Input
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Button onClick={() => setSelectedTxHash(txHash.trim())} disabled={!txHash.trim()} size="md">
                Look Up
              </Button>
            </div>

            {txData && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-gray-500 text-xs font-medium">Transaction Hash</span>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(txData.tx_hash, 'TX Hash')} className="p-1" aria-label="Copy transaction hash">
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </div>
                <p className="font-mono text-sm text-gray-900 break-all px-3">{formatTxHash(txData.tx_hash)}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Block</p>
                    <p className="font-mono text-gray-900">{txData.block_number}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Method</p>
                    <p className="text-gray-900">{txData.method_name || '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">From</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-gray-900">{formatAddress(txData.from_address)}</p>
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(txData.from_address, 'From Address')} className="p-1" aria-label="Copy from address">
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">To</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-gray-900">{txData.to_address ? formatAddress(txData.to_address) : '-'}</p>
                      {txData.to_address && (
                        <Button variant="ghost" size="xs" onClick={() => handleCopy(txData.to_address!, 'To Address')} className="p-1" aria-label="Copy to address">
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-2">Status</p>
                  {txData.status === 1 ? (
                    <StatusBadge status="VERIFIED" />
                  ) : (
                    <StatusBadge status="REJECTED" />
                  )}
                </div>

                {txData.contract_address && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-xs font-medium mb-1">Contract</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-gray-900">{formatAddress(txData.contract_address)}</p>
                      <Button variant="ghost" size="xs" onClick={() => handleCopy(txData.contract_address!, 'Contract Address')} className="p-1" aria-label="Copy contract address">
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                )}

                {txData.event_data && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 sm:col-span-2">
                    <p className="text-gray-500 text-xs font-medium mb-1">Event Data</p>
                    <pre className="font-mono text-xs text-gray-700 bg-gray-100 border border-gray-200 rounded-lg p-3 max-h-32 overflow-auto">{txData.event_data}</pre>
                  </div>
                )}
              </div>
            )}

            {!txData && selectedTxHash && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No transaction found for this hash.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset / Token Lookup */}
        <Card variant="hover" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary-blue" />
              Asset / Token Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <Input
                type="number"
                placeholder="Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
              <Button onClick={() => setSelectedTokenId(Number(tokenId))} disabled={!tokenId} size="md">
                Look Up
              </Button>
            </div>

            {assetData && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 text-xs font-medium">Asset Data</span>
                  <Button variant="ghost" size="xs" onClick={() => handleCopy(JSON.stringify(assetData, null, 2), 'Asset Data')} className="p-1" aria-label="Copy asset data">
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </div>
                <pre className="font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-auto">{JSON.stringify(assetData, null, 2)}</pre>
              </div>
            )}

            {!assetData && selectedTokenId && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No asset found for this token ID.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Records Table */}
      <Card variant="hover" padding="none">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-primary-blue" />
            <h2 className="text-xl font-semibold text-gray-900">Blockchain Records</h2>
          </div>
          <span className="px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-lg text-sm font-medium">
            {txsData?.items?.length || 0} transactions
          </span>
        </div>

        {txsLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : !txsData?.items?.length ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No blockchain records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Block</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {txsData.items.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">{formatTxHash(tx.tx_hash)}</td>
                      <td className="px-4 py-3 text-gray-900">{tx.method_name || '-'}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">{formatAddress(tx.from_address)}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">{tx.block_number}</td>
                      <td className="px-4 py-3">
                        {tx.status === 1 ? (
                          <StatusBadge status="VERIFIED" />
                        ) : (
                          <StatusBadge status="REJECTED" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); handleCopy(tx.tx_hash, 'TX Hash'); }} className="p-1.5" aria-label="Copy transaction hash">
                            <Copy className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', expandedTx === tx.id && 'rotate-180')} />
                        </div>
                      </td>
                    </tr>
                    {expandedTx === tx.id && (
                      <tr>
                        <td colSpan={7} className="p-4 bg-gray-50">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">Full Hash</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900 break-all flex-1">{tx.tx_hash}</p>
                                <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.tx_hash, 'TX Hash')} className="p-1" aria-label="Copy transaction hash">
                                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">From</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900">{formatAddress(tx.from_address)}</p>
                                <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.from_address, 'From Address')} className="p-1" aria-label="Copy from address">
                                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">To</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900">{tx.to_address ? formatAddress(tx.to_address) : '-'}</p>
                                {tx.to_address && <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.to_address!, 'To Address')} className="p-1" aria-label="Copy to address"><Copy className="h-3.5 w-3.5 text-gray-400" /></Button>}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">Contract</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900">{tx.contract_address ? formatAddress(tx.contract_address) : '-'}</p>
                                {tx.contract_address && <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.contract_address!, 'Contract')} className="p-1" aria-label="Copy contract address"><Copy className="h-3.5 w-3.5 text-gray-400" /></Button>}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}