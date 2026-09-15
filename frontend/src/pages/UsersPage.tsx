import { useState } from 'react';
import { AlertCircle, UserPlus, Search, Filter, MoreVertical, Loader2 as LoaderIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, RoleBadge, StatusBadge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useUsers, useCreateUser } from '../hooks/useApi';
import { displayRole, formatAddress, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { RegisterRequest, User, UserRole } from '../types';
import { getApiErrorMessage } from '../utils/apiError';
import { cn } from '../utils/helpers';

const STATUS_BADGE_VARIANTS: Record<string, 'success' | 'danger' | 'outline'> = {
  true: 'success',
  false: 'danger',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: usersData, isLoading, refetch } = useUsers({ page, page_size: 20 });
  const createUserMutation = useCreateUser();
  const canManageUsers = hasRole(['ADMIN']);

  const handleCreateUser = async (data: RegisterRequest) => {
    try {
      await createUserMutation.mutateAsync(data);
      toast.success('User registered successfully');
      setShowCreateModal(false);
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to register user'));
    }
  };

  const users = usersData?.items || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.total_pages || 1;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">Manage SecureChain identities, roles, and wallet associations</p>
        </div>
        <div className="page-header-actions flex items-center gap-3">
          <div className="relative hidden sm:block w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          <select
            value={roleFilter || ''}
            onChange={(e) => { setRoleFilter(e.target.value || undefined); setPage(1); }}
            className="hidden sm:block px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-sm appearance-none bg-no-repeat bg-right pr-10"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Owner</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">Employee</option>
            <option value="AUDITOR">Auditor</option>
          </select>
          {canManageUsers && (
            <Button onClick={() => setShowCreateModal(true)} size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
              Register User
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card variant="hover" padding="none">
        {isLoading && !usersData ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-2 focus:ring-primary-blue/20" aria-label="Select all" /></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>DID</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
                        <p className="text-gray-600">No users found.</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                          aria-label={`Select ${user.full_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-blue flex items-center justify-center text-white font-medium text-sm">
                            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-xs text-gray-500 font-mono">ID: {user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-gray-900">{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.is_active ? 'ACTIVE' : 'INACTIVE'} />
                      </TableCell>
                      <TableCell className="font-mono text-gray-600 text-xs max-w-[180px] truncate">{user.did || '-'}</TableCell>
                      <TableCell className="font-mono text-gray-600 text-xs">{user.wallet_address ? formatAddress(user.wallet_address) : '-'}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedUser(user)} aria-label={`View ${user.full_name} details`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} users</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register User" size="lg">
        <UserCreateForm onSubmit={handleCreateUser} onCancel={() => setShowCreateModal(false)} isLoading={createUserMutation.isPending} />
      </Modal>

      {/* User Detail Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && <UserDetailView user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </Modal>
    </div>
  );
}

function UserCreateForm({ onSubmit, onCancel, isLoading }: { onSubmit: (data: RegisterRequest) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'USER' as UserRole });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-5">
      <p className="text-gray-600 text-sm">Register a new SecureChain identity. Owner privilege is required.</p>
      <Input label="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. Ananya Rao" required />
      <Input type="email" label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@securechain.local" required />
      <Input type="password" label="Temporary Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set a temporary password" required />
      <div className="space-y-2">
        <label className="label">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          required
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
        >
          <option value="USER">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="AUDITOR">Auditor</option>
        </select>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Register User</Button>
      </div>
    </form>
  );
}

function UserDetailView({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
        <div className="w-14 h-14 rounded-full bg-primary-blue flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <div className="font-heading font-semibold text-lg text-gray-900">{user.full_name}</div>
          <RoleBadge role={user.role} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Email</span>
          <span className="font-mono text-gray-900">{user.email}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Status</span>
          <StatusBadge status={user.is_active ? 'ACTIVE' : 'INACTIVE'} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">DID</span>
          <span className="font-mono text-gray-900 truncate max-w-[200px]">{user.did || '-'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Wallet</span>
          <span className="font-mono text-gray-900">{user.wallet_address ? formatAddress(user.wallet_address) : '-'}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Created</span>
          <span className="text-gray-900">{formatDate(user.created_at)}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <span className="text-gray-600">Last Login</span>
          <span className="text-gray-900">{user.last_login ? formatDate(user.last_login) : 'Never'}</span>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}