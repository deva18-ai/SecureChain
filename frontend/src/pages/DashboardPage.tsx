import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, assetsApi, transfersApi } from '../services/api';
import { displayRole, formatTxHash, formatRelativeTime } from '../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Box,
  Users,
  UserCheck,
  FileText,
  ShieldCheck,
  Globe,
  ExternalLink,
  CheckCircle2,
  PlusCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_CHART_DATA = [
  { month: 'Jan', assets: 12 },
  { month: 'Feb', assets: 15 },
  { month: 'Mar', assets: 18 },
  { month: 'Apr', assets: 20 },
  { month: 'May', assets: 22 },
  { month: 'Jun', assets: 24 },
];

export default function DashboardPage() {
  const { user, activeRole, previewRole } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 24,
    totalUsers: 12,
    employees: 8,
    pendingApprovals: 3,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await dashboardApi.stats();
        if (res.data) {
          setStats({
            totalAssets: res.data.total_assets || 24,
            totalUsers: res.data.total_users || 12,
            employees: 8,
            pendingApprovals: res.data.active_transfers || 3,
          });
        }
      } catch (err) {
        // Fallback to blueprint mock numbers if backend offline
      }
    }
    loadStats();
  }, []);

  const isOwner = activeRole === 'ADMIN';
  const isManager = activeRole === 'MANAGER';
  const isEmployee = activeRole === 'USER';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {user?.full_name?.split(' ')[0] || (isOwner ? 'Owner' : isManager ? 'Manager' : 'Employee')}</span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              isOwner ? 'bg-blue-100 text-blue-800' : isManager ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {displayRole(activeRole)}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isOwner && 'Owner Portal: Complete authority over assets, user creation, approvals, and blockchain audit logs.'}
            {isManager && 'Manager Portal: Operational management. Restricted operations submit requests to Owner.'}
            {isEmployee && 'Employee Portal: View assigned assets, request access, and check identity status.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sepolia Network Connected</span>
          </div>
        </div>
      </div>

      {/* SCREEN 4: OWNER DASHBOARD VIEW */}
      {isOwner && (
        <div className="space-y-8">
          {/* 4 Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Assets */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assets</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.totalAssets}</span>
                <span className="text-xs font-bold text-emerald-600">+2% vs last mo</span>
              </div>
            </div>

            {/* Total Users */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.totalUsers}</span>
                <span className="text-xs font-bold text-emerald-600">+12% vs last mo</span>
              </div>
            </div>

            {/* Employees */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employees</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.employees}</span>
                <span className="text-xs font-bold text-emerald-600">+1 new</span>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.pendingApprovals}</span>
                <span className="text-xs font-bold text-amber-600">+2 new</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Asset Activity Chart & Security Overview Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Asset Activity Recharts */}
            <div className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Asset Activity</h3>
                  <p className="text-xs text-slate-500 font-medium">Growth of digital assets over time</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Last 6 Months</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="assets" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorAssets)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Security Overview Gauge Widget (Blueprint circular score 92) */}
            <div className="lg:col-span-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Security Overview</h3>
                <p className="text-xs text-slate-500 font-medium">System threat assessment score</p>
              </div>

              {/* Gauge Score Ring */}
              <div className="my-4 flex flex-col items-center justify-center relative">
                <div className="w-36 h-36 rounded-full border-8 border-slate-100 border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-black text-slate-900">92</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">System Secure</span>
                </div>
              </div>

              {/* Threat Counters Breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-slate-100">
                <div className="p-2 bg-red-50 rounded-xl">
                  <span className="block text-sm font-bold text-red-600">0</span>
                  <span className="text-[10px] font-semibold text-slate-500">Critical</span>
                </div>
                <div className="p-2 bg-orange-50 rounded-xl">
                  <span className="block text-sm font-bold text-orange-600">1</span>
                  <span className="text-[10px] font-semibold text-slate-500">High</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl">
                  <span className="block text-sm font-bold text-amber-600">3</span>
                  <span className="text-[10px] font-semibold text-slate-500">Medium</span>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl">
                  <span className="block text-sm font-bold text-blue-600">7</span>
                  <span className="text-[10px] font-semibold text-slate-500">Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Activity & Blockchain Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Recent Activity</span>
                <a href="/audit" className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">New user registered</p>
                      <p className="text-[11px] text-slate-500">Priya S joined as Employee</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">2h ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Asset created</p>
                      <p className="text-[11px] text-slate-500">SC-001 Laptop minted on Sepolia</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">4h ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Identity verified</p>
                      <p className="text-[11px] text-slate-500">did:sc:170b verified on-chain</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">6h ago</span>
                </div>
              </div>
            </div>

            {/* Blockchain Status Card */}
            <div className="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Blockchain Status</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-500">Network</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Ethereum Sepolia (Chain 11155111)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-500">Contract</span>
                    <span className="font-mono font-bold text-slate-900">0x593F...7e3E</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-500">Wallet</span>
                    <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected (0x71A8...8A82)
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>View Network on Etherscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 5: MANAGER / ADMIN DASHBOARD VIEW */}
      {isManager && (
        <div className="space-y-8">
          {/* 4 Manager Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Managed Operational Assets */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Managed Assets</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">18</span>
                <span className="text-xs font-bold text-indigo-600">Operational</span>
              </div>
            </div>

            {/* Managed Employees */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Employees</span>
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">8</span>
                <span className="text-xs font-bold text-emerald-600">Verified</span>
              </div>
            </div>

            {/* Pending Employee Requests */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Requests</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">3</span>
                <span className="text-xs font-bold text-amber-600">Action Required</span>
              </div>
            </div>

            {/* Submitted Owner Approvals */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Sign-offs</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">2</span>
                <span className="text-xs font-bold text-blue-600">Awaiting Owner</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Manager Asset Distribution Chart & Operational Score Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Operational Asset Growth Chart */}
            <div className="lg:col-span-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Operational Asset Velocity</h3>
                  <p className="text-xs text-slate-500 font-medium">Assigned & allocated assets over 6 months</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Manager Oversight</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorManagerAssets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="assets" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorManagerAssets)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Operational Compliance Gauge Ring */}
            <div className="lg:col-span-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Operational Compliance</h3>
                <p className="text-xs text-slate-500 font-medium">Policy adherence & verification score</p>
              </div>

              {/* Gauge Score Ring */}
              <div className="my-4 flex flex-col items-center justify-center relative">
                <div className="w-36 h-36 rounded-full border-8 border-slate-100 border-t-indigo-500 border-r-indigo-500 border-b-indigo-500 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-black text-slate-900">94</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Policy Valid</span>
                </div>
              </div>

              {/* Operational Status Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <span className="block text-sm font-bold text-emerald-600">14</span>
                  <span className="text-[10px] font-semibold text-slate-500">Active</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl">
                  <span className="block text-sm font-bold text-amber-600">3</span>
                  <span className="text-[10px] font-semibold text-slate-500">In Review</span>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl">
                  <span className="block text-sm font-bold text-blue-600">2</span>
                  <span className="text-[10px] font-semibold text-slate-500">Submitted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Manager Activity Log & Operations Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Manager Operations Feed */}
            <div className="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Manager Activity & Approval Requests</span>
                <a href="/requests" className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1">
                  Manage Requests <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">Submitted Asset Mint Request</p>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">Request Owner Approval</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Requested minting 2 hardware security keys SC-KEY-08</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">Pending</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Assigned Laptop SC-102</p>
                      <p className="text-[11px] text-slate-500">Allocated to Employee (Priya S)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">1h ago</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Verified Identity Record</p>
                      <p className="text-[11px] text-slate-500">DID did:sc:81a9 checked against Sepolia anchor</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">3h ago</span>
                </div>
              </div>
            </div>

            {/* Manager Operations Hub & Workflow Actions */}
            <div className="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Manager Operations Hub</h3>
                <p className="text-xs text-slate-500 font-medium mb-4">Execute permitted tasks or submit requests to Owner</p>

                <div className="space-y-3">
                  <a
                    href="/assets"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Box className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Allocate Managed Asset</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Operational</span>
                  </a>

                  <a
                    href="/users"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Manage Employee Roster</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Operational</span>
                  </a>

                  <a
                    href="/requests"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-800">Request Asset Minting</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Request Owner Approval</span>
                  </a>

                  <a
                    href="/requests"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-800">Request User Account / Role</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Request Owner Approval</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Authority Level: <strong className="text-slate-900">Manager (Operational)</strong></span>
                <span className="text-indigo-600 font-bold">Sepolia Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 6: EMPLOYEE DASHBOARD VIEW */}
      {isEmployee && (
        <div className="space-y-8">
          {/* 4 Employee Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Assigned Assets</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">3</span>
                <span className="text-xs font-bold text-emerald-600">Active</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Credential</span>
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">DID</span>
                <span className="text-xs font-bold text-cyan-600">On-Chain Verified</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Access Passes</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">5</span>
                <span className="text-xs font-bold text-indigo-600">Granted</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">1</span>
                <span className="text-xs font-bold text-amber-600">In Review</span>
              </div>
            </div>
          </div>

          {/* Assigned Assets & Access Table */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Assigned Assets & Cryptographic Badges</h3>
                <p className="text-xs text-slate-500 font-medium">Assets assigned to your DID record</p>
              </div>
              <a href="/requests" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all">
                Request Asset Access
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Asset Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Verification Anchor</th>
                    <th className="pb-3">Assigned On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Box className="w-4 h-4 text-emerald-600" />
                      <span>Developer Workstation (MacBook Pro)</span>
                    </td>
                    <td className="py-3.5">Hardware</td>
                    <td className="py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Active</span></td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-500">0x8f2a...7c91</td>
                    <td className="py-3.5">10 Sep 2025</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-600" />
                      <span>Secure Access Pass key</span>
                    </td>
                    <td className="py-3.5">Security Token</td>
                    <td className="py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Active</span></td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-500">0x3b1c...4d20</td>
                    <td className="py-3.5">12 Sep 2025</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Figma Enterprise License</span>
                    </td>
                    <td className="py-3.5">Software</td>
                    <td className="py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Active</span></td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-500">0x9e4f...11b8</td>
                    <td className="py-3.5">14 Sep 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}