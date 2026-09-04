import { useState } from 'react';
import { Search, Plus, Loader2, AlertCircle, Wallet, UserPlus, Copy, CheckCircle, XCircle, MoreVertical, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { useUsers } from '../hooks/useApi';
import { formatAddress, getRoleColor, getWalletTypeColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';

export default function WalletManagementPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletFormData, setWalletFormData] = useState({
    wallet_address: '',
    wallet_type: 'EMPLOYEE',
    did: '',
    is_primary: true,
  });

  const { data: usersData, isLoading, error, refetch } = useUsers({
    page,
    page_size: 100,
  });

  const canManage = hasRole(['OWNER']);

  if (isLoading && !usersData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyber-text">Wallet Management</h1>
            <p className="text-cyber-textMuted">Manage blockchain wallet associations for users</p>
          </div>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-48 bg-cyber-elevated rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-cyber-elevated/50 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const users = usersData?.items || [];

  const handleViewWallets = async (userId: number, user: any) => {
    setSelectedUserId(userId);
    setSelectedUser(user);
    try {
      const response = await usersApi.listWallets(userId);
      setSelectedUser({ ...user, wallets: response.data.items });
    } catch (error) {
      toast.error('Failed to load wallets');
    }
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setCreatingWallet(true);
    try {
      await usersApi.createWallet(selectedUserId, walletFormData);
      toast.success('Wallet associated successfully');
      setShowCreateModal(false);
      setWalletFormData({ wallet_address: '', wallet_type: 'EMPLOYEE', did: '', is_primary: true });
      if (selectedUserId) {
        const response = await usersApi.listWallets(selectedUserId);
        setSelectedUser({ ...selectedUser, wallets: response.data.items });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create wallet association');
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleDeleteWallet = async (walletId: number) => {
    if (!selectedUserId) return;
    if (!confirm('Are you sure you want to remove this wallet association?')) return;
    try {
      await usersApi.deleteWallet(selectedUserId, walletId);
      toast.success('Wallet association removed');
      if (selectedUserId) {
        const response = await usersApi.listWallets(selectedUserId);
        setSelectedUser({ ...selectedUser, wallets: response.data.items });
      }
    } catch (error) {
      toast.error('Failed to remove wallet association');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cyber-text">Wallet Management</h1>
          <p className="text-cyber-textMuted">Manage blockchain wallet associations for all users</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-cyber-border">
            <h3 className="font-semibold text-cyber-text">Users</h3>
            <p className="text-sm text-cyber-textMuted">{users.length} users</p>
          </div>
          <div className="p-4 border-b border-cyber-border">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <Table>
              <tbody className="divide-y divide-cyber-border">
                {users.length === 0 ? (
                  <tr>
                    <td className="text-center py-12 text-cyber-textMuted">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  users
                    .filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                    .map((u) => (
                      <tr
                        key={u.id}
                        className={`cursor-pointer hover:bg-cyber-elevated/50 ${selectedUserId === u.id ? 'bg-cyber-primary/10' : ''}`}
                        onClick={() => handleViewWallets(u.id, u)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-medium text-sm">{u.full_name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-cyber-text truncate">{u.full_name}</p>
                              <p className="text-xs text-cyber-textMuted truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Wallet Details */}
        <Card className="lg:col-span-2">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-cyber-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center">
                    <span className="text-white font-medium text-xl">{selectedUser.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cyber-text">{selectedUser.full_name}</h3>
                    <p className="text-sm text-cyber-textMuted">{selectedUser.email} • <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge></p>
                  </div>
                </div>
                {canManage && (
                  <Button onClick={() => { setWalletFormData({ wallet_address: '', wallet_type: 'EMPLOYEE', did: '', is_primary: true }); setShowCreateModal(true); }} size="sm">
                    <UserPlus className="h-4 w-4" />
                    Associate Wallet
                  </Button>
                )}
              </div>

              <div className="p-4">
                {selectedUser.wallets && selectedUser.wallets.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.wallets.map((wallet: any) => (
                      <div key={wallet.id} className="p-4 rounded-lg border border-cyber-border bg-cyber-elevated/30">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Wallet className="h-8 w-8 text-cyber-primary" />
                            <div>
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-sm text-cyber-text bg-cyber-bg px-2 py-1 rounded">{formatAddress(wallet.wallet_address)}</code>
                                <Badge className={getWalletTypeColor(wallet.wallet_type)}>{wallet.wallet_type}</Badge>
                                {wallet.is_primary && <Badge variant="success">Primary</Badge>}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-cyber-textMuted">
                                {wallet.did && (
                                  <span className="flex items-center gap-1">
                                    <span className="font-mono text-xs">{wallet.did}</span>
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  Blockchain: <Badge variant={wallet.blockchain_identity_status === 'CONFIRMED' ? 'success' : wallet.blockchain_identity_status === 'FAILED' ? 'danger' : 'warning'}>{wallet.blockchain_identity_status}</Badge>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => copyAddress(wallet.wallet_address)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            {canManage && (
                              <Button variant="ghost" size="sm" variant="danger" onClick={() => handleDeleteWallet(wallet.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {wallet.blockchain_identity_tx_hash && (
                          <div className="mt-3 pt-3 border-t border-cyber-border/50">
                            <p className="text-xs text-cyber-textMuted">Blockchain Transaction: <code className="font-mono text-cyber-success">{wallet.blockchain_identity_tx_hash}</code></p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-cyber-textMuted">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No wallet associations for this user</p>
                    {canManage && (
                      <Button onClick={() => setShowCreateModal(true)} className="mt-4" size="sm">
                        <UserPlus className="h-4 w-4" />
                        Associate First Wallet
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-cyber-textMuted">
              <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a user to view their wallet associations</p>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setWalletFormData({ wallet_address: '', wallet_type: 'EMPLOYEE', did: '', is_primary: true }); }} title="Associate Wallet" size="lg">
        <form onSubmit={handleCreateWallet} className="space-y-4">
          <Input
            label="Wallet Address"
            type="text"
            value={walletFormData.wallet_address}
            onChange={(e) => setWalletFormData({ ...walletFormData, wallet_address: e.target.value })}
            placeholder="0x1234...abcd"
            required
          />
          <Input
            label="DID (Optional)"
            type="text"
            value={walletFormData.did}
            onChange={(e) => setWalletFormData({ ...walletFormData, did: e.target.value })}
            placeholder="did:securechain:..."
          />
          <div>
            <label className="block text-sm font-medium text-cyber-textMuted mb-1.5">Wallet Type</label>
            <select
              value={walletFormData.wallet_type}
              onChange={(e) => setWalletFormData({ ...walletFormData, wallet_type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary"
              required
            >
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={walletFormData.is_primary}
              onChange={(e) => setWalletFormData({ ...walletFormData, is_primary: e.target.checked })}
              className="w-4 h-4 rounded border-cyber-border text-cyber-primary focus:ring-cyber-primary"
            />
            <span className="text-sm text-cyber-text">Set as primary wallet</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setWalletFormData({ wallet_address: '', wallet_type: 'EMPLOYEE', did: '', is_primary: true }); }} disabled={creatingWallet}>Cancel</Button>
            <Button type="submit" loading={creatingWallet}>Associate Wallet</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function getWalletTypeColor(type: string) {
  switch (type) {
    case 'OWNER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'MANAGER': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'EMPLOYEE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'default';
  }
}