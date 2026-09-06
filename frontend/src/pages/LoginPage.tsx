import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const demoAccounts = [
  { name: 'Test Admin', email: 'devavardhan.test@gmail.com', password: 'Owner@123', role: '👑 Owner', roleLabel: 'ADMIN' },
  { name: 'Asset Manager', email: 'recipient@test.com', password: 'Manager@123', role: '🛡️ Manager', roleLabel: 'MANAGER' },
  { name: 'User One', email: 'user1@securechain.com', password: 'User@123', role: '👤 Employee', roleLabel: 'USER' },
  { name: 'User Two', email: 'user2@securechain.com', password: 'User@123', role: '👤 Employee', roleLabel: 'USER' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickLogin = async (accountEmail: string, accountPassword: string) => {
    setEmail(accountEmail);
    setPassword(accountPassword);
    await handleLogin();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div
      id="loginScreen"
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      <button
        className="login-back"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="icon" style={{ width: 14, height: 14 }} />
        Back to home
      </button>

      <div className="login-card w-full max-w-4xl">
        <div className="login-left">
          <div className="brand" style={{ marginTop: 26 }}>
            <div className="brand-mark">
              <Shield className="icon" style={{ width: 20, height: 20, stroke: '#eef2ff' }} />
            </div>
            <div className="brand-name">SECURECHAIN</div>
          </div>
          <div className="brand-sub">Blockchain-Powered Secure Asset & Identity Management</div>

          <div className="flow-step">
            <div className="flow-dot" />
            <div className="flow-text"><b>Manager/Admin</b> requests a protected operation (transfer, freeze, update).</div>
          </div>
          <div className="flow-step">
            <div className="flow-dot" />
            <div className="flow-text">Request enters <b>Pending Owner Approval</b> — it cannot be executed directly.</div>
          </div>
          <div className="flow-step">
            <div className="flow-dot" />
            <div className="flow-text"><b>Owner</b> reviews, then approves or rejects.</div>
          </div>
          <div className="flow-step" style={{ marginBottom: 0 }}>
            <div className="flow-dot" />
            <div className="flow-text">System executes the action, writes an <b>audit log</b>, and records a <b>blockchain transaction</b>.</div>
          </div>
        </div>

        <div className="login-right">
          <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Sign In</h3>
          <div className="page-sub" style={{ marginBottom: 18, color: '#8991a3', fontSize: 13 }}>Choose a quick-login account or enter credentials manually.</div>

          <div className="acct-list">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                className="acct"
                onClick={() => handleQuickLogin(account.email, account.password)}
              >
                <div>
                  <div className="acct-role">{account.role}</div>
                  <div className="acct-cred">{account.email} / {account.password}</div>
                </div>
                <div className="acct-use">USE</div>
              </button>
            ))}
          </div>

          <div className="field">
            <label>Email</label>
            <input
              id="loginEmail"
              type="text"
              placeholder="you@securechain.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              id="loginPassword"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="login-error" style={{ display: 'block' }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary btn-block" style={{ marginTop: 8, width: '100%' }} disabled={isLoading} onClick={handleLogin}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}