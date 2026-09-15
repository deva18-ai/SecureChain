import { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Activity, CheckCircle2, XCircle, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_AUDIT_LOGS = [
  { id: 1, time: '10:52', actor: 'Devavardhan (Owner)', action: 'User Created', target: 'Rohith Kumar', status: 'SUCCESS', txHash: '0x8FA1...902B' },
  { id: 2, time: '10:40', actor: 'Asset Manager (Manager)', action: 'Access Requested', target: 'SC-001 Laptop', status: 'PENDING', txHash: '-' },
  { id: 3, time: '10:32', actor: 'Devavardhan (Owner)', action: 'Asset Created', target: 'SC-002 Server', status: 'SUCCESS', txHash: '0x0F49...11A3' },
  { id: 4, time: '10:21', actor: 'System Auto', action: 'Identity Verified', target: 'Priya S', status: 'SUCCESS', txHash: '0xA419...E912' },
  { id: 5, time: '09:48', actor: 'Employee User (Me)', action: 'Resource Access Requested', target: 'Dell XPS 15 Workstation', status: 'SUCCESS', txHash: '0xD582...4419' },
];

export default function AuditPage() {
  const { user, activeRole } = useAuth();
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('7d');

  const isEmployee = activeRole === 'USER';

  useEffect(() => {
    async function loadAudit() {
      try {
        const res = await auditApi.list();
        if (res.data?.items?.length) {
          setLogs(res.data.items.map((l: any) => ({
            id: l.id,
            time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actor: l.actor?.full_name || l.actor_address?.slice(0, 8) || 'System',
            action: l.action.replace(/_/g, ' '),
            target: l.resource_id || l.resource_type || 'System',
            status: l.blockchain_verified ? 'SUCCESS' : 'PENDING',
            txHash: l.blockchain_tx_hash ? `${l.blockchain_tx_hash.slice(0, 6)}...` : '-',
          })));
        }
      } catch {
        // Fallback to mock data if API offline
      }
    }
    loadAudit();
  }, []);

  const copyToClipboard = (text: string) => {
    if (text === '-') return;
    navigator.clipboard.writeText(text);
    toast.success('Tx hash copied to clipboard');
  };

  const filtered = logs.filter(l => {
    if (isEmployee && !search && actionFilter === 'ALL') {
      return l.actor.includes('Employee User') || l.id === 5;
    }
    const matchesSearch = l.actor.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || l.action.toUpperCase().includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isEmployee ? 'My Activity & Audit Log' : 'Immutable Security Audit Logs'}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          {isEmployee ? 'View your personal activity trail and access request history.' : 'WHO → DID WHAT → TO WHAT → WHEN → RESULT (Anchored to Sepolia Blockchain)'}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit events, actors, or targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Actions</option>
            <option value="USER">User Events</option>
            <option value="ASSET">Asset Events</option>
            <option value="IDENTITY">Identity Events</option>
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="7d">Last 7 days</option>
            <option value="24h">Last 24 hours</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">TX Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-500">{log.time}</td>
                  <td className="p-4 font-bold text-slate-900">{log.actor}</td>
                  <td className="p-4 font-semibold text-blue-600 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    {log.action}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{log.target}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-amber-600" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-slate-500">
                    <div className="inline-flex items-center justify-end gap-1">
                      <span>{log.txHash}</span>
                      {log.txHash !== '-' && (
                        <button onClick={() => copyToClipboard(log.txHash)} className="text-slate-400 hover:text-blue-600">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filtered.length} of {filtered.length} logs</span>
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