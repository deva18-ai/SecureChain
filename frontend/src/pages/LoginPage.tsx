import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  Blocks, 
  Key, 
  Globe, 
  UserCheck, 
  Briefcase, 
  User, 
  Cpu, 
  Check, 
  Sparkles,
  LockKeyhole,
  Activity,
  Layers,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';
import { cn } from '../utils/helpers';

const DEMO_CREDENTIALS = {
  OWNER: { 
    email: 'devavardhan.test@gmail.com', 
    password: 'Owner@123', 
    role: 'System Owner',
    badge: 'Admin',
    desc: 'Full administrative control',
    icon: UserCheck,
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-400'
  },
  MANAGER: { 
    email: 'recipient@test.com', 
    password: 'Manager@123', 
    role: 'Asset Manager',
    badge: 'Manager',
    desc: 'Manage assets & requests',
    icon: Briefcase,
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-400'
  },
  EMPLOYEE: { 
    email: 'user1@securechain.com', 
    password: 'User@123', 
    role: 'Auditor / Staff',
    badge: 'Auditor',
    desc: 'View & audit transactions',
    icon: User,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
  },
} as const;

const trustBadges = [
  { label: 'SOC 2 Type II Certified', icon: CheckCircle },
  { label: 'ISO 27001 Compliant', icon: Shield },
  { label: '99.99% Enterprise Uptime', icon: Globe },
  { label: 'AES-256 Encrypted', icon: LockKeyhole },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<keyof typeof DEMO_CREDENTIALS | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Authentication successful! Welcome back.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Invalid credentials. Please verify your email and password.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (roleKey: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    setEmail(creds.email);
    setPassword(creds.password);
    setSelectedRole(roleKey);
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Widescreen Laptop Desktop Hero & Live Blockchain Showcase */}
      {/* ========================================================================= */}
      <div className="w-full md:w-1/2 lg:w-[54%] xl:w-[56%] bg-slate-900 flex flex-col justify-between p-8 md:p-12 xl:p-16 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        {/* Background Mesh & Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_45%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col justify-between max-w-2xl mx-auto md:max-w-none w-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 md:mb-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/30 ring-1 ring-white/20">
                <Shield className="h-7 w-7 text-white stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight font-heading flex items-center gap-2.5">
                  SecureChain
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold tracking-widest">
                    Enterprise Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Decentralized Asset & Digital Identity Network</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Node Synced (12ms)
            </div>
          </div>

          {/* Center Laptop Showcase: Hero Title + Live Blockchain Widget */}
          <div className="my-auto py-8 lg:py-12 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Next-Generation Blockchain Platform
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Cryptographic Trust for Modern Enterprise Assets
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Self-sovereign W3C Decentralized Identifiers (DIDs), immutable ERC-721 token tracking, and 100% transparent audit trails built for enterprise scale.
              </p>
            </div>

            {/* Desktop Glassmorphic Live Blockchain Dashboard Widget */}
            <div className="rounded-2xl bg-slate-800/80 backdrop-blur-2xl border border-slate-700/80 p-6 shadow-2xl shadow-black/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl group-hover:bg-blue-600/25 transition-all duration-700" />
              
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Live Network Metrics
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Hardhat Mainnet</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Consensus: Proof of Authority (PoA)</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-mono text-slate-400">Block Height</p>
                  <p className="text-sm font-bold text-blue-400 font-mono flex items-center gap-1">
                    #1,492,088 <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  </p>
                </div>
              </div>

              {/* 3 Widescreen Stats Columns */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] uppercase font-mono font-bold">Active DIDs</span>
                  </div>
                  <p className="text-base font-extrabold text-white font-mono">1,240 <span className="text-xs text-emerald-400 font-normal">+18%</span></p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] uppercase font-mono font-bold">Assets Minted</span>
                  </div>
                  <p className="text-base font-extrabold text-white font-mono">4,892 <span className="text-xs text-blue-400 font-normal">NFTs</span></p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] uppercase font-mono font-bold">Audit Logs</span>
                  </div>
                  <p className="text-base font-extrabold text-emerald-400 font-mono">100% <span className="text-xs text-slate-400 font-normal">Verified</span></p>
                </div>
              </div>
            </div>

            {/* Core Feature Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
                <Key className="w-5 h-5 text-blue-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Self-Sovereign DIDs</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Cryptographic wallet ownership with W3C standards.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
                <Blocks className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">On-Chain Assets</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Immutable tokenized asset registry & transfer records.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
                <Shield className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Zero-Trust Logs</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Every audit event stamped on smart contract ledger.</p>
              </div>
            </div>
          </div>

          {/* Bottom Compliance Badges */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5 flex-wrap">
              {trustBadges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <badge.icon className="w-4 h-4 text-blue-400" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Widescreen Laptop Enterprise Login Form */}
      {/* ========================================================================= */}
      <div className="w-full md:w-1/2 lg:w-[46%] xl:w-[44%] bg-white flex flex-col justify-between p-8 md:p-12 xl:p-16 min-h-screen">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-slate-400 group-hover:text-blue-600" />
            <span>Back to Landing Page</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure SSL 256-Bit</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-xl mx-auto my-auto py-4">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                Enterprise Sign In
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
              Access SecureChain Platform
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter your corporate credentials or use 1-click demo access below
            </p>
          </div>

          {/* Quick Access Demo Role Cards (Widescreen 3-Column Desktop Cards) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                ⚡ 1-Click Demo Login Roles
              </label>
              <span className="text-xs text-blue-600 font-bold">Auto-fills email & password</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['OWNER', 'MANAGER', 'EMPLOYEE'] as const).map((roleKey) => {
                const creds = DEMO_CREDENTIALS[roleKey];
                const isSelected = selectedRole === roleKey;
                const RoleIcon = creds.icon;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => fillCredentials(roleKey)}
                    disabled={isLoading}
                    className={cn(
                      'flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 relative group cursor-pointer',
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-md shadow-blue-500/10'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300')}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', creds.color)}>
                          {creds.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className={cn('text-xs font-bold mb-0.5', isSelected ? 'text-blue-950' : 'text-slate-900')}>
                      {creds.role}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate leading-tight">
                      {creds.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-semibold uppercase tracking-wider">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Corporate Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 font-medium',
                    'focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10',
                    isLoading && 'bg-slate-50 opacity-60 cursor-not-allowed'
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={cn(
                    'w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 font-medium',
                    'focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10',
                    isLoading && 'bg-slate-50 opacity-60 cursor-not-allowed'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember this browser
                </span>
              </label>

              <button
                type="button"
                onClick={() => toast.error('Please contact system administrator to reset credentials.')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-900">Authentication Failed</p>
                  <p className="text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3.5 px-6 rounded-xl text-sm font-extrabold text-white shadow-xl shadow-blue-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
                'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99]',
                'focus:outline-none focus:ring-4 focus:ring-blue-600/20',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Credentials on Chain...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Control Center</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Account Access Footer */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Need access for a new organization?{' '}
              <button
                type="button"
                onClick={() => navigate('/request-access')}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
              >
                Request Enterprise Account &rarr;
              </button>
            </p>
          </div>
        </div>

        {/* Security Micro Footer */}
        <div className="w-full max-w-xl mx-auto text-center border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-400 font-semibold">
            SecureChain Enterprise &copy; 2026 &bull; Smart India Hackathon &bull; W3C DID & ERC-721 Compliant
          </p>
        </div>
      </div>
    </div>
  );
}