import { useState } from 'react';
import { AlertCircle, Blocks, CheckCircle, Hash, RefreshCw, Search, Wallet, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { useBlockchainAsset, useBlockchainStatus, useBlockchainTransaction, useBlockchainTransactions } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';

export default function BlockchainPage() {
  const [txHash, setTxHash] = useState('');
  const [selectedTxHash, setSelectedTxHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useBlockchainStatus();
  const { data: txData } = useBlockchainTransaction(selectedTxHash);
  const { data: assetData } = useBlockchainAsset(selectedTokenId || 0);
  const { data: txsData, isLoading: txsLoading } = useBlockchainTransactions({ page: 1, page_size: 20 });

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Blockchain Explorer</div>
          <div className="page-sub">Connection status, network metadata, and verifiable records</div>
        </div>
        <Button variant="outline" onClick={() => refetchStatus()} size="sm"><RefreshCw className="h-4 w-4" />Refresh</Button>
      </div>

      <div className="grid grid-4">
        {statusLoading ? [...Array(4)].map((_, i) => <Card key={i} className="stat-card"><div className="h-16 bg-[#191e29] rounded animate-pulse" /></Card>) : (
          <>
            <StatusCard label="Connection Status" value={status?.connected ? 'Connected' : 'Disconnected'} icon={status?.connected ? CheckCircle : XCircle} ok={!!status?.connected} />
            <StatusCard label="Network" value={status?.network || 'Unavailable'} icon={Blocks} />
            <StatusCard label="Chain ID" value={status?.chain_id?.toString() || 'Unavailable'} icon={Hash} />
            <StatusCard label="Block Height" value={status?.block_number?.toLocaleString() || 'Unavailable'} icon={Hash} />
          </>
        )}
      </div>

      <Card className="glow">
        <div className="kv"><span>Contract</span><span className="mono">{status?.contract_address || 'Unavailable'}</span></div>
        <div className="kv"><span>Contract Status</span><Badge variant={status?.contract_verified ? 'success' : 'warning'}>{status?.contract_verified ? 'VERIFIED' : 'UNAVAILABLE'}</Badge></div>
      </Card>

      <div className="grid grid-2">
        <Card>
          <div className="section-title" style={{ marginTop: 0 }}>Transaction Lookup</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input placeholder="0x..." value={txHash} onChange={(e) => setTxHash(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
            <Button onClick={() => setSelectedTxHash(txHash.trim())} disabled={!txHash.trim()}>Look Up</Button>
          </div>
          {txData && (
            <div style={{ marginTop: 14 }}>
              <div className="kv"><span>Hash</span><span className="mono">{formatTxHash(txData.tx_hash)}</span></div>
              <div className="kv"><span>Block</span><span>{txData.block_number}</span></div>
              <div className="kv"><span>Method</span><span>{txData.method_name || '-'}</span></div>
              <div className="kv"><span>Status</span><Badge variant={txData.status === 1 ? 'success' : 'danger'}>{txData.status === 1 ? 'CONFIRMED' : 'FAILED'}</Badge></div>
            </div>
          )}
        </Card>

        <Card>
          <div className="section-title" style={{ marginTop: 0 }}>Asset Lookup</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input type="number" placeholder="Token ID" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
            <Button onClick={() => setSelectedTokenId(Number(tokenId))} disabled={!tokenId}>Look Up</Button>
          </div>
          {assetData && <pre className="mono" style={{ marginTop: 14, whiteSpace: 'pre-wrap', color: '#8991a3' }}>{JSON.stringify(assetData, null, 2)}</pre>}
        </Card>
      </div>

      <Card>
        <div className="section-title" style={{ marginTop: 0 }}>Blockchain Records</div>
        {txsLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[#191e29] rounded animate-pulse" />)}</div>
        ) : !txsData?.items?.length ? (
          <div style={{ textAlign: 'center', color: '#8991a3', padding: 30 }}><AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />No blockchain records found.</div>
        ) : (
          <div className="table-wrap">
            <Table>
              <thead><tr><th>Transaction</th><th>Method</th><th>From</th><th>To</th><th>Block</th><th>Contract</th><th>Status</th><th>Timestamp</th></tr></thead>
              <tbody>{txsData.items.map((tx) => <tr key={tx.id} className="row-hover"><td className="mono">{formatTxHash(tx.tx_hash)}</td><td>{tx.method_name || '-'}</td><td className="mono">{formatAddress(tx.from_address)}</td><td className="mono">{tx.to_address ? formatAddress(tx.to_address) : '-'}</td><td>{tx.block_number}</td><td className="mono">{tx.contract_address ? formatAddress(tx.contract_address) : '-'}</td><td><Badge variant={tx.status === 1 ? 'success' : 'danger'}>{tx.status === 1 ? 'CONFIRMED' : 'FAILED'}</Badge></td><td>{formatDate(tx.created_at)}</td></tr>)}</tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, ok }: { label: string; value: string; icon: typeof Wallet; ok?: boolean }) {
  return (
    <Card className="stat-card glow">
      <div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon"><Icon className="h-5 w-5" style={{ color: ok === false ? '#dd5b64' : ok === true ? '#2fa872' : '#8991a3' }} /></span></div>
      <div className="stat-value" style={{ fontSize: 22 }}>{value}</div>
      <div className="stat-foot">Real blockchain API data</div>
    </Card>
  );
}
