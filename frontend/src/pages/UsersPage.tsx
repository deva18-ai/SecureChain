import { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useUsers, useCreateUser } from '../hooks/useApi';
import { formatAddress, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { RegisterRequest, User, UserRole } from '../types';
import { getApiErrorMessage } from '../utils/apiError';

const ROLE_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  ADMIN: 'primary',
  MANAGER: 'info',
  USER: 'success',
  AUDITOR: 'violet',
};

const ROLE_DISPLAY_LABELS: Record<string, string> = {
  ADMIN: 'OWNER',
  MANAGER: 'MANAGER',
  USER: 'EMPLOYEE',
  AUDITOR: 'AUDITOR',
};

const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: 'active',
  INACTIVE: 'critical',
  SUSPENDED: 'warning',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search] = useState('');
  const [roleFilter] = useState<UserRole | undefined>(undefined);
  const [statusFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: usersData, isLoading, refetch } = useUsers({
    page,
    page_size: 20,
    role: roleFilter,
    is_active: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
    search: search || undefined,
  });
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

  const handleViewUser = (u: User) => {
    setSelectedUser(u);
  };

  if (isLoading && !usersData) {
    return (
      <div className="space-y-6" style={{ color: '#e6e9ef' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'spaceBetween', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Users</div>
            <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>All identities registered in SecureChain</div>
          </div>
          {canManageUsers && (
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <UserPlus className="h-4 w-4" />
              Register Employee
            </Button>
          )}
        </div>
        <Card className="p-6" style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
          <div className="h-4 w-48 bg-[#191e29] rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#191e29] rounded animate-pulse" />
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
    <div className="space-y-6 animate-in" style={{ color: '#e6e9ef' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flexStart', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Users</div>
          <div className="page-sub" style={{ color: '#8991a3', fontSize: 13, marginTop: 4 }}>All identities registered in SecureChain</div>
        </div>
        {canManageUsers && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <UserPlus className="h-4 w-4" />
            Register Employee
          </Button>
        )}
      </div>

      <Card style={{ background: '#141821', border: '1px solid #262b37', borderRadius: 8 }}>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid #262b37' }}>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>ID</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Role</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}>DID</th>
                <th style={{ textAlign: 'left', color: '#8991a3', fontSize: 11, letterSpacing: '.03em', padding: '10px 12px', fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: '#8991a3' }}>
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="row-hover" style={{ transition: 'background .15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#191e29'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{u.id}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>{u.full_name}</td>
                    <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{u.email}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Badge variant={ROLE_BADGE_VARIANTS[u.role] || 'info'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                        {ROLE_DISPLAY_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Badge variant={STATUS_BADGE_VARIANTS[u.is_active ? 'ACTIVE' : 'INACTIVE'] || 'active'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
                        {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="mono" style={{ padding: '12px', borderBottom: '1px solid #262b37', fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{u.did || '—'}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #262b37' }}>
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(u)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: '#262b37', display: 'flex', alignItems: 'center', justifyContent: 'spaceBetween' }}>
            <p className="text-sm" style={{ color: '#8991a3' }}>
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Register New User" size="lg">
        <UserCreateForm onSubmit={handleCreateUser} onCancel={() => setShowCreateModal(false)} isLoading={createUserMutation.isPending} />
      </Modal>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && (
          <UserDetailView user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </Modal>
    </div>
  );
}

function UserCreateForm({ onSubmit, onCancel, isLoading }: { onSubmit: (data: RegisterRequest) => void | Promise<void>; onCancel: () => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: 'changeme123',
    role: 'USER' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ color: '#e6e9ef' }}>
      <p className="modal-sub" style={{ color: '#8991a3', fontSize: '12.5px', marginBottom: 18 }}>Directly onboard a new identity into SecureChain — Owner privilege, no approval required.</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Full Name</label>
        <Input
          id="ru_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="e.g. Ananya Rao"
          required
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Email</label>
        <Input
          id="ru_email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="name@securechain.demo"
          required
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Temporary Password</label>
        <Input
          id="ru_password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="changeme123"
        />
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#8991a3', marginBottom: 6 }}>Role</label>
        <select
          id="ru_role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #262b37', background: '#10131a', color: '#e6e9ef', fontSize: '13.5px', fontFamily: 'inherit' }}
        >
          <option value="USER">Employee</option>
          <option value="MANAGER">Manager</option>
        </select>
      </div>
      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18 }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>Register User</Button>
      </div>
    </form>
  );
}

function UserDetailView({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="space-y-4" style={{ color: '#e6e9ef' }}>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>User ID</span>
        <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{user.id}</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Email</span>
        <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{user.email}</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Role</span>
        <Badge variant={ROLE_BADGE_VARIANTS[user.role] || 'info'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>
          {ROLE_DISPLAY_LABELS[user.role] || user.role}
        </Badge>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Status</span>
        <Badge variant={STATUS_BADGE_VARIANTS[user.is_active ? 'ACTIVE' : 'INACTIVE'] || 'active'} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, letterSpacing: '.02em', display: 'inlineFlex', alignItems: 'center', gap: 6 }}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</Badge>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>DID</span>
        <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{user.did || '—'}</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', borderBottom: '1px solid #262b37', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Wallet</span>
        <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#8991a3' }}>{user.wallet_address ? formatAddress(user.wallet_address) : '—'}</span>
      </div>
      <div className="kv" style={{ display: 'flex', justifyContent: 'spaceBetween', padding: '8px 0', fontSize: 13 }}>
        <span style={{ color: '#8991a3' }}>Created</span>
        <span>{formatDate(user.created_at)}</span>
      </div>
      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flexEnd', gap: 10, marginTop: 18 }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
