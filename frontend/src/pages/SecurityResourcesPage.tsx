import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Bug, BookOpen, Globe, Server, Code, FileText,
  AlertTriangle, Database, Lock, Network, Users, ExternalLink,
  ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ResourceCard } from '../components/security';
import { cn } from '../utils/helpers';

const resourceCategories = [
  {
    id: 'web-security',
    title: 'WEB SECURITY',
    description: 'Application security standards, vulnerability classifications, and secure coding practices',
    icon: Shield,
    color: 'cyber-primary',
    resources: [
      {
        name: 'OWASP Top 10',
        category: 'Web Security Standard',
        description: 'The industry-standard awareness document for developers and web application security.',
        icon: Shield,
        url: 'https://owasp.org/www-project-top-ten/',
      },
      {
        name: 'OWASP ASVS',
        category: 'Application Security Verification',
        description: 'Application Security Verification Standard - a framework for testing web app security controls.',
        icon: BookOpen,
        url: 'https://owasp.org/www-project-application-security-verification-standard/',
      },
      {
        name: 'OWASP Cheat Sheet Series',
        category: 'Secure Coding Guidelines',
        description: 'Concise, high-value guidelines for specific security topics (auth, crypto, logging, etc.).',
        icon: FileText,
        url: 'https://cheatsheetseries.owasp.org/',
      },
      {
        name: 'CWE (Common Weakness Enumeration)',
        category: 'Vulnerability Classification',
        description: 'Community-developed list of software and hardware weakness types.',
        icon: Bug,
        url: 'https://cwe.mitre.org/',
      },
    ],
  },
  {
    id: 'threat-intelligence',
    title: 'THREAT INTELLIGENCE',
    description: 'Adversary tactics, vulnerability databases, and security advisories',
    icon: AlertTriangle,
    color: 'cyber-warning',
    resources: [
      {
        name: 'MITRE ATT&CK',
        category: 'Adversary Tactics & Techniques',
        description: 'Globally-accessible knowledge base of adversary tactics and techniques based on real-world observations.',
        icon: Network,
        url: 'https://attack.mitre.org/',
      },
      {
        name: 'CISA Alerts & Advisories',
        category: 'Government Security Advisories',
        description: 'Official cybersecurity alerts, vulnerability advisories, and best practices from CISA.',
        icon: Globe,
        url: 'https://www.cisa.gov/uscert/ncas/current-activity',
      },
      {
        name: 'NVD (National Vulnerability Database)',
        category: 'Vulnerability Database',
        description: 'U.S. government repository of standards-based vulnerability management data (CVE).',
        icon: Database,
        url: 'https://nvd.nist.gov/',
      },
      {
        name: 'CVE (Common Vulnerabilities and Exposures)',
        category: 'Vulnerability Identifiers',
        description: 'Dictionary of common names for publicly known cybersecurity vulnerabilities.',
        icon: Bug,
        url: 'https://cve.mitre.org/',
      },
    ],
  },
  {
    id: 'security-standards',
    title: 'SECURITY STANDARDS & FRAMEWORKS',
    description: 'Authoritative frameworks for building and assessing security programs',
    icon: BookOpen,
    color: 'cyber-secondary',
    resources: [
      {
        name: 'NIST Cybersecurity Framework (CSF)',
        category: 'Risk Management Framework',
        description: 'Voluntary framework for managing cybersecurity risk - Identify, Protect, Detect, Respond, Recover.',
        icon: Shield,
        url: 'https://www.nist.gov/cyberframework',
      },
      {
        name: 'NIST SP 800-53',
        category: 'Security & Privacy Controls',
        description: 'Catalog of security and privacy controls for federal information systems and organizations.',
        icon: Lock,
        url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
      },
      {
        name: 'SANS Critical Security Controls',
        category: 'Prioritized Defense Actions',
        description: 'Prioritized set of actions to defend against prevalent cyber attacks (CIS Controls).',
        icon: BookOpen,
        url: 'https://www.sans.org/cis-critical-security-controls/',
      },
      {
        name: 'CERT-In Guidelines',
        category: 'Indian Cybersecurity Directives',
        description: 'Indian Computer Emergency Response Team guidelines for incident reporting and security practices.',
        icon: Globe,
        url: 'https://www.cert-in.org.in/',
      },
    ],
  },
  {
    id: 'blockchain-security',
    title: 'BLOCKCHAIN & SMART CONTRACT SECURITY',
    description: 'Specialized resources for securing decentralized applications and smart contracts',
    icon: Code,
    color: 'cyber-success',
    resources: [
      {
        name: 'OpenZeppelin Security',
        category: 'Smart Contract Libraries',
        description: 'Industry-standard library for secure smart contract development with audited implementations.',
        icon: Code,
        url: 'https://openzeppelin.com/contracts/',
      },
      {
        name: 'Solidity Security Documentation',
        category: 'Language Security Patterns',
        description: 'Official Solidity documentation on security considerations, common pitfalls, and best practices.',
        icon: FileText,
        url: 'https://docs.soliditylang.org/en/latest/security-considerations.html',
      },
      {
        name: 'OpenSSF (Open Source Security Foundation)',
        category: 'Supply Chain Security',
        description: 'Cross-industry collaboration for securing open source software supply chains.',
        icon: Network,
        url: 'https://openssf.org/',
      },
      {
        name: 'Smart Contract Weakness Classification (SWC)',
        category: 'Smart Contract Vulnerabilities',
        description: 'Classification of smart contract weaknesses aligned with CWE, maintained by MythX.',
        icon: Bug,
        url: 'https://swcregistry.io/',
      },
      {
        name: 'ConsenSys Diligence / MythX',
        category: 'Smart Contract Analysis',
        description: 'Professional smart contract auditing services and automated analysis tools.',
        icon: Shield,
        url: 'https://consensys.net/diligence/',
      },
    ],
  },
];

export default function SecurityResourcesPage() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cyber-text">Cybersecurity Resources</h1>
          <p className="text-cyber-textMuted">
            Trusted security standards, frameworks, and vulnerability intelligence for security professionals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-cyber-textMuted">
            {resourceCategories.reduce((acc, cat) => acc + cat.resources.length, 0)} curated resources
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {resourceCategories.map((category) => {
          const isExpanded = expandedCategories[category.id];
          const Icon = category.icon;

          return (
            <Card key={category.id} className="overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-cyber-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', `bg-${category.color}/10 text-${category.color}`)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-cyber-text">{category.title}</h3>
                    <p className="text-sm text-cyber-textMuted">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    {category.resources.length} Resources
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-cyber-textMuted" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-cyber-textMuted" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-cyber-border p-6 animate-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.resources.map((resource) => (
                      <ResourceCard
                        key={resource.name}
                        name={resource.name}
                        category={resource.category}
                        description={resource.description}
                        icon={<resource.icon className="h-6 w-6" />}
                        url={resource.url}
                        color={category.color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Reference */}
      <Card className="p-6">
        <h2 className="text-lg font-heading font-semibold text-cyber-text mb-6">Quick Reference Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'OWASP Top 10 2023', url: 'https://owasp.org/www-project-top-ten/', icon: Shield },
            { label: 'MITRE ATT&CK Matrix', url: 'https://attack.mitre.org/matrices/enterprise/', icon: Network },
            { label: 'NIST CSF 2.0', url: 'https://www.nist.gov/cyberframework', icon: BookOpen },
            { label: 'CISA Known Exploited Vulnerabilities', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', icon: AlertTriangle },
            { label: 'OpenZeppelin Contracts', url: 'https://github.com/OpenZeppelin/openzeppelin-contracts', icon: Code },
            { label: 'Solidity Security', url: 'https://docs.soliditylang.org/en/latest/security-considerations.html', icon: FileText },
            { label: 'SWC Registry', url: 'https://swcregistry.io/', icon: Bug },
            { label: 'CWE Top 25', url: 'https://cwe.mitre.org/top25/archive/2023/2023_cwe_top25.html', icon: Database },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-cyber-elevated/50 border border-cyber-border/50 hover:border-cyber-primary/50 hover:bg-cyber-elevated transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyber-primary/10 text-cyber-primary flex items-center justify-center flex-shrink-0 group-hover:bg-cyber-primary group-hover:text-cyber-bg transition-colors">
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-cyber-text text-sm group-hover:text-cyber-primary transition-colors truncate">
                  {link.label}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-cyber-textMuted group-hover:text-cyber-primary transition-colors" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}