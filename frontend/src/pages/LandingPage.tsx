import { Link } from 'react-router-dom';
import {
  Shield,
  Box,
  FileText,
  Users,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle,
  Zap,
  Network,
  Database,
  Code,
  Eye,
  Layers,
  ArrowRightLeft,
  Key,
  Gem,
  ScrollText,
  BarChart3,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const features = [
  {
    icon: Key,
    title: 'Decentralized Identity (DID)',
    description: 'Create and manage W3C-compliant decentralized identifiers with cryptographic proofs stored on-chain.',
    benefits: ['Self-sovereign identity', 'Cryptographic verification', 'Wallet integration', 'Immutable records'],
  },
  {
    icon: Gem,
    title: 'NFT Asset Ownership',
    description: 'Mint, allocate, and transfer digital assets as ERC-721 NFTs with full ownership history on blockchain.',
    benefits: ['ERC-721 standard', 'Metadata support', 'Transfer history', 'Role-based allocation'],
  },
  {
    icon: Shield,
    title: 'Smart Contract Security',
    description: 'OpenZeppelin-based contracts with AccessControl, reentrancy protection, and comprehensive audit trails.',
    benefits: ['AccessControl RBAC', 'ReentrancyGuard', 'Event logging', 'Formal verification ready'],
  },
  {
    icon: Users,
    title: 'Role-Based Access Control',
    description: 'Four-tier permission system (Admin, Manager, Auditor, User) enforced both on-chain and off-chain.',
    benefits: ['Granular permissions', 'On-chain enforcement', 'Off-chain validation', 'Audit compliance'],
  },
  {
    icon: FileText,
    title: 'Immutable Audit Trail',
    description: 'Every critical operation creates an immutable audit record with blockchain verification capability.',
    benefits: ['Tamper-evident logs', 'Blockchain verification', 'Real-time monitoring', 'Compliance ready'],
  },
  {
    icon: Network,
    title: 'Blockchain Verification',
    description: 'Auditors can verify any transaction, asset ownership, or identity proof directly on the blockchain.',
    benefits: ['Real-time verification', 'Transaction lookup', 'Event parsing', 'Explorer integration'],
  },
];

const techStack = [
  { icon: Code, name: 'React 18 + TypeScript', category: 'Frontend' },
  { icon: Database, name: 'FastAPI + PostgreSQL', category: 'Backend' },
  { icon: Layers, name: 'Solidity + Hardhat', category: 'Blockchain' },
  { icon: Eye, name: 'OpenZeppelin + Ethers.js', category: 'Smart Contracts' },
  { icon: Zap, name: 'Tailwind CSS + Vite', category: 'Styling & Build' },
  { icon: BarChart3, name: 'Recharts + TanStack Query', category: 'Data & State' },
];

const roles = [
  { role: 'ADMIN', color: 'bg-purple-500', permissions: ['Full system access', 'User management', 'Role assignment', 'Identity creation', 'Asset minting', 'System config'] },
  { role: 'MANAGER', color: 'bg-blue-500', permissions: ['Asset management', 'Asset allocation', 'Transfer approval', 'Audit viewing'] },
  { role: 'AUDITOR', color: 'bg-green-500', permissions: ['Read-only audit access', 'Blockchain verification', 'Ownership history', 'Identity proofs'] },
  { role: 'USER', color: 'bg-gray-500', permissions: ['Own identity', 'Own assets', 'Transfer requests', 'Activity view'] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-50 via-white to-dark-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-in">
              <Zap className="h-4 w-4" />
              <span>SIH26125 - SecureChain MVP</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-dark-900 dark:text-white mb-6 animate-in">
              Secure Digital Ownership.<br />
              <span className="gradient-text">Verified Identity.</span><br />
              Immutable Trust.
            </h1>
            <p className="text-lg sm:text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto mb-10 animate-in">
              A production-ready platform for decentralized identity management, NFT-based digital asset ownership,
              and immutable audit trails powered by blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => window.open('https://metamask.io/download/', '_blank')}>
                Connect Wallet
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in">
            {[
              { label: 'OpenZeppelin', value: 'Contracts' },
              { label: 'ERC-721', value: 'Standard' },
              { label: 'EVM', value: 'Compatible' },
              { label: 'TypeScript', value: 'Type Safe' },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-white/50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{item.label}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Background Network Visualization */}
        <div className="absolute inset-0 -z-10 opacity-50" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <rect width="1200" height="600" fill="url(#gridGradient)" />
            <g stroke="#0ea5e9" strokeOpacity="0.1" strokeWidth="0.5">
              {/* Grid lines */}
              {[...Array(20)].map((_, i) => (
                <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="600" />
              ))}
              {[...Array(10)].map((_, i) => (
                <line key={i} x1="0" y1={i * 60} x2="1200" y2={i * 60} />
              ))}
            </g>
            {/* Animated nodes */}
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={(i * 97 + 50) % 1100}
                cy={(i * 73 + 30) % 550}
                r="3"
                fill="#0ea5e9"
                opacity="0.6"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
            {/* Connections */}
            <g stroke="#0ea5e9" strokeOpacity="0.05" strokeWidth="1">
              <line x1="100" y1="100" x2="400" y2="200" />
              <line x1="400" y1="200" x2="700" y2="150" />
              <line x1="700" y1="150" x2="1000" y2="300" />
              <line x1="200" y1="400" x2="500" y2="500" />
              <line x1="500" y1="500" x2="800" y2="450" />
            </g>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Built for <span className="gradient-text">Enterprise Security</span>
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              Every feature is designed with security, compliance, and scalability in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} variant="hover" className="animate-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-dark-600 dark:text-dark-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Complete <span className="gradient-text">Workflow</span>
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              From identity creation to blockchain verification - a seamless secure flow.
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary-500 to-transparent hidden lg:block" aria-hidden="true" />

            {[
              { step: '01', title: 'Create Identity', description: 'Admin creates a DID with cryptographic hash linked to user wallet', icon: Key, color: 'from-purple-500 to-purple-600' },
              { step: '02', title: 'Verify Identity', description: 'Identity verified on-chain creating immutable proof of existence', icon: Shield, color: 'from-blue-500 to-blue-600' },
              { step: '03', title: 'Assign Roles', description: 'Admin assigns Manager/Auditor roles via AccessControl smart contract', icon: Users, color: 'from-green-500 to-green-600' },
              { step: '04', title: 'Mint NFT Asset', description: 'Authorized minter creates ERC-721 asset with metadata and initial owner', icon: Gem, color: 'from-yellow-500 to-orange-500' },
              { step: '05', title: 'Allocate Asset', description: 'Manager allocates asset to user - ownership transferred on-chain', icon: ArrowRightLeft, color: 'from-red-500 to-red-600' },
              { step: '06', title: 'User Transfers', description: 'Owner initiates transfer - approved by manager or direct peer-to-peer', icon: Network, color: 'from-indigo-500 to-indigo-600' },
              { step: '07', title: 'Blockchain Events', description: 'Every action emits events - IdentityCreated, AssetMinted, AssetTransferred', icon: FileText, color: 'from-pink-500 to-pink-600' },
              { step: '08', title: 'Auditor Verifies', description: 'Auditor queries blockchain - verifies tx hash, ownership, timestamps', icon: Eye, color: 'from-teal-500 to-teal-600' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative flex gap-6 mb-12 animate-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="relative z-10 flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center" style={{ background: item.color }}>
                    <Icon className="h-10 w-10 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-primary-600 dark:text-primary-400 px-2 py-1 bg-primary-50 dark:bg-primary-900/30 rounded">{item.step}</span>
                      <h3 className="text-xl font-semibold text-dark-900 dark:text-white">{item.title}</h3>
                    </div>
                    <p className="text-dark-600 dark:text-dark-400 ml-10">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 lg:py-28 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Modern <span className="gradient-text">Technology Stack</span>
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              Built with industry-standard tools for reliability and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <Card key={tech.name} variant="hover" className="text-center p-6 animate-in">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-medium text-dark-900 dark:text-white mb-1">{tech.name}</h3>
                  <p className="text-xs text-dark-500 dark:text-dark-400 uppercase tracking-wider">{tech.category}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 lg:py-28 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Role-Based <span className="gradient-text">Access Control</span>
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400">
              Four distinct roles with granular permissions enforced at every layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => (
              <Card key={role.role} variant="hover" className="p-6 animate-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center`}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white">{role.role}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400 capitalize">Role</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {role.permissions.map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <g stroke="white" strokeOpacity="0.2" strokeWidth="0.5">
              {[...Array(20)].map((_, i) => (
                <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="400" />
              ))}
              {[...Array(7)].map((_, i) => (
                <line key={i} x1="0" y1={i * 60} x2="1200" y2={i * 60} />
              ))}
            </g>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Build <span className="text-yellow-300">Secure Digital Ownership</span>?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10">
            Deploy the complete SecureChain platform locally in minutes. Full blockchain integration,
            role-based access, and immutable audit trails included.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-blue-50 gap-2">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10" onClick={() => window.open('https://github.com', '_blank')}>
              View on GitHub
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}