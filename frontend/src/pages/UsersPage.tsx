import { useState } from 'react';
import { AlertCircle, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useUsers, useCreateUser } from '../hooks/useApi';
import { displayRole, formatAddress, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { RegisterRequest, User, UserRole } from '../types';
import { getApiErrorMessage } from '../utils/apiError';

const ROLE_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  ADMIN: 'violet',
  MANAGER: 'info',
  USER: 'success',
  AUDITOR: 'primary',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
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

  return (
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Users</div>
          <div className="page-sub">Registered identities and wallet associations</div>
        </div>
        {canManageUsers && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <UserPlus className="h-4 w-4" />
            Register User
          </Button>
        )}
      </div>

      <Card>
        {isLoading && !usersData ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-[#191e29] rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="table-wrap">
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>DID</th>
                  <th>Wallet</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12" style={{ color: '#8991a3' }}>
                      <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      No users found.
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="row-hover">
                    <td>{user.full_name}</td>
                    <td className="mono">{user.email}</td>
                    <td><Badge variant={ROLE_BADGE_VARIANTS[user.role] || 'info'}>{displayRole(user.role)}</Badge></td>
                    <td><Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
                    <td className="mono">{user.did || '-'}</td>
                    <td className="mono">{user.wallet_address ? formatAddress(user.wallet_address) : '-'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td><Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: '#262b37', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="text-sm" style={{ color: '#8991a3' }}>Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} users</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register User" size="lg">
        <UserCreateForm onSubmit={handleCreateUser} onCancel={() => setShowCreateModal(false)} isLoading={createUserMutation.isPending} />
      </Modal>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && <UserDetailView user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </Modal>
    </div>
  );
}

function UserCreateForm({ onSubmit, onCancel, isLoading }: { onSubmit: (data: RegisterRequest) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'USER' as UserRole });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4" style={{ color: '#e6e9ef' }}>
      <p className="modal-sub">Register a new SecureChain identity. Owner privilege is required.</p>
      <div className="field"><label>Full Name</label><Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. Ananya Rao" required /></div>
      <div className="field"><label>Email</label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@securechain.local" required /></div>
      <div className="field"><label>Temporary Password</label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set a temporary password" required /></div>
      <div className="field">
        <label>Role</label>
        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} required>
          <option value="USER">Employee</option>
          <option value="MANAGER">Manager</option>
        </select>
      </div>
      <div className="modal-actions">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Register User</Button>
      </div>
    </form>
  );
}

function UserDetailView({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="space-y-4" style={{ color: '#e6e9ef' }}>
      <div className="kv"><span>Name</span><span>{user.full_name}</span></div>
      <div className="kv"><span>Email</span><span className="mono">{user.email}</span></div>
      <div className="kv"><span>Role</span><Badge variant={ROLE_BADGE_VARIANTS[user.role] || 'info'}>{displayRole(user.role)}</Badge></div>
      <div className="kv"><span>Status</span><Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</Badge></div>
      <div className="kv"><span>DID</span><span className="mono">{user.did || '-'}</span></div>
      <div className="kv"><span>Wallet</span><span className="mono">{user.wallet_address ? formatAddress(user.wallet_address) : '-'}</span></div>
      <div className="kv"><span>Created</span><span>{formatDate(user.created_at)}</span></div>
      <div className="modal-actions"><Button variant="outline" onClick={onClose}>Close</Button></div>
    </div>
  );
}
