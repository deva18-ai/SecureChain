import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';

const workflow = [
  { title: 'Manager requests a protected operation.', text: 'Transfer, freeze, update, or access changes begin as requests.' },
  { title: 'Request enters Pending Owner Approval.', text: 'Protected work is held until the trusted root reviews it.' },
  { title: 'Owner reviews and approves or rejects.', text: 'The decision is explicit and recorded for traceability.' },
  { title: 'Approved action is executed.', text: 'Only approved operations move into execution.' },
  { title: 'Audit and blockchain records are created.', text: 'The completed workflow is preserved for verification.' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Unable to sign in. Please check your credentials.');
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
    <div id="loginScreen" className="min-h-screen flex items-center justify-center p-4 relative">
      <button className="login-back" onClick={() => navigate('/')}>
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

          {workflow.map((step) => (
            <div className="flow-step" key={step.title}>
              <div className="flow-dot" />
              <div className="flow-text">
                <b>{step.title}</b><br />
                {step.text}
              </div>
            </div>
          ))}
        </div>

        <div className="login-right">
          <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Sign In</h3>
          <div className="page-sub" style={{ marginBottom: 18, color: '#8991a3', fontSize: 13 }}>
            Access the SecureChain control center.
          </div>

          <div className="field">
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              placeholder="you@securechain.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="current-password"
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
