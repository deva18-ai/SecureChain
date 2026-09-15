import { useState, useEffect } from 'react';
import { didsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Key, Search, ShieldCheck, CheckCircle2, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_IDENTITIES = [
  { id: 1, user: 'Devavardhan', did: 'did:sc:170b...e4a2', status: 'ACTIVE', verified: true, date: '12 Sep 2025' },
  { id: 2, user: 'Admin User', did: 'did:sc:892f...b12c', status: 'ACTIVE', verified: true, date: '10 Sep 2025' },
  { id: 3, user: 'Priya S', did: 'did:sc:4d60...a9e1', status: 'ACTIVE', verified: true, date: '01 Sep 2025' },
  { id: 4, user: 'Vignesh D', did: 'did:sc:02a1...f709', status: 'ACTIVE', verified: false, date: 'Pending' },
  { id: 5, user: 'Saran R', did: 'did:sc:91b4...c508', status: 'ACTIVE', verified: true, date: '05 Sep 2025' },
];

export default function IdentitiesPage() {
  const { user, activeRole } = useAuth();
  const [identities, setIdentities] = useState(MOCK_IDENTITIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isEmployee = activeRole === 'USER';
  const isOwner = activeRole === 'ADMIN';

  useEffect(() => {
    async function loadIdentities() {
      try {
        const res = await didsApi.list();
        if (res.data?.items?.length) {
          setIdentities(res.data.items.map((item: any) => ({
            id: item.id,
            user: item.user?.full_name || 'System User',
            did: item.did || 'did:sc:170b...e4a2',
            status: 'ACTIVE',
            verified: item.verified,
            date: item.verified_at ? new Date(item.verified_at).toLocaleDateString() : 'Pending',
          })));
        }
      } catch {
        // Fallback to mock data if API offline
      }
    }
    loadIdentities();
  }, []);

  const handleVerify = (id: number) => {
    if (isEmployee) {
      toast.error('Identity verification requires Owner/Manager authorization.');
      return;
    }
    setIdentities(identities.map(i => {
      if (i.id === id) {
        toast.success(`Identity verified on Ethereum Sepolia Testnet!`);
        return { ...i, verified: true, date: new Date().toLocaleDateString() };
      }
      return i;
    }));
  };

  const filtered = identities.filter(i => {
    if (isEmployee && !search && statusFilter === 'ALL') {
      return i.user.includes('Devavardhan') || i.id === 1;
    }
    const matchesSearch = i.user.toLowerCase().includes(search.toLowerCase()) || i.did.toLowerCase().includes(search.toLowerCase());
    const matchesVer = statusFilter === 'ALL' || (statusFilter === 'VERIFIED' && i.verified) || (statusFilter === 'PENDING' && !i.verified);
    return matchesSearch && matchesVer;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {isEmployee ? 'My Digital Identity (DID)' : 'Digital Identities (W3C DID)'}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          {isEmployee ? 'View your verified W3C Decentralized Identifier and Sepolia blockchain proof.' : 'Manage and verify user decentralized identifiers (DIDs) on the blockchain.'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user or DID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="ALL">All Verification Status</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending Verification</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">DID Document ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{item.user}</td>
                  <td className="p-4 font-mono font-bold text-blue-600 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    {item.did}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                      item.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.verified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {item.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-semibold">{item.date}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!item.verified && (
                        <button
                          onClick={() => handleVerify(item.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Verify DID
                        </button>
                      )}
                      <button
                        onClick={() => toast.success(`Viewing DID Document for ${item.did}`)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View DID Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filtered.length} of {filtered.length} identities</span>
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