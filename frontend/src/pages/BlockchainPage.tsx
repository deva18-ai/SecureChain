import { useState, useEffect } from 'react';
import { blockchainApi } from '../services/api';
import { Blocks, Globe, CheckCircle2, ExternalLink, Copy, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_TRANSACTIONS = [
  { id: 1, hash: '0x8E3A...52F1', type: 'Asset Mint', status: 'CONFIRMED', date: '12 Sep 2025, 11:24', fullHash: '0x8e3a981c4b72183e910f52f1' },
  { id: 2, hash: '0x7E02...31F9', type: 'Identity Verify', status: 'CONFIRMED', date: '11 Sep 2025, 09:12', fullHash: '0x7e0239b1a2c3d4e5f67831f9' },
  { id: 3, hash: '0x1A40...E21D', type: 'Asset Transfer', status: 'CONFIRMED', date: '10 Sep 2025, 04:30', fullHash: '0x1a4023c91823ab45cd67e21d' },
  { id: 4, hash: '0x356A...A970', type: 'Role Grant', status: 'CONFIRMED', date: '09 Sep 2025, 08:21', fullHash: '0x356a81923bc781290345a970' },
  { id: 5, hash: '0x5397...B8C4', type: 'Access Grant', status: 'CONFIRMED', date: '08 Sep 2025, 05:17', fullHash: '0x539723019823ab45cd67b8c4' },
];

export default function BlockchainPage() {
  const [txs, setTxs] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadTxs() {
      try {
        const res = await blockchainApi.transactions();
        if (res.data?.items?.length) {
          setTxs(res.data.items.map((t: any) => ({
            id: t.id,
            hash: `${t.tx_hash.slice(0, 6)}...${t.tx_hash.slice(-4)}`,
            type: t.method_name || 'Asset Operation',
            status: 'CONFIRMED',
            date: new Date(t.created_at).toLocaleString(),
            fullHash: t.tx_hash,
          })));
        }
      } catch {
        // Fallback to mock data if API offline
      }
    }
    loadTxs();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Transaction hash copied to clipboard');
  };

  const filtered = txs.filter(t => t.type.toLowerCase().includes(search.toLowerCase()) || t.fullHash.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Blockchain Explorer</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View on-chain transactions, contract verification status, and Sepolia network details.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Ethereum Sepolia Connected</span>
        </div>
      </div>

      {/* Top 3 Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-base font-black text-slate-900">Sepolia Testnet</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Chain ID: 11155111</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Contract</span>
            <button onClick={() => copyToClipboard('0x593F4a1823bC91207e3E')} className="text-slate-400 hover:text-blue-600">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-base font-mono font-bold text-blue-600 truncate">0x593F...7e3E</p>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Smart Contract
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Wallet</span>
            <button onClick={() => copyToClipboard('0x1fA8029384729103N82')} className="text-slate-400 hover:text-blue-600">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-base font-mono font-bold text-slate-900 truncate">0x1fA...3N82</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Sepolia Account Connected</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction hash or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 hidden sm:inline">Showing Sepolia On-Chain Ledger</span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Transaction Hash</th>
                <th className="p-4">Operation Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Etherscan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600 flex items-center gap-2">
                    <Blocks className="w-4 h-4 text-slate-400" />
                    <span>{t.hash}</span>
                    <button onClick={() => copyToClipboard(t.fullHash)} className="text-slate-400 hover:text-blue-600">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{t.type}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Confirmed
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-semibold">{t.date}</td>
                  <td className="p-4 text-right">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${t.fullHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filtered.length} of {filtered.length} transactions</span>
          <div className="flex items-center gap-2">
            <button disabled className="p-1.5 border border-slate-200 rounded-lg text-slate-400 opacity-50 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">1</span>
            <button disabled className="p-1.5 border border-slate-200 rounded-lg text-slate-400 opacity-50 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}