import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_SECURITY_BAR = [
  { day: 'Mon', critical: 0, high: 0, medium: 1, low: 2 },
  { day: 'Tue', critical: 0, high: 1, medium: 0, low: 1 },
  { day: 'Wed', critical: 0, high: 0, medium: 1, low: 3 },
  { day: 'Thu', critical: 0, high: 0, medium: 0, low: 1 },
  { day: 'Fri', critical: 0, high: 0, medium: 1, low: 0 },
];

export default function SecurityCenterPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security Center</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Monitor system health, real-time threat intelligence, and security policy enforcement.
        </p>
      </div>

      {/* Top Threat Counter Grid & Score Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gauge Ring Card */}
        <div className="lg:col-span-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full border-8 border-slate-100 border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 flex flex-col items-center justify-center mb-3">
            <span className="text-3xl font-black text-slate-900">92</span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Score</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">System Secure</h3>
          <p className="text-xs text-slate-500 mt-0.5">All security protocols operating nominally</p>
        </div>

        {/* 4 Severity Box Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-red-50/80 border border-red-200 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical</span>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-4xl font-black text-red-900">0</span>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
          </div>

          <div className="p-5 bg-orange-50/80 border border-orange-200 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">High</span>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-4xl font-black text-orange-900">1</span>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
          </div>

          <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Medium</span>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-4xl font-black text-amber-900">3</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Low</span>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-4xl font-black text-blue-900">7</span>
              <Info className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

      </div>

      {/* Security Overview Bar Chart & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Security Events */}
        <div className="lg:col-span-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Recent Security Events</h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Unusual IP login attempt blocked</p>
                  <p className="text-[11px] text-slate-500">IP 192.168.1.100 rejected by firewall</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">1h ago</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Repeated authentication failure</p>
                  <p className="text-[11px] text-slate-500">User account temporary rate-limited</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">4h ago</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">DID signature verification passed</p>
                  <p className="text-[11px] text-slate-500">Identity contract re-synced on Sepolia</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">6h ago</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Overview */}
        <div className="lg:col-span-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Security Overview</h3>
          <p className="text-xs text-slate-500 mb-6">Threat events breakdown over the week</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SECURITY_BAR}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px' }} />
                <Bar dataKey="low" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high" fill="#EA580C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}