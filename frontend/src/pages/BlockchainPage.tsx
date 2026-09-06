import { useState } from 'react';
import { Search, RefreshCw, Blocks, Hash, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { useBlockchainStatus, useBlockchainTransaction, useBlockchainAsset } from '../hooks/useApi';
import { formatDate } from '../utils/helpers';

export default function BlockchainPage() {
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useBlockchainStatus();
  const { data: _txData } = useBlockchainTransaction(selectedTxHash || '');
  const { data: _assetData } = useBlockchainAsset(selectedTokenId || 0);

  void _txData;
  void _assetData;

  if (statusLoading) {
    return (
      <div className="space-y-6" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Blockchain Explorer</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>Loading blockchain status...</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
              <div className="h-4 w-24 bg-[#191e29] rounded mb-4 animate-pulse" />
              <div className="h-8 w-32 bg-[#191e29] rounded animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Blockchain Explorer</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>
            Network: {status?.network || 'Not Connected'} · Chain ID: {status?.chain_id || 'N/A'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" onClick={() => refetchStatus()} size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#8991a3' }}>Connection Status</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#e6e9ef', marginTop: 4 }}>{status?.connected ? 'Connected' : 'Disconnected'}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.connected ? 'bg-[#2fa872]/20' : 'bg-[#dd5b64]/20'}`}>
              {status?.connected ? (
                <CheckCircle className="h-6 w-6" style={{ color: '#2fa872' }} />
              ) : (
                <XCircle className="h-6 w-6" style={{ color: '#dd5b64' }} />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 12 }}>
            <span style={{ color: status?.connected ? '#2fa872' : '#dd5b64' }}>●</span>
            <span style={{ color: '#8991a3' }}>{status?.connected ? 'Connected to blockchain' : 'Unable to connect'}</span>
          </div>
        </Card>

        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#8991a3' }}>Network</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#e6e9ef', marginTop: 4 }}>{status?.network || 'Unknown'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#3d6fe0]/20 flex items-center justify-center">
              <Blocks className="h-6 w-6" style={{ color: '#3d6fe0' }} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#8991a3', marginTop: 16 }}>Chain ID: {status?.chain_id || 'N/A'}</div>
        </Card>

        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#8991a3' }}>Block Height</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#e6e9ef', marginTop: 4 }}>{status?.block_number?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#7d72d6]/20 flex items-center justify-center">
              <Hash className="h-6 w-6" style={{ color: '#7d72d6' }} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#8991a3', marginTop: 16 }}>Latest block</div>
        </Card>

        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'spaceBetween' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#8991a3' }}>Contract</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#e6e9ef', marginTop: 4 }}>{status?.contract_verified ? 'Verified' : 'Not Deployed'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#a855f7]/20 flex items-center justify-center">
              <Wallet className="h-6 w-6" style={{ color: '#a855f7' }} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#8991a3', marginTop: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{status?.contract_address || 'No contract deployed'}</div>
        </Card>
      </div>

      {status?.contract_address && (
        <Card className="p-4" style={{ background: 'rgba(61,111,224,0.05)', border: '1px solid rgba(61,111,224,0.2)', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="w-10 h-10 rounded-lg bg-[#3d6fe0]/20 flex items-center justify-center">
                <Wallet className="h-5 w-5" style={{ color: '#3d6fe0' }} />
              </div>
              <div>
                <p className="font-medium" style={{ color: '#e6e9ef' }}>SecureChain Contract</p>
                <p className="font-mono text-sm" style={{ color: '#3d6fe0' }}>{status.contract_address}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(status.contract_address!)}>Copy Address</Button>
          </div>
        </Card>
      )}

      <Card className="mb-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <div className="p-4 border-b" style={{ borderColor: '#262b37' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef', marginBottom: 4 }}>Transaction Lookup</h3>
          <p style={{ fontSize: 12, color: '#8991a3', marginBottom: 12 }}>Look up any transaction by hash to see details and event logs.</p>
          <div style={{ display: 'flex', gap: 8, maxWidth: 400 }}>
            <Input
              placeholder="0x..."
              value={selectedTxHash || ''}
              onChange={(e) => setSelectedTxHash(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              style={{ flex: 1 }}
            />
            <Button onClick={() => selectedTxHash && setSelectedTxHash(selectedTxHash)}>Look Up</Button>
          </div>
        </div>
      </Card>

      <Card className="mb-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <div className="p-4 border-b" style={{ borderColor: '#262b37' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef', marginBottom: 4 }}>Asset Lookup</h3>
          <p style={{ fontSize: 12, color: '#8991a3', marginBottom: 12 }}>Look up any ERC-721 asset by token ID to see on-chain state.</p>
          <div style={{ display: 'flex', gap: 8, maxWidth: 400 }}>
            <Input
              type="number"
              placeholder="Token ID (e.g., 1)"
              value={selectedTokenId || ''}
              onChange={(e) => setSelectedTokenId(e.target.value ? parseInt(e.target.value) : null)}
              style={{ flex: 1 }}
            />
            <Button onClick={() => selectedTokenId && setSelectedTokenId(selectedTokenId)}>Look Up</Button>
          </div>
        </div>
      </Card>

      <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8, overflow: 'hidden' }}>
        <div className="p-4 border-b" style={{ borderColor: '#262b37' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e6e9ef' }}>Blockchain Records</h3>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid #262b37' }}>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>TX ID</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Operation</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Asset</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Actor</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Block</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Network</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock data for demo - in real app this would come from blockchain API */}
              <tr className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>TX-SC-001</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>Asset Registration</td>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>SC-LAP-001</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>System</td>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>#185421</td>
                <td><Badge variant="violet" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(125,114,214,0.12)', color: '#b3aae4', border: '1px solid rgba(125,114,214,0.32)' }}>{status?.network || 'N/A'}</Badge></td>
                <td><Badge variant="approved" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(47,168,114,0.1)', color: '#2fa872', border: '1px solid rgba(47,168,114,0.3)' }}>CONFIRMED</Badge></td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>{new Date(Date.now() - 1000*60*60*40).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
              <tr className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>TX-SC-004</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>Asset Registration</td>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>SC-LAP-002</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>System</td>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>#185422</td>
                <td><Badge variant="violet" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(125,114,214,0.12)', color: '#b3aae4', border: '1px solid rgba(125,114,214,0.32)' }}>{status?.network || 'N/A'}</Badge></td>
                <td><Badge variant="approved" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(47,168,114,0.1)', color: '#2fa872', border: '1px solid rgba(47,168,114,0.3)' }}>CONFIRMED</Badge></td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>{new Date(Date.now() - 1000*60*60*38).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
              <tr className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>TX-SC-005</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>Asset Registration</td>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>SC-SRV-001</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>System</td>
                <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>#185423</td>
                <td><Badge variant="violet" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(125,114,214,0.12)', color: '#b3aae4', border: '1px solid rgba(125,114,214,0.32)' }}>{status?.network || 'N/A'}</Badge></td>
                <td><Badge variant="approved" style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(47,168,114,0.1)', color: '#2fa872', border: '1px solid rgba(47,168,114,0.3)' }}>CONFIRMED</Badge></td>
                <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>{new Date(Date.now() - 1000*60*60*36).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
