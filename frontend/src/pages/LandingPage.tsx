import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  FileText,
  Blocks,
  Key,
  Box,
  Activity,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';

const features = [
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Owner, Manager, and Employee roles each see exactly what they\'re permitted to \u2014 enforced in code, not just hidden UI.',
  },
  {
    icon: FileText,
    title: 'Owner Approval Workflow',
    desc: 'Managers submit requests for protected operations; nothing executes until the Owner reviews and approves it.',
  },
  {
    icon: Blocks,
    title: 'Blockchain-Verified Records',
    desc: 'Every executed action is written to the blockchain ledger with a transaction ID, block number, and confirmation status.',
  },
  {
    icon: Key,
    title: 'Digital Identity (DID)',
    desc: 'Every user holds a decentralized identifier anchored to a wallet address instead of a central authority.',
  },
  {
    icon: Activity,
    title: 'Full Audit Trail',
    desc: 'Every login, request, approval, rejection, and edit is logged chronologically for complete traceability.',
  },
  {
    icon: Box,
    title: 'Owner Asset & User Registry',
    desc: 'Owners register employees and assets directly, then grant time-limited edit permissions to managers on request.',
  },
  {
    icon: Shield,
    title: 'Security Center',
    desc: 'Security events highlight blocked Owner-only operations and authorization outcomes from the backend.',
  },
  {
    icon: Zap,
    title: 'Live Dashboard',
    desc: 'Real-time counts of users, assets, pending approvals, and blockchain records tailored to each role.',
  },
];

const flowSteps = [
  'Manager/Admin requests a protected operation (transfer, freeze, update, or edit access).',
  'Request enters Pending Owner Approval \u2014 it cannot be executed directly.',
  'Owner reviews, then approves or rejects.',
  'System executes the action, writes an audit log, and records a blockchain transaction.',
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterPortal = () => {
    navigate('/login');
  };

  const handleExploreFeatures = () => {
    document.getElementById('landingFeatures')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      id="landingScreen"
      className="min-h-screen flex flex-col"
    >
      <header className="landing-nav">
        <div className="brand">
          <div className="brand-mark">
            <svg className="icon" style={{ width: 20, height: 20, stroke: '#eef2ff' }} viewBox="0 0 24 24">
              <path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z" />
            </svg>
          </div>
          <div className="brand-name">SECURECHAIN</div>
        </div>
        <div className="landing-nav-links">
          <a
            href="#landingFeatures"
            onClick={(e) => { e.preventDefault(); handleExploreFeatures(); }}
          >
            Features
          </a>
          <a
            href="#landingFlow"
            onClick={(e) => { e.preventDefault(); document.getElementById('landingFlow')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            How it works
          </a>
          <button className="btn btn-outline btn-sm" onClick={handleEnterPortal}>
            Sign In
          </button>
        </div>
      </header>

      <div className="landing-hero">
        <div className="hero-badge">\u26a1 SecureChain Platform</div>
        <div className="hero-title">Blockchain-secured asset &<br /><span>identity management</span></div>
        <div className="hero-sub">SecureChain gives owners cryptographic control over every protected operation \u2014 while managers work fast and every action is verified, approved, and permanently recorded.</div>
        <div className="hero-ctas">
<button className="btn btn-primary btn-lg" onClick={handleEnterPortal}>
            Enter Portal \u2192
          </button>
          <button className="btn btn-outline btn-lg" onClick={handleExploreFeatures}>
            Explore Features
          </button>
        </div>
        <div className="hero-note">Powered by FastAPI, PostgreSQL, and Hardhat local blockchain</div>
      </div>

      <div className="landing-section" id="landingFeatures">
        <div className="landing-feature-grid">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon className="icon" style={{ width: 18, height: 18 }} />
              </div>
              <div className="feature-title">{feature.title}</div>
              <div className="feature-desc">{feature.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="landing-section" id="landingFlow">
        <div className="landing-flow-wrap">
          <div className="landing-flow-title">How a protected operation gets executed</div>
          {flowSteps.map((step, index) => (
            <div key={index} className="flow-step" style={{ marginBottom: index === flowSteps.length - 1 ? 0 : 14 }}>
              <div className="flow-dot" />
              <div className="flow-text">
                {step.split(' ').map((word, i) => (
                  <span key={i} style={{ fontWeight: i < 2 ? 600 : 400 }}>{word} </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

<footer className="landing-footer">
        SecureChain \u2014 Decentralized Identity, NFT Asset Ownership & Immutable Audit Platform
      </footer>
    </div>
  );
}
