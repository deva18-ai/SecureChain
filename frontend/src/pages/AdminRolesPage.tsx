import { useState } from 'react';
import { Shield, Users, Eye, Loader2, AlertCircle, Plus, Key, Search, CheckCircle, FileText, Blocks, Wallet, BarChart3 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useUsers } from '../hooks/useApi';
import { formatAddress, formatDate, getRoleColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [
    'Full system access', 'User management', 'Role assignment', 'Identity creation',
    'Identity verification', 'Asset minting', 'Asset allocation', 'Asset transfer',
    'Asset burning', 'Asset freezing', 'Transfer approval', 'Audit log access',
    'Blockchain verification', 'System configuration', 'All permissions'
  ],
  MANAGER: [
    'User read access', 'DID read access', 'Asset read access', 'Asset allocation',
    'Asset transfer', 'Transfer creation', 'Transfer read access', 'Transfer approval',
    'Audit log read access', 'Blockchain read access'
  ],
  EMPLOYEE: [
    'Own profile read', 'Own DID read', 'Own asset read', 'Transfer creation',
    'Own transfer read', 'Own activity view'
  ],
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  OWNER: 'Full system owner with complete access to all features and user management.',
  MANAGER: 'Manages assets and transfers, can allocate assets and approve transfers.',
  EMPLOYEE: 'Standard user with access to their own identity, assets, and transfer requests.',
};

export default function AdminRolesPage() {
  const { hasRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [assignRoleUserId, setAssignRoleUserId] = useState<number | null>(null);
  const [assignRoleType, setAssignRoleType] = useState<string>('');

  const { data: usersData } = useUsers({ page_size: 100 });
  const users = usersData?.items || [];

  const roles = ['OWNER', 'MANAGER', 'EMPLOYEE'];

  const handleAssignRole = async () => {
    if (!assignRoleUserId || !assignRoleType) return;
    try {
      toast('Role assignment functionality coming soon');
      setAssignRoleUserId(null);
      setAssignRoleType('');
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Role Management</h1>
          <p className="text-dark-600 dark:text-dark-400">Manage role definitions and user role assignments</p>
        </div>
        <Button onClick={() => { setAssignRoleUserId(users[0]?.id || null); setAssignRoleType('MANAGER'); }}>
          <Plus className="h-4 w-4" />
          Assign Role
        </Button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => (
          <Card key={role} variant="hover" className="p-6" onClick={() => setSelectedRole(role)}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${getRoleColor(role).replace('bg-', 'bg-').replace('text-', 'bg-')}`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{role}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 capitalize">Role</p>
              </div>
            </div>
            <p className="text-dark-600 dark:text-dark-400 text-sm mb-4">{ROLE_DESCRIPTIONS[role]}</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{ROLE_PERMISSIONS[role].length} permissions</Badge>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRole(role); }}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Role Permission Matrix */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="text-left p-3 font-medium text-dark-500 dark:text-dark-400">Permission</th>
                {roles.map((role) => (
                  <th key={role} className="text-center p-3 font-medium text-dark-500 dark:text-dark-400">
                    <Badge className={getRoleColor(role)}>{role}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                'user.create', 'user.read', 'user.update', 'user.delete', 'user.role.assign',
                'did.create', 'did.read', 'did.verify',
                'asset.create', 'asset.read', 'asset.update', 'asset.allocate', 'asset.transfer', 'asset.burn', 'asset.freeze',
                'transfer.create', 'transfer.read', 'transfer.approve',
                'audit.read', 'audit.verify',
                'blockchain.read',
                'system.configure',
              ].map((perm) => (
                <tr key={perm} className="border-b border-dark-100 dark:border-dark-800">
                  <td className="p-3 font-mono text-dark-600 dark:text-dark-400">{perm}</td>
                  {roles.map((role) => (
                    <td key={role} className="text-center p-3">
                      {ROLE_PERMISSIONS[role].some(p => p.toLowerCase().includes(perm.replace('.', ' '))) ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="h-5 w-5 text-dark-300 dark:text-dark-600 mx-auto">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Role Modal */}
      <Modal isOpen={assignRoleUserId !== null} onClose={() => { setAssignRoleUserId(null); setAssignRoleType(''); }} title="Assign Role to User">
        <div className="space-y-4">
          <p className="text-dark-600 dark:text-dark-400">Select a user and role to assign.</p>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">User</label>
            <select
              value={assignRoleUserId || ''}
              onChange={(e) => setAssignRoleUserId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select user</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email}) - {u.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Role</label>
            <select
              value={assignRoleType}
              onChange={(e) => setAssignRoleType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select role</option>
              {roles.filter(r => r !== 'OWNER').map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
            <Button variant="outline" onClick={() => { setAssignRoleUserId(null); setAssignRoleType(''); }}>Cancel</Button>
            <Button onClick={handleAssignRole} disabled={!assignRoleUserId || !assignRoleType}>Assign Role</Button>
          </div>
        </div>
      </Modal>

      {/* Role Detail Modal */}
      <Modal isOpen={!!selectedRole} onClose={() => setSelectedRole(null)} title={`${selectedRole} Role Details`} size="lg">
        {selectedRole && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50">
              <div className={`w-12 h-12 rounded-xl ${getRoleColor(selectedRole).replace('bg-', 'bg-').replace('text-', 'bg-')}`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{selectedRole}</h3>
                <p className="text-dark-600 dark:text-dark-400">{ROLE_DESCRIPTIONS[selectedRole]}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-dark-900 dark:text-white mb-2">Permissions ({ROLE_PERMISSIONS[selectedRole].length})</h4>
              <ul className="space-y-1">
                {ROLE_PERMISSIONS[selectedRole].map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-dark-200 dark:border-dark-700">
              <Button variant="outline" onClick={() => setSelectedRole(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}