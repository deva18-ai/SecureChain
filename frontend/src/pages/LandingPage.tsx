import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, Blocks, Key, Box, Activity, Zap, ArrowRight, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/helpers';

const features = [
  {
    icon: Key,
    title: 'Digital Identity',
    desc: 'Decentralized identifiers anchored to wallet addresses — no central authority required.',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Owner, Manager, Employee roles with cryptographically enforced permissions.',
    color: 'green',
  },
  {
    icon: Box,
    title: 'Digital Asset Ownership',
    desc: 'Blockchain-verified assets with immutable ownership records and transfer history.',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Owner Approval Workflow',
    desc: 'Protected operations require explicit Owner approval before execution.',
    color: 'amber',
  },
  {
    icon: Blocks,
    title: 'Blockchain-Verified Records',
    desc: 'Every action recorded on-chain with transaction ID, block height, and confirmations.',
    color: 'blue',
  },
  {
    icon: Activity,
    title: 'Security Center',
    desc: 'Real-time monitoring of authorization events, blocked attempts, and audit trails.',
    color: 'red',
  },
  {
    icon: FileText,
    title: 'Full Audit Trail',
    desc: 'Chronological logs of every login, request, approval, and system event.',
    color: 'gray',
  },
  {
    icon: Zap,
    title: 'Live Dashboard',
    desc: 'Real-time metrics for users, assets, pending approvals, and blockchain status.',
    color: 'green',
  },
];

const workflowSteps = [
  { label: 'MANAGER', desc: 'Requests protected operation', icon: Users, color: 'blue' },
  { label: 'REQUEST', desc: 'Enters pending approval queue', icon: FileText, color: 'amber' },
  { label: 'OWNER APPROVAL', desc: 'Reviews and decides', icon: Shield, color: 'blue' },
  { label: 'EXECUTION', desc: 'Approved action executes', icon: Zap, color: 'green' },
  { label: 'AUDIT', desc: 'Logged immutably', icon: Activity, color: 'blue' },
  { label: 'BLOCKCHAIN', desc: 'Recorded on-chain', icon: Blocks, color: 'blue' },
];

const iconBgColors: Record<string, string> = {
  blue: 'bg-primary-blue/10 text-primary-blue',
  green: 'bg-success-bg text-success',
  violet: 'bg-violet-100 text-violet-800',
  amber: 'bg-warning-bg text-warning',
  red: 'bg-danger-bg text-danger',
  gray: 'bg-gray-100 text-gray-600',
};

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterPortal = () => {
    navigate('/login');
  };

  const handleExploreFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-blue flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-gray-900 tracking-tight">SecureChain</div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">Blockchain Identity Platform</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              <a
                href="#features"
                onClick={(e) => { e.preventDefault(); handleExploreFeatures(); }}
                className="text-sm font-medium text-gray-600 hover:text-primary-blue transition-colors"
              >
                Features
              </a>
              <a
                href="#workflow"
                onClick={(e) => { e.preventDefault(); document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-sm font-medium text-gray-600 hover:text-primary-blue transition-colors"
              >
                How it works
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-gray-600 hover:text-primary-blue transition-colors"
              >
                About
              </a>
              <Button variant="primary" size="sm" onClick={handleEnterPortal} className="ml-4">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </nav>
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50 px-6 md:px-12 py-20 md:py-28 lg:py-36" aria-labelledby="hero-title">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
        
        <div className="relative max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-xs font-semibold tracking-wider uppercase mb-6 md:mb-8">
                <span className="w-2 h-2 bg-primary-blue rounded-full animate-pulse" />
                BLOCKCHAIN-POWERED SECURITY
              </div>
              <h1 id="hero-title" className="font-heading font-bold tracking-tight leading-[1.1] mb-6 md:mb-8">
                <span className="block text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-2">SecureChain</span>
                <span className="block text-4xl md:text-5xl lg:text-6xl text-primary-blue">
                  Identity. Access. Ownership.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 md:mb-10 lg:mb-12 max-w-xl mx-auto lg:mx-0">
                A decentralized platform for secure identity management, role-based access control, and digital asset management. Built on blockchain. Designed for trust.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleEnterPortal} 
                  className="w-full sm:w-auto px-8 shadow-sm"
                >
                  Enter Portal
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleExploreFeatures} 
                  className="w-full sm:w-auto px-8"
                >
                  Explore Features
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-6 md:mt-8 flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Powered by FastAPI, PostgreSQL, and Hardhat blockchain
              </p>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Key, label: 'Identity', count: '1.2k', color: 'blue' },
                      { icon: Shield, label: 'Security', count: '99.9%', color: 'green' },
                      { icon: Box, label: 'Assets', count: '5.4k', color: 'blue' },
                      { icon: Activity, label: 'Audit', count: '100%', color: 'amber' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', iconBgColors[item.color])}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                        <div className="text-xl font-bold text-gray-900">{item.count}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-primary-blue/5 rounded-xl border border-primary-blue/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                      <div>
                        <div className="text-xs text-gray-600">System Status</div>
                        <div className="text-sm font-semibold text-gray-900">All Systems Operational</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 md:px-12 py-16 md:py-20 bg-white" id="features" aria-labelledby="features-title">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-xs font-semibold tracking-wider uppercase mb-4">
              CORE CAPABILITIES
            </span>
            <h2 id="features-title" className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Enterprise-Grade Security Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive blockchain-powered features designed for maximum security and transparency
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="hover"
                padding="lg"
                className="group"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform', iconBgColors[feature.color])}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="px-6 md:px-12 py-16 md:py-20 bg-gray-50" id="workflow" aria-labelledby="workflow-title">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-xs font-semibold tracking-wider uppercase mb-4">
              PROTECTED OPERATION FLOW
            </span>
            <h2 id="workflow-title" className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              How a Protected Operation Gets Executed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every critical operation follows a strict approval workflow with blockchain verification
            </p>
          </div>

          <Card variant="bordered" padding="xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step.label} className="flex flex-col items-center relative">
                  <div className={cn('w-16 h-16 rounded-xl border-2 border-gray-200 flex items-center justify-center mb-3', iconBgColors[step.color])}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="font-heading font-bold text-xs text-gray-900 text-center mb-1">{step.label}</div>
                  <div className="text-xs text-gray-600 text-center">{step.desc}</div>
                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute top-7 -right-5 h-5 w-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { title: 'Cryptographic Identity', desc: 'DID-based authentication with wallet anchoring', icon: Key, color: 'blue' },
              { title: 'Policy Enforcement', desc: 'RBAC enforced at API and blockchain layer', icon: Shield, color: 'green' },
              { title: 'Immutable Audit', desc: 'Every action recorded on-chain permanently', icon: Blocks, color: 'blue' },
            ].map((item, i) => (
              <Card key={i} variant="hover" padding="lg" className="text-center">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4', iconBgColors[item.color])}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 md:px-12 py-16 md:py-20 bg-white" id="about" aria-labelledby="about-title">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-xs font-semibold tracking-wider uppercase mb-4">
              BUILT FOR TRUST
            </span>
            <h2 id="about-title" className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Designed for Smart India Hackathon
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Production-ready platform built with enterprise-grade technology stack
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Blocks, title: 'Blockchain Backend', desc: 'Hardhat local network with Solidity smart contracts', color: 'blue' },
              { icon: Shield, title: 'FastAPI + PostgreSQL', desc: 'High-performance async API with relational integrity', color: 'green' },
              { icon: Key, title: 'JWT + RBAC', desc: 'Stateless auth with role-based access control', color: 'blue' },
              { icon: Zap, title: 'React + TypeScript', desc: 'Modern frontend with full type safety', color: 'amber' },
            ].map((item, i) => (
              <Card key={i} variant="hover" padding="lg" className="text-center">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4', iconBgColors[item.color])}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-10 md:py-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-blue flex items-center justify-center shadow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-heading font-bold text-lg text-gray-900">SecureChain</div>
                <div className="text-xs text-gray-600">Identity • Access • Ownership</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">Decentralized Identity, Asset Ownership & Immutable Audit Platform</p>
              <p className="text-xs text-gray-500 mt-1">Built for Smart India Hackathon 2026</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}