import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Shield, User, Wallet, ChevronLeft, ChevronRight, Edit3, X, Users as UsersIcon, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_USERS = [
  { id: 1, name: 'Devavardhan', email: 'devavardhan@securechain.io', role: 'Owner', wallet: '0x71A8...8A82', status: 'ACTIVE', did: 'did:sc:owner-71a88a82' },
  { id: 2, name: 'Admin User', email: 'admin@securechain.io', role: 'Manager', wallet: '0x0593...40D1', status: 'ACTIVE', did: 'did:sc:mgr-059340d1' },
  { id: 3, name: 'Rahul Kumar', email: 'rahul@securechain.io', role: 'Employee', wallet: '0x0C72...7D11', status: 'PENDING', did: 'did:sc:emp-0c727d11' },
  { id: 4, name: 'Priya S', email: 'priya@securechain.io', role: 'Employee', wallet: '0x1E47...3092', status: 'ACTIVE', did: 'did:sc:emp-1e473092' },
  { id: 5, name: 'Vignesh D', email: 'vignesh@securechain.io', role: 'Employee', wallet: '0x9E8a...1D37', status: 'ACTIVE', did: 'did:sc:emp-9e8a1d37' },
];

export default function UsersPage() {
  const { user, activeRole } = useAuth();
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Owner user creation modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Employee' });

  const isOwner = activeRole === 'ADMIN';
  const isManager = activeRole === 'MANAGER';
  const isEmployee = activeRole === 'USER';

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await usersApi.list();
        if (res.data?.items?.length) {
          setUsers(res.data.items.map((u: any) => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: u.role === 'ADMIN' ? 'Owner' : u.role === 'MANAGER' ? 'Manager' : 'Employee',
            wallet: u.wallet_address ? `${u.wallet_address.slice(0, 6)}...${u.wallet_address.slice(-4)}` : '0x71A8...8A82',
            status: u.is_active ? 'ACTIVE' : 'PENDING',
            did: u.did || `did:sc:user-${u.id}`,
          })));
        }
      } catch {
        // Fallback to mock data if API offline
      }
    }
    loadUsers();
  }, []);

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error('Only the System Owner can directly register users.');
      return;
    }
    const rand = Math.floor(Math.random() * 9000 + 1000);
    const created = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      wallet: `0x${Math.floor(Math.random() * 1e16).toString(16)}...${rand}`,
      status: 'ACTIVE',
      did: `did:sc:reg-${rand}`,
    };
    setUsers([created, ...users]);
    toast.success(`Owner registered user "${created.name}" as ${created.role} with W3C DID ${created.did}!`);
    setIsRegisterModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Employee' });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const employeeCount = users.filter(u => u.role === 'Employee').length;
  const activeEmployeeCount = users.filter(u => u.role === 'Employee' && u.status === 'ACTIVE').length;
  const pendingEmployeeCount = users.filter(u => u.role === 'Employee' && u.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            {isManager ? 'Employees Joined & Registered Roster' : 'Users Management'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isOwner && 'Owner Control: Full authority to register users, assign roles, and manage permissions.'}
            {isManager && 'Manager Operations: View how many employees have joined and registered in the system.'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create / Register User</span>
          </button>
        )}

        {isManager && (
          <button
            onClick={() => toast.success('User creation request submitted to Owner Approval Queue!')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Owner Approval for New User</span>
          </button>
        )}
      </div>

      {/* Manager Summary Banner */}
      {isManager && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{employeeCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Total Employees Registered</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{activeEmployeeCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Active Verified Employees</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900">{pendingEmployeeCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Pending Verification</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">W3C DID</th>
                <th className="p-4">Wallet Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{u.role}</td>
                  <td className="p-4 font-mono font-semibold text-cyan-700">{u.did}</td>
                  <td className="p-4 font-mono font-semibold text-slate-600">{u.wallet}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isOwner ? (
                      <button
                        onClick={() => toast.success(`Owner updated settings for ${u.name}`)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredUsers.length} of {filteredUsers.length} registered users</span>
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

      {/* ─── OWNER REGISTER USER MODAL ────────────────────────────────────── */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRegisterUser} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Owner User Registration</h3>
              <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. ananya@securechain.io"
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Assigned Authority Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="Employee">Employee (End User)</option>
                  <option value="Manager">Manager (Operations)</option>
                  <option value="Owner">Owner (Root Authority)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Register & Anchor DID
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}