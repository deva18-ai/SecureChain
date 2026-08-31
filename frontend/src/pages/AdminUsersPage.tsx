import { useState } from 'react';
import { Search, Eye, Loader2, AlertCircle, UserPlus, UserCog, Trash2, MoreVertical } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useUsers } from '../hooks/useApi';
import { formatAddress, formatDate, getRoleColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminUsersPage() {
  const { user, hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: usersData, isLoading, error, refetch } = useUsers({
    page,
    page_size: 20,
    role: roleFilter as any,
    is_active: activeFilter,
    search: search || undefined,
  });

  const handleViewUser = (u: any) => {
    setSelectedUser(u);
  };

  const handleEditUser = (u: any) => {
    setEditingUser({ ...u });
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      // Delete would be implemented with a delete mutation
      toast('Delete functionality coming soon');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (isLoading && !usersData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">User Management</h1>
            <p className="text-dark-600 dark:text-dark-400">Manage platform users and roles</p>
          </div>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-100 dark:bg-dark-800 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const users = usersData?.items || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.total_pages || 1;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">User Management</h1>
          <p className="text-dark-600 dark:text-dark-400">Manage platform users and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => { setEditingUser(null); setShowCreateModal(true); }} size="sm">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-dark-600 dark:text-dark-400">Role:</label>
            <select
              value={roleFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setRoleFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="AUDITOR">Auditor</option>
              <option value="USER">User</option>
            </select>
            <label className="text-sm text-dark-600 dark:text-dark-400">Status:</label>
            <select
              value={activeFilter === true ? 'active' : activeFilter === false ? 'inactive' : 'all'}
              onChange={(e) => { const val = e.target.value; setActiveFilter(val === 'active' ? true : val === 'inactive' ? false : undefined); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Wallet</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-dark-500 dark:text-dark-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-sm">#{u.id}</td>
                    <td className="font-medium text-dark-900 dark:text-white">{u.full_name}</td>
                    <td className="text-sm text-dark-600 dark:text-dark-400">{u.email}</td>
                    <td className="font-mono text-sm">{u.wallet_address ? formatAddress(u.wallet_address) : '-'}</td>
                    <td>
                      <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                    </td>
                    <td>
                      <Badge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-sm text-dark-600 dark:text-dark-400">{formatDate(u.created_at)}</td>
                    <td className="text-sm text-dark-600 dark:text-dark-400">{u.last_login ? formatDate(u.last_login) : 'Never'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(u)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
                          <UserCog className="h-4 w-4" />
                        </Button>
                        {u.id !== user?.id && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showCreateModal || !!editingUser} onClose={() => { setShowCreateModal(false); setEditingUser(null); }} title={editingUser ? 'Edit User' : 'Create User'} size="lg">
        {editingUser ? (
          <UserEditForm user={editingUser} onClose={() => { setEditingUser(null); setShowCreateModal(false); }} />
        ) : (
          <UserCreateForm onClose={() => setShowCreateModal(false)} />
        )}
      </Modal>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && (
          <UserDetailView user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </Modal>
    </div>
  );
}

function UserCreateForm({ onClose }: any) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    wallet_address: '',
    role: 'USER',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // In a real app, this would call the API
      toast('Create functionality coming soon');
      onClose();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="user@company.com"
        required
      />
      <Input
        label="Full Name"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        placeholder="John Doe"
        required
      />
      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="At least 8 characters"
        required
      />
      <Input
        label="Wallet Address (Optional)"
        value={formData.wallet_address}
        onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
        placeholder="0x1234...abcd"
      />
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
          <option value="AUDITOR">Auditor</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Create User</Button>
      </div>
    </form>
  );
}

function UserEditForm({ user, onClose }: any) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    wallet_address: user.wallet_address || '',
    is_active: user.is_active,
    is_verified: user.is_verified,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      toast('Update functionality coming soon');
      onClose();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        required
      />
      <Input
        label="Wallet Address"
        value={formData.wallet_address}
        onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
        placeholder="0x1234...abcd"
      />
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_verified}
            onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
            className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-dark-700 dark:text-dark-300">Verified</span>
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Save Changes</Button>
      </div>
    </form>
  );
}

function UserDetailView({ user, onClose }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-medium text-xl">{user.full_name?.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-xl font-bold text-dark-900 dark:text-white">{user.full_name}</p>
          <p className="text-dark-600 dark:text-dark-400">{user.email}</p>
        </div>
        <Badge className={getRoleColor(user.role)} ml-auto>{user.role}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">User ID</p>
          <p className="font-mono text-lg font-bold text-dark-900 dark:text-white">#{user.id}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Status</p>
          <Badge variant={user.is_active ? 'success' : 'danger'}>
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Verified</p>
          <Badge variant={user.is_verified ? 'success' : 'warning'}>
            {user.is_verified ? 'Yes' : 'No'}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Wallet</p>
          <p className="font-mono text-sm">{user.wallet_address ? formatAddress(user.wallet_address) : 'Not set'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Created</p>
          <p className="text-sm text-dark-900 dark:text-white">{formatDate(user.created_at)}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Last Login</p>
          <p className="text-sm text-dark-900 dark:text-white">{user.last_login ? formatDate(user.last_login) : 'Never'}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">DIDs</p>
          <p className="text-sm text-dark-900 dark:text-white">{user.dids_count || 0}</p>
        </div>
        <div>
          <p className="text-sm text-dark-500 dark:text-dark-400">Assets</p>
          <p className="text-sm text-dark-900 dark:text-white">{user.assets_count || 0}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}