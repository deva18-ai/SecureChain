import React, { useState } from 'react';
import { AlertCircle, Blocks, CheckCircle, Hash, RefreshCw, Search, Wallet, XCircle, ChevronDown, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useBlockchainAsset, useBlockchainStatus, useBlockchainTransaction, useBlockchainTransactions } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Explorer</h1>
          <p className="text-gray-600 mt-1">Connection status, network metadata, and verifiable records</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStatus()} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connection Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statusLoading ? '...' : status?.connected ? 'Connected' : 'Disconnected'}</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${status?.connected ? 'bg-green-100' : 'bg-red-100'}`}>
              {statusLoading ? null : status?.connected ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statusLoading ? '...' : status?.network || 'N/A'}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Blocks className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chain ID</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statusLoading ? '...' : status?.chain_id?.toString() || 'N/A'}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Hash className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Block Height</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statusLoading ? '...' : status?.block_number?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Hash className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Contract Information</h2>
          </div>
          {status?.contract_verified ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> VERIFIED
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> UNAVAILABLE
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-500 text-xs font-medium mb-2">Contract Address</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-gray-900 break-all flex-1">{status?.contract_address || 'Unavailable'}</p>
              {status?.contract_address && (
                <Button variant="ghost" size="xs" onClick={() => handleCopy(status.contract_address!, 'Contract Address')} className="p-1">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Transaction Lookup</h2>
          </div>
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
                <Button variant="ghost" size="xs" onClick={() => handleCopy(txData.tx_hash, 'TX Hash')} className="p-1">
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
                  <p className="font-mono text-xs text-gray-900">{formatAddress(txData.from_address)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-gray-500 text-xs font-medium mb-1">To</p>
                  <p className="font-mono text-xs text-gray-900">{txData.to_address ? formatAddress(txData.to_address) : '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500 text-xs font-medium mb-2">Status</p>
                {txData.status === 1 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                    <CheckCircle className="h-3 w-3" /> CONFIRMED
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                    <XCircle className="h-3 w-3" /> FAILED
                  </span>
                )}
              </div>
            </div>
          )}

          {!txData && selectedTxHash && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No transaction found for this hash.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Asset / Token Lookup</h2>
          </div>
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
                <Button variant="ghost" size="xs" onClick={() => handleCopy(JSON.stringify(assetData, null, 2), 'Asset Data')} className="p-1">
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Blockchain Records</h2>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
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
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> CONFIRMED
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" /> FAILED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); handleCopy(tx.tx_hash, 'TX Hash'); }} className="p-1.5">
                            <Copy className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" style={{ transform: expandedTx === tx.id ? 'rotate(180deg)' : 'rotate(0deg)' }} />
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
                                <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.tx_hash, 'TX Hash')} className="p-1">
                                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">From</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900">{formatAddress(tx.from_address)}</p>
                                <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.from_address, 'From Address')} className="p-1">
                                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">To</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900">{tx.to_address ? formatAddress(tx.to_address) : '-'}</p>
                                {tx.to_address && <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.to_address!, 'To Address')} className="p-1"><Copy className="h-3.5 w-3.5 text-gray-400" /></Button>}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white border border-gray-200">
                              <p className="text-gray-500 text-xs font-medium mb-1">Contract</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900">{tx.contract_address ? formatAddress(tx.contract_address) : '-'}</p>
                                {tx.contract_address && <Button variant="ghost" size="xs" onClick={() => handleCopy(tx.contract_address!, 'Contract')} className="p-1"><Copy className="h-3.5 w-3.5 text-gray-400" /></Button>}
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
      </div>
    </div>
  );
}
