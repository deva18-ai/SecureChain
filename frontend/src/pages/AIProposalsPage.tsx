import { useState } from 'react';
import { Search, Plus, Loader2, AlertCircle, Sparkles, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { assetsApi } from '../services/api';
import { formatDate, getProposalStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AIProposalsPage() {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    asset_name: '',
    description: '',
    category: '',
    metadata_uri: '',
    suggested_initial_owner_id: '',
    ai_model: '',
    ai_prompt: '',
    ai_response: '',
  });

  const { data: usersData } = (() => {
    // We'll use a simple fetch for users since we don't have a hook for it here
    return { data: { items: [] } };
  })();

  const canManage = hasRole(['OWNER']);

  // Fetch proposals directly since we need custom handling
  const [proposals, setProposals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const response = await assetsApi.listProposals({ page, page_size: 20, status: statusFilter });
      setProposals(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      toast.error('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/users?page_size=100', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await response.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await assetsApi.createProposal({
        ...formData,
        suggested_initial_owner_id: formData.suggested_initial_owner_id ? parseInt(formData.suggested_initial_owner_id) : undefined,
      });
      toast.success('AI proposal created successfully');
      setShowCreateModal(false);
      setFormData({ asset_name: '', description: '', category: '', metadata_uri: '', suggested_initial_owner_id: '', ai_model: '', ai_prompt: '', ai_response: '' });
      fetchProposals();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create proposal');
    } finally {
      setCreating(false);
    }
  };

  const handleReview = async (proposalId: number, action: 'approve' | 'reject') => {
    setReviewing(proposalId);
    try {
      await assetsApi.reviewProposal(proposalId, { action, review_notes: '' });
      toast.success(`Proposal ${action}d successfully`);
      fetchProposals();
      if (selectedProposal?.id === proposalId) {
        const response = await assetsApi.getProposal(proposalId);
        setSelectedProposal(response.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || `Failed to ${action} proposal`);
    } finally {
      setReviewing(null);
    }
  };

  const handleViewProposal = async (proposal: any) => {
    setSelectedProposal(proposal);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cyber-text flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-cyber-primary" />
            AI Asset Proposals
          </h1>
          <p className="text-cyber-textMuted">Review and approve AI-generated asset proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchProposals} size="sm">
            <Loader2 className="h-4 w-4" />
            Refresh
          </Button>
          {canManage && (
            <Button onClick={() => { setFormData({ asset_name: '', description: '', category: '', metadata_uri: '', suggested_initial_owner_id: '', ai_model: '', ai_prompt: '', ai_response: '' }); setShowCreateModal(true); }} size="sm">
              <Plus className="h-4 w-4" />
              Create Proposal
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-cyber-border flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-cyber-textMuted">Status:</label>
            <select
              value={statusFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setStatusFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text text-sm"
            >
              <option value="all">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PROPOSED">Proposed</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="MINTED">Minted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Suggested Owner</th>
                <th>AI Model</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-primary mx-auto" />
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-cyber-textMuted">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No proposals found</p>
                  </td>
                </tr>
              ) : (
                proposals
                  .filter((p) => p.asset_name.toLowerCase().includes(search.toLowerCase()))
                  .map((proposal) => (
                    <tr key={proposal.id}>
                      <td className="font-mono text-sm">#{proposal.id}</td>
                      <td className="font-medium text-cyber-text">{proposal.asset_name}</td>
                      <td className="text-sm text-cyber-textMuted">{proposal.category || '-'}</td>
                      <td>
                        {proposal.suggested_owner ? (
                          <span>{proposal.suggested_owner.full_name}</span>
                        ) : (
                          <span className="text-cyber-textMuted">Not specified</span>
                        )}
                      </td>
                      <td className="text-sm text-cyber-textMuted font-mono">{proposal.ai_model || 'Unknown'}</td>
                      <td>
                        <Badge variant={getProposalStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </td>
                      <td className="text-sm text-cyber-textMuted">{formatDate(proposal.created_at)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProposal(proposal)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManage && proposal.status === 'PROPOSED' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleReview(proposal.id, 'approve')} loading={reviewing === proposal.id} disabled={reviewing !== null}>
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" variant="danger" onClick={() => handleReview(proposal.id, 'reject')} loading={reviewing === proposal.id} disabled={reviewing !== null}>
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
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
          <div className="p-4 border-t border-cyber-border flex items-center justify-between">
            <p className="text-sm text-cyber-textMuted">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} proposals
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

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormData({ asset_name: '', description: '', category: '', metadata_uri: '', suggested_initial_owner_id: '', ai_model: '', ai_prompt: '', ai_response: '' }); }} title="Create AI Asset Proposal" size="lg">
        <form onSubmit={handleCreateProposal} className="space-y-4">
          <Input
            label="Asset Name"
            value={formData.asset_name}
            onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
            placeholder="AI-Generated Asset Name"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Asset description"
            type="textarea"
            rows={3}
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Equipment, Vehicle, Document, etc."
          />
          <Input
            label="Metadata URI (IPFS)"
            value={formData.metadata_uri}
            onChange={(e) => setFormData({ ...formData, metadata_uri: e.target.value })}
            placeholder="ipfs://QmHash..."
          />
          <Input
            label="AI Model"
            value={formData.ai_model}
            onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
            placeholder="GPT-4, Claude, etc."
          />
          <Input
            label="AI Prompt"
            value={formData.ai_prompt}
            onChange={(e) => setFormData({ ...formData, ai_prompt: e.target.value })}
            placeholder="Prompt used to generate this proposal"
            type="textarea"
            rows={2}
          />
          <Input
            label="AI Response"
            value={formData.ai_response}
            onChange={(e) => setFormData({ ...formData, ai_response: e.target.value })}
            placeholder="Raw AI response"
            type="textarea"
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-cyber-textMuted mb-1.5">Suggested Initial Owner (Optional)</label>
            <select
              value={formData.suggested_initial_owner_id}
              onChange={(e) => setFormData({ ...formData, suggested_initial_owner_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-cyber-border bg-cyber-elevated text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary"
            >
              <option value="">None - Owner will assign later</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email}) - {u.role}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setFormData({ asset_name: '', description: '', category: '', metadata_uri: '', suggested_initial_owner_id: '', ai_model: '', ai_prompt: '', ai_response: '' }); }} disabled={creating}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Proposal</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedProposal} onClose={() => setSelectedProposal(null)} title="Proposal Details" size="lg">
        {selectedProposal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-cyber-textMuted">Proposal ID</p>
                <p className="font-mono text-lg font-bold text-cyber-text">#{selectedProposal.id}</p>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">Asset Name</p>
                <p className="font-medium text-cyber-text">{selectedProposal.asset_name}</p>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">Category</p>
                <p className="text-sm text-cyber-text">{selectedProposal.category || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">Status</p>
                <Badge variant={getProposalStatusColor(selectedProposal.status)}>
                  {selectedProposal.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">AI Model</p>
                <p className="font-mono text-sm">{selectedProposal.ai_model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">Suggested Owner</p>
                <p className="text-sm text-cyber-text">{selectedProposal.suggested_owner?.full_name || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-cyber-textMuted">Description</p>
                <p className="text-sm text-cyber-text">{selectedProposal.description || 'No description'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-cyber-textMuted">Metadata URI</p>
                <p className="font-mono text-xs break-all">{selectedProposal.metadata_uri || 'Not provided'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-cyber-textMuted">AI Prompt</p>
                <p className="font-mono text-xs break-all">{selectedProposal.ai_prompt || 'Not provided'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-cyber-textMuted">AI Response</p>
                <p className="font-mono text-xs break-all">{selectedProposal.ai_response || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">Created</p>
                <p className="text-sm text-cyber-text">{formatDate(selectedProposal.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-cyber-textMuted">Reviewed At</p>
                <p className="text-sm text-cyber-text">{selectedProposal.reviewed_at ? formatDate(selectedProposal.reviewed_at) : 'Not reviewed'}</p>
              </div>
              {selectedProposal.review_notes && (
                <div className="col-span-2">
                  <p className="text-sm text-cyber-textMuted">Review Notes</p>
                  <p className="text-sm text-cyber-text">{selectedProposal.review_notes}</p>
                </div>
              )}
              {selectedProposal.minted_asset && (
                <div className="col-span-2 p-3 rounded-lg bg-cyber-success/10 border border-cyber-success/30">
                  <p className="text-sm text-cyber-success font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Asset Minted: {selectedProposal.minted_asset.name} (Token ID: {selectedProposal.minted_asset.token_id})
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
              <Button variant="outline" onClick={() => setSelectedProposal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function getProposalStatusColor(status: string) {
  switch (status) {
    case 'MINTED': return 'success';
    case 'APPROVED': return 'primary';
    case 'PROPOSED': return 'warning';
    case 'REJECTED': return 'danger';
    case 'DRAFT': return 'default';
    default: return 'default';
  }
}