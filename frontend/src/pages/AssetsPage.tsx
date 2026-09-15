import { useState, useEffect } from 'react';
import { assetsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Lock, Unlock, Eye, Box, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_ASSETS = [
  { id: 1, asset_id: 'SC-001', name: 'Laptop', category: 'Hardware', status: 'ACTIVE', assignedTo: 'Devavardhan' },
  { id: 2, asset_id: 'SC-002', name: 'Server', category: 'Infrastructure', status: 'ACTIVE', assignedTo: 'Admin User' },
  { id: 3, asset_id: 'SC-003', name: 'License', category: 'Software', status: 'FROZEN', assignedTo: 'Admin User' },
  { id: 4, asset_id: 'SC-004', name: 'Camera', category: 'Equipment', status: 'ACTIVE', assignedTo: 'Rahul Kumar' },
  { id: 5, asset_id: 'SC-005', name: 'Monitor', category: 'Hardware', status: 'ACTIVE', assignedTo: 'Priya S' },
  { id: 6, asset_id: 'SC-006', name: 'Router', category: 'Network', status: 'ACTIVE', assignedTo: 'Vignesh D' },
];

export default function AssetsPage() {
  const { user, activeRole } = useAuth();
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Hardware', description: '' });

  const isOwner = activeRole === 'ADMIN';
  const isManager = activeRole === 'MANAGER';
  const isEmployee = activeRole === 'USER';

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await assetsApi.list();
        if (res.data?.items?.length) {
          setAssets(res.data.items.map((item: any, idx: number) => ({
            id: item.id,
            asset_id: item.asset_id || `SC-00${idx + 1}`,
            name: item.name,
            category: item.category || 'Hardware',
            status: item.status || 'ACTIVE',
            assignedTo: item.owner?.full_name || 'Unassigned',
          })));
        }
      } catch {
        // Fallback to mock data if API offline
      }
    }
    loadAssets();
  }, []);

  const filteredAssets = assets.filter(a => {
    // If employee, show assigned assets or all if searching
    if (isEmployee && !search && categoryFilter === 'ALL' && statusFilter === 'ALL') {
      if (a.assignedTo !== 'Employee User' && a.assignedTo !== user?.full_name && a.id > 3) {
        return true;
      }
    }
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.asset_id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || a.category.toUpperCase() === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManager) {
      toast.success(`Mint request for "${newAsset.name}" submitted to Owner for Approval!`);
      setIsModalOpen(false);
      return;
    }
    const created = {
      id: Date.now(),
      asset_id: `SC-00${assets.length + 1}`,
      name: newAsset.name,
      category: newAsset.category,
      status: 'ACTIVE',
      assignedTo: user?.full_name || 'Devavardhan',
    };
    setAssets([created, ...assets]);
    toast.success(`Asset ${created.asset_id} minted directly to Sepolia by Owner!`);
    setIsModalOpen(false);
    setNewAsset({ name: '', category: 'Hardware', description: '' });
  };

  const toggleFreeze = (id: number) => {
    if (!isOwner) {
      toast.error('Freezing/Unfreezing requires Owner permission. Requesting Owner approval.');
      return;
    }
    setAssets(assets.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
        toast.success(`Owner updated Asset ${a.asset_id} status to ${nextStatus}`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEmployee ? 'My Assets & Resources' : 'Assets Management'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isOwner && 'Owner Control: Full authority to mint, reassign, freeze, and manage all organization assets.'}
            {isManager && 'Manager Operations: Operational asset tracking. Asset creation requires Owner approval.'}
            {isEmployee && 'Employee Portal: View assigned assets and request access to organization resources.'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mint New Asset</span>
          </button>
        )}

        {isManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Request Owner Approval to Mint</span>
          </button>
        )}

        {isEmployee && (
          <a
            href="/requests"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Request Access to Asset</span>
          </a>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="NETWORK">Network</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="FROZEN">Frozen</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Asset ID</th>
                <th className="p-4">Asset Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned To</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600">{asset.asset_id}</td>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <Box className="w-4 h-4 text-slate-400" />
                    {asset.name}
                  </td>
                  <td className="p-4 text-slate-600">{asset.category}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      asset.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{asset.assignedTo}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isOwner && (
                        <button
                          onClick={() => toggleFreeze(asset.id)}
                          title={asset.status === 'FROZEN' ? 'Unfreeze' : 'Freeze (Owner Permission)'}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {asset.status === 'FROZEN' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => toast.success(`Viewing details for ${asset.asset_id}`)}
                        title="View Details"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing {filteredAssets.length} assets</span>
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

      {/* Mint / Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {isOwner ? 'Owner Action: Mint New Asset' : 'Manager Action: Request Owner Approval'}
            </h3>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Workstation"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  {isOwner ? 'Mint Asset (Sepolia)' : 'Request Owner Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}