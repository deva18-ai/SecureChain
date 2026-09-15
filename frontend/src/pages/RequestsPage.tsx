import { useState } from 'react';
import { Check, X, Eye, Clock, FileText, CheckCircle2, XCircle, ShieldAlert, Plus, MessageSquare, Key, Globe, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface RequestItem {
  id: number;
  user: string;
  role: string;
  type: string;
  detail: string;
  category: 'MANAGER_APPROVAL' | 'EMPLOYEE_ACCESS' | 'TRANSFER_REQUEST' | 'MY_REQUEST';
  time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  did: string;
  txHash: string;
  rejectionReason?: string;
  targetOwner?: string;
}

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 1,
    user: 'Asset Manager (Manager)',
    role: 'Manager',
    type: 'Owner Restricted Action',
    detail: 'Mint High-Performance Server Asset SC-SRV-1005',
    category: 'MANAGER_APPROVAL',
    time: '1h ago',
    status: 'PENDING',
    did: 'did:sc:mgr-8f92a10b4c22',
    txHash: '0x8f2bb3c91a204e90a887b1c3e',
    targetOwner: 'Devavardhan (Owner)',
  },
  {
    id: 2,
    user: 'Rohith Kumar (Employee)',
    role: 'Employee',
    type: 'Asset Transfer Request',
    detail: 'Transfer Laptop SC-001 Ownership to Owner / Manager',
    category: 'TRANSFER_REQUEST',
    time: '2h ago',
    status: 'PENDING',
    did: 'did:sc:emp-3c4412e09b11',
    txHash: '0x4a1190e28f3bb2c19a993e',
    targetOwner: 'Devavardhan (Owner)',
  },
  {
    id: 3,
    user: 'Priya S (Employee)',
    role: 'Employee',
    type: 'New Asset Access',
    detail: 'Request Access Pass for Dell XPS 15 Workstation',
    category: 'EMPLOYEE_ACCESS',
    time: '4h ago',
    status: 'PENDING',
    did: 'did:sc:emp-7b1981ee4209',
    txHash: '0x3b1c4d209fa882c3104e',
  },
  {
    id: 4,
    user: 'Vignesh D (Employee)',
    role: 'Employee',
    type: 'Asset Transfer Request',
    detail: 'Transfer Monitor SC-006 to Asset Manager',
    category: 'TRANSFER_REQUEST',
    time: '6h ago',
    status: 'PENDING',
    did: 'did:sc:emp-99e21b44c801',
    txHash: '0x9e4f11b890a21cf8b731',
  },
  {
    id: 5,
    user: 'Employee User (Me)',
    role: 'Employee',
    type: 'Asset Access',
    detail: 'Access Pass for Workstation SC-DEV-01',
    category: 'MY_REQUEST',
    time: '1d ago',
    status: 'APPROVED',
    did: 'did:sc:emp-1109aa76e511',
    txHash: '0x1c8832a90fb411d99e',
  },
];

export default function RequestsPage() {
  const { user, activeRole } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Modals state
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<RequestItem | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<RequestItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Submit new request modal for Employees/Managers
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newRequestType, setNewRequestType] = useState<'ASSET_ACCESS' | 'TRANSFER_TO_OWNER'>('ASSET_ACCESS');
  const [newRequestDetail, setNewRequestDetail] = useState('');

  const isOwner = activeRole === 'ADMIN';
  const isManager = activeRole === 'MANAGER';
  const isEmployee = activeRole === 'USER';

  const handleApprove = (req: RequestItem) => {
    if (isEmployee) {
      toast.error('Employees cannot approve access or transfer requests.');
      return;
    }
    setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r));
    if (isOwner) {
      toast.success(`Owner approved Request #${req.id} and anchored event on Sepolia!`);
    } else {
      toast.success(`Manager approved Request #${req.id} and escalated to Owner approval queue!`);
    }
  };

  const openRejectModal = (req: RequestItem) => {
    if (isEmployee) {
      toast.error('Employees cannot reject requests.');
      return;
    }
    setRejectingRequest(req);
    setRejectionReasonInput('');
  };

  const confirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReasonInput.trim()) {
      toast.error('A rejection reason is required before rejecting.');
      return;
    }
    if (!rejectingRequest) return;

    setRequests(requests.map(r => r.id === rejectingRequest.id ? {
      ...r,
      status: 'REJECTED',
      rejectionReason: rejectionReasonInput.trim(),
    } : r));

    toast.error(`Request #${rejectingRequest.id} REJECTED. Reason recorded.`);
    setRejectingRequest(null);
    setRejectionReasonInput('');
  };

  const handleCreateSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestDetail.trim()) {
      toast.error('Please specify request details.');
      return;
    }
    const created: RequestItem = {
      id: Date.now(),
      user: `${user?.full_name || 'Current User'} (${isManager ? 'Manager' : 'Employee'})`,
      role: isManager ? 'Manager' : 'Employee',
      type: newRequestType === 'TRANSFER_TO_OWNER' ? 'Asset Transfer Request' : 'New Asset Access Request',
      detail: newRequestDetail.trim(),
      category: newRequestType === 'TRANSFER_TO_OWNER' ? 'TRANSFER_REQUEST' : 'EMPLOYEE_ACCESS',
      time: 'Just now',
      status: 'PENDING',
      did: `did:sc:req-${Math.floor(Math.random() * 900000 + 100000)}`,
      txHash: `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      targetOwner: 'Devavardhan (Owner)',
    };
    setRequests([created, ...requests]);
    toast.success('Access/Transfer request submitted to Owner approval queue!');
    setIsSubmitModalOpen(false);
    setNewRequestDetail('');
  };

  const currentRoleRequests = requests.filter(r => {
    if (isEmployee) return r.user.includes('Employee User') || r.user.includes(user?.full_name || '') || r.category === 'MY_REQUEST';
    return true;
  });

  const pendingCount = currentRoleRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = currentRoleRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = currentRoleRequests.filter(r => r.status === 'REJECTED').length;

  const currentRequests = currentRoleRequests.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            {isOwner && 'Owner Approval Queue & Access Requests'}
            {isManager && 'Manager Operations — Requests & Owner Transfers'}
            {isEmployee && 'My Access & Transfer Requests'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isOwner && 'Owner Authority: Review restricted Manager actions and approve or reject with mandatory reasons.'}
            {isManager && 'Manager Portal: Request asset transfers to Owner and request new asset allocations for employees.'}
            {isEmployee && 'Employee Portal: Submit asset requests and request transfers to Manager/Owner.'}
          </p>
        </div>

        {(isEmployee || isManager) && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isManager ? 'Request Asset Transfer to Owner' : 'Submit Access/Transfer Request'}</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Pending</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'PENDING' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Approved</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'APPROVED' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'REJECTED'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'REJECTED' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {currentRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            No {activeTab.toLowerCase()} requests found.
          </div>
        ) : (
          currentRequests.map((req) => (
            <div key={req.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{req.user}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {req.type}
                    </span>
                    {req.targetOwner && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                        Target: {req.targetOwner}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">{req.detail}</p>
                  
                  {/* Rejection reason badge if present */}
                  {req.rejectionReason && (
                    <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-extrabold uppercase text-[10px] tracking-wider block text-red-900">Owner Rejection Reason:</span>
                        <span>{req.rejectionReason}</span>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5 font-semibold">
                    <Clock className="w-3 h-3" /> Submitted {req.time} · DID: <span className="font-mono text-slate-600">{req.did.slice(0, 18)}...</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setSelectedDetailRequest(req)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> View Details
                </button>

                {req.status === 'PENDING' && (isOwner || isManager) && (
                  <>
                    <button
                      onClick={() => handleApprove(req)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(req)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}

                {req.status !== 'PENDING' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── REQUEST DETAIL MODAL ────────────────────────────────────────── */}
      {selectedDetailRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Request Details #{selectedDetailRequest.id}</h3>
              </div>
              <button onClick={() => setSelectedDetailRequest(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Requester Identity</span>
                <div className="font-bold text-slate-900 text-sm">{selectedDetailRequest.user}</div>
                <div className="font-mono text-cyan-600 font-semibold">{selectedDetailRequest.did}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Request Category</span>
                  <div className="font-bold text-slate-800">{selectedDetailRequest.type}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Current Status</span>
                  <div className={`font-black uppercase ${
                    selectedDetailRequest.status === 'APPROVED' ? 'text-emerald-600' : selectedDetailRequest.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'
                  }`}>{selectedDetailRequest.status}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Action Details</span>
                <div className="font-medium text-slate-800 leading-relaxed">{selectedDetailRequest.detail}</div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 font-mono">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Sepolia Transaction Anchor</span>
                <div className="text-cyan-400 font-semibold break-all text-[11px]">{selectedDetailRequest.txHash}</div>
              </div>

              {selectedDetailRequest.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <span className="text-red-900 uppercase tracking-wider text-[10px] font-extrabold block">Owner Rejection Reason</span>
                  <div className="text-red-800 font-medium">{selectedDetailRequest.rejectionReason}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {selectedDetailRequest.status === 'PENDING' && (isOwner || isManager) && (
                <>
                  <button
                    onClick={() => { const r = selectedDetailRequest; setSelectedDetailRequest(null); handleApprove(r); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => { const r = selectedDetailRequest; setSelectedDetailRequest(null); openRejectModal(r); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reject Request
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedDetailRequest(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── OWNER REJECTION REASON MODAL ────────────────────────────────── */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={confirmRejection} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">Specify Rejection Reason</h3>
              </div>
              <button type="button" onClick={() => setRejectingRequest(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              As <strong>{isOwner ? 'System Owner' : 'Manager'}</strong>, you are rejecting Request #{rejectingRequest.id} from <strong>{rejectingRequest.user}</strong>. Please enter the mandatory rejection reason below.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 font-medium">
              Item: <strong>{rejectingRequest.detail}</strong>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Rejection Reason (Required)
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Specify reason (e.g., Asset needed for Q4 priority project / Insufficient RBAC clearance / Duplicate request)..."
                className="w-full p-3 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── SUBMIT REQUEST MODAL ────────────────────────────────────────── */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmitRequest} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Submit New Request</h3>
              <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Request Type</label>
                <select
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ASSET_ACCESS">New Asset Access Request</option>
                  <option value="TRANSFER_TO_OWNER">Asset Transfer Request to Owner</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Details & Item Name</label>
                <textarea
                  rows={3}
                  required
                  value={newRequestDetail}
                  onChange={(e) => setNewRequestDetail(e.target.value)}
                  placeholder="Specify asset or transfer reason (e.g. Requesting transfer of Laptop SC-001 to Owner)..."
                  className="w-full p-3 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Submit to Owner Queue
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}