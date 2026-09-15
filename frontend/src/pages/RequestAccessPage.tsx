import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { UserPlus, Wallet, Lock, Mail, User, Hexagon, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RequestAccessPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isConnected, account, connect } = useWallet();

  const [path, setPath] = useState<'owner' | 'request'>('owner');
  const [fullName, setFullName] = useState('Devavardhan MI');
  const [email, setEmail] = useState('you@example.com');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreed) {
      toast.error('You must agree to the Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email,
        full_name: fullName,
        password,
        wallet_address: account || undefined,
        role: path === 'owner' ? 'ADMIN' : 'USER',
      });
      toast.success(path === 'owner' ? 'Owner account created!' : 'Access request submitted!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit account creation');
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

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 mt-12 lg:mt-0">
        
        {/* Left Navy Panel (Screen 3 Left Side) */}
        <div className="lg:col-span-5 bg-[#0B132B] text-white p-10 flex flex-col justify-between border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Hexagon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">SecureChain</span>
            </div>

            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              Join SecureChain
            </h2>
            <p className="text-sm text-slate-300 font-normal mb-6">
              Choose your registration path
            </p>

            {/* Path Selection Cards */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setPath('owner')}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  path === 'owner'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-xl ${path === 'owner' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Create Owner Account</h3>
                    <p className="text-xs text-slate-300">Full control and system management</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPath('request')}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  path === 'request'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-xl ${path === 'request' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Request Access</h3>
                    <p className="text-xs text-slate-300">For Admin / Employee / Auditor roles</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-cyan-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Form Panel (Screen 3 Right Side) */}
        <div className="lg:col-span-7 bg-white p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {path === 'owner' ? 'Create Owner Account' : 'Request Access'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {path === 'owner' ? 'Register as a system owner' : 'Submit details for admin verification'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your fullname"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Connect Wallet */}
              <div className="pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Connect Wallet</label>
                <button
                  type="button"
                  onClick={() => connect()}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>{isConnected ? `Connected: ${account?.slice(0, 8)}...` : 'Connect Wallet'}</span>
                  {isConnected && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                </button>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 text-xs pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-slate-600 font-medium">
                  I agree to the <a href="#" className="text-blue-600 font-semibold underline">Terms & Conditions</a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-4"
              >
                {isSubmitting ? 'Processing...' : path === 'owner' ? 'Create Account' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}