import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';

const DEMO_CREDENTIALS = {
  OWNER: { email: 'devavardhan.test@gmail.com', password: 'Owner@123', role: 'Owner' },
  MANAGER: { email: 'recipient@test.com', password: 'Manager@123', role: 'Manager' },
  EMPLOYEE: { email: 'user1@securechain.com', password: 'User@123', role: 'Employee' },
} as const;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<keyof typeof DEMO_CREDENTIALS | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Invalid credentials. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const fillCredentials = (role: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
    setSelectedRole(role);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all hover:gap-3 group z-20"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">SecureChain</div>
              <div className="text-xs text-gray-600">Blockchain Identity Platform</div>
            </div>
          </div>
        </div>

        {/* Main Card - Seamless with Background */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Quick Access */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Quick Access
              </p>
              <div className="flex gap-2">
                {(['OWNER', 'MANAGER', 'EMPLOYEE'] as const).map((role) => {
                  const creds = DEMO_CREDENTIALS[role];
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => fillCredentials(role)}
                      disabled={isLoading}
                      className={`
                        flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200
                        ${isSelected
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                      `}
                    >
                      {creds.role}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className={`
                      w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm
                      transition-all duration-200
                      ${error && !email 
                        ? 'border-red-500/50 focus:border-red-500 focus:bg-white' 
                        : 'border-gray-300 focus:border-blue-500 focus:bg-white'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-gray-900 placeholder:text-gray-500
                    `}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`
                      w-full pl-11 pr-12 py-3 bg-white border rounded-xl text-sm
                      transition-all duration-200
                      ${error && !password 
                        ? 'border-red-500/50 focus:border-red-500 focus:bg-white' 
                        : 'border-gray-300 focus:border-blue-500 focus:bg-white'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-gray-900 placeholder:text-gray-500
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 animate-in slide-in-from-top-2">
                  <div className="w-1 h-full bg-red-500 rounded-full flex-shrink-0" />
                  <p className="text-sm text-red-600 leading-relaxed flex-1">{error}</p>
                </div>
              )}

              {/* Options */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full mt-6 py-3.5 rounded-xl font-semibold text-sm text-white
                  bg-blue-600
                  hover:bg-blue-700
                  hover:shadow-xl hover:shadow-blue-500/30
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                  transition-all duration-200
                  flex items-center justify-center gap-2 group
                "
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Need access?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/request-access')}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                >
                  Request an account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: '🔒', label: 'Secure', desc: 'Blockchain Verified' },
            { icon: '⚡', label: 'Fast', desc: 'Instant Access' },
            { icon: '✓', label: 'Trusted', desc: '99.9% Uptime' },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="px-3 py-3 bg-white rounded-xl border border-gray-200 text-center hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-xs font-bold text-gray-900">{feature.label}</div>
              <div className="text-[10px] text-gray-600">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Demo Badge */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-700">Demo Mode Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
