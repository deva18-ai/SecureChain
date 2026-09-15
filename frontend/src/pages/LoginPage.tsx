import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { Shield, Eye, EyeOff, Lock, Mail, Key, Layers, Hexagon, UserCheck, User, ShieldAlert, ArrowLeft, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const THREE_DEMO_ACCOUNTS = [
  { label: 'Owner', email: 'devavardhan.test@gmail.com', role: 'Owner — Full Authority', color: 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20' },
  { label: 'Manager / Admin', email: 'manager@securechain.local', role: 'Manager — Operations', color: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20' },
  { label: 'Employee', email: 'user1@securechain.com', role: 'Employee — End User', color: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { connect: connectMetaMask } = useWallet();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('devavardhan.test@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMetaMaskConnect = async () => {
    try {
      await connectMetaMask();
      toast.success('MetaMask extension unlocked! Signing in...');
      await login('devavardhan.test@gmail.com', 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'MetaMask connection canceled or locked.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('password123');
    setIsSubmitting(true);
    try {
      await login(accountEmail, 'password123');
      toast.success(`Signed in as ${accountEmail}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-6 select-none font-sans relative">
      
      {/* Top Floating Global Back to Portfolio Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold transition-all shadow-lg backdrop-blur-md cursor-pointer z-50 group"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Main Portfolio</span>
      </Link>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 mt-8 lg:mt-0">
        
        {/* Left Navy Brand Panel */}
        <div className="lg:col-span-5 bg-[#0B132B] text-white p-10 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Back Link */}
          <div className="space-y-4 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Hexagon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">SecureChain</span>
            </div>
          </div>

          {/* Middle Copy */}
          <div className="space-y-6 relative z-10 py-8">
            <h2 className="text-3xl font-black text-white leading-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Sign in to your account to access the decentralized access control ecosystem.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="p-2 bg-blue-600/20 rounded-lg text-cyan-400">
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Decentralized Identity (DID)</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="p-2 bg-blue-600/20 rounded-lg text-cyan-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Role-Based Access Hierarchy</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="p-2 bg-blue-600/20 rounded-lg text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Ethereum Sepolia Audit Trail</div>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="text-[11px] text-slate-400 font-medium relative z-10">
            SecureChain Enterprise Security Platform
          </div>
        </div>

        {/* Right White Form Panel */}
        <div className="lg:col-span-7 bg-white p-10 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/request-access')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Request Access / Sign Up
            </button>
          </div>

          {/* Exactly 3 Demo Accounts as requested */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Demo Login:</span>
              <span className="text-[10px] font-bold text-blue-600">Select Role</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {THREE_DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc.email)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] flex flex-col items-center justify-center text-center cursor-pointer ${acc.color}`}
                >
                  <span>{acc.label}</span>
                  <span className="text-[10px] opacity-80 font-normal mt-0.5">{acc.role}</span>
                </button>
              ))}
            </div>

            {/* Direct MetaMask Extension Login Button */}
            <button
              type="button"
              onClick={handleMetaMaskConnect}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="text-base">🦊</span>
              <span>Connect MetaMask Wallet (Opens Browser Extension)</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Wallet Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Request Access Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Need system access?{' '}
            <Link to="/request-access" className="font-bold text-blue-600 hover:underline">
              Request Access
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}