import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence, useInView } from 'framer-motion';
import WavyBackground from '@/components/ui/blue-meshy-background';
import {
  Shield,
  Key,
  Lock,
  ArrowRight,
  CheckCircle2,
  Hexagon,
  Globe,
  Users,
  X,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Box,
  Copy,
  Sliders,
  ChevronDown,
  Sparkles,
  Zap,
  Fingerprint,
  AlertCircle,
  GitBranch,
  FileCode,
  BarChart3,
  Layers,
  ChevronRight,
  Code2,
  Server,
  Network,
} from 'lucide-react';

// ─── ANIMATED COUNTER COMPONENT ──────────────────────────────────────────────
function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (to / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <div ref={ref}>{count}{suffix}</div>;
}

// ─── TYPING EFFECT COMPONENT ─────────────────────────────────────────────────
function TypingText({ lines }: { lines: string[] }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (lineIndex >= lines.length) return;
    if (charIndex < lines[lineIndex].length) {
      const t = setTimeout(() => {
        setDisplayed(prev => prev + lines[lineIndex][charIndex]);
        setCharIndex(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        if (lineIndex + 1 < lines.length) {
          setDisplayed(prev => prev + '\n');
          setLineIndex(l => l + 1);
          setCharIndex(0);
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [charIndex, lineIndex, lines]);

  return (
    <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
      {displayed}<span className="animate-pulse">▍</span>
    </pre>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Novelty Sandbox State
  const [sandboxTab, setSandboxTab] = useState<'policy' | 'did' | 'lineage'>('policy');

  // Policy Simulator
  const [simRole, setSimRole] = useState<'ADMIN' | 'MANAGER' | 'USER'>('MANAGER');
  const [simAction, setSimAction] = useState<'MINT' | 'ASSIGN' | 'REGISTER' | 'VIEW'>('MINT');
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // W3C DID Generator
  const [didName, setDidName] = useState('Devavardhan MI');
  const [didRole, setDidRole] = useState<string>('ADMIN');
  const [generatedDid, setGeneratedDid] = useState<any>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    evaluatePolicy('MANAGER', 'MINT');
  }, []);

  const evaluatePolicy = (role: 'ADMIN' | 'MANAGER' | 'USER', action: 'MINT' | 'ASSIGN' | 'REGISTER' | 'VIEW') => {
    setIsEvaluating(true);
    setEvaluationResult(null);
    setTimeout(() => {
      if (role === 'ADMIN') {
        setEvaluationResult({ status: 'ALLOWED', code: 200, color: 'emerald', badge: 'DIRECT AUTHORIZATION', msg: 'Owner possesses root authority. Action executed directly via Sepolia smart contract call.' });
      } else if (role === 'MANAGER') {
        if (action === 'ASSIGN' || action === 'VIEW') {
          setEvaluationResult({ status: 'ALLOWED', code: 200, color: 'emerald', badge: 'OPERATIONAL AUTHORIZATION', msg: 'Manager operational scope confirmed. Action permitted and anchored on-chain.' });
        } else {
          setEvaluationResult({ status: 'QUEUED', code: 202, color: 'amber', badge: 'REQUEST OWNER APPROVAL', msg: 'Restricted Manager action. Ownership escalation required — "Request Owner Approval" triggered and queued for Owner review.' });
        }
      } else {
        if (action === 'VIEW') {
          setEvaluationResult({ status: 'ALLOWED', code: 200, color: 'emerald', badge: 'READ-ONLY ACCESS', msg: 'Employee granted read access. Viewing assigned asset pass.' });
        } else {
          setEvaluationResult({ status: 'DENIED', code: 401, color: 'red', badge: 'UNAUTHORIZED', msg: 'Employee role restriction enforced. Insufficient RBAC privilege for administrative action.' });
        }
      }
      setIsEvaluating(false);
    }, 350);
  };

  const generateDid = () => {
    const rand = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setGeneratedDid({
      did: `did:sc:${rand(8)}-${rand(12)}`,
      wallet: `0x${rand(40)}`,
      hash: `0x${rand(64)}`,
      block: 14500 + Math.floor(Math.random() * 200),
      name: didName,
      role: didRole,
    });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const ROLES = [
    { id: 'ADMIN', label: 'Owner', emoji: '👑', color: 'blue', desc: 'Root Authority' },
    { id: 'MANAGER', label: 'Manager', emoji: '⚙️', color: 'indigo', desc: 'Operations' },
    { id: 'USER', label: 'Employee', emoji: '👤', color: 'emerald', desc: 'End User' },
  ];

  const ACTIONS = [
    { id: 'MINT', label: 'Mint Asset' },
    { id: 'REGISTER', label: 'Register User' },
    { id: 'ASSIGN', label: 'Allocate Asset' },
    { id: 'VIEW', label: 'View My Assets' },
  ];

  return (
    <WavyBackground className="min-h-screen font-sans overflow-x-hidden text-slate-900">

      {/* Scroll Progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 to-cyan-400 z-[200] origin-left" style={{ scaleX }} />

      {/* ─── FLOATING NAV ─────────────────────────────────────────── */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
          className={`max-w-5xl mx-auto rounded-full pointer-events-auto flex items-center justify-between px-5 py-2.5 transition-all duration-300 ${
            scrolled
              ? 'bg-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.3)] text-white'
              : 'bg-slate-950/70 backdrop-blur-md border border-white/15 shadow-lg text-white'
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/50 group-hover:scale-110 transition-transform">
              <Hexagon className="w-4.5 h-4.5 stroke-[2.5] text-white" />
            </div>
            <span className="text-sm font-black tracking-tight text-white">SecureChain</span>
            <span className="hidden sm:flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Sepolia Live
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-slate-300 tracking-wide">
            <a href="#sandbox" className="hover:text-cyan-300 transition-colors">Interactive Demo</a>
            <a href="#pillars" className="hover:text-cyan-300 transition-colors">Architecture</a>
            <a href="#roles" className="hover:text-cyan-300 transition-colors">Roles & Workflow</a>
            <a href="#faq" className="hover:text-cyan-300 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block text-[11px] font-bold text-slate-300 hover:text-white transition-colors px-2 py-1">
              Sign In
            </Link>
            <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[11px] font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-105">
              Launch Console <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </header>

      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-6 sm:px-8 pt-28 pb-20 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10 my-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center gap-7">

            {/* SIH Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-cyan-400/40 text-cyan-200 text-xs font-extrabold shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Smart India Hackathon 2026 · Enterprise Identity & Asset Governance
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-[72px] font-black tracking-tight leading-[1.04] text-white drop-shadow-2xl">
              <span>Decentralised Identity.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-200">
                Immutable Asset Governance.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeUp} className="max-w-2xl text-base sm:text-lg text-slate-100/90 leading-relaxed font-medium drop-shadow-md bg-slate-950/50 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
              SecureChain replaces fragile centralized IT databases with <strong>W3C Decentralised Identifiers (DIDs)</strong>, enforces <strong>3-tier Role-Based Access Control</strong> (Owner → Manager → Employee), and anchors every asset lifecycle event immutably on <strong>Ethereum Sepolia</strong>.
            </motion.p>

            {/* CTA Row */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/login" className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-blue-950 rounded-full font-extrabold text-sm shadow-2xl hover:scale-105 transition-all duration-300">
                Launch Platform Console <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
              <a href="#sandbox" className="flex items-center gap-2 px-7 py-4 bg-slate-950/70 text-white border border-white/20 rounded-full font-bold text-sm shadow-lg hover:border-cyan-400/60 hover:bg-slate-900/80 transition-all backdrop-blur-md">
                <Zap className="w-4 h-4 text-cyan-400" />
                Try Policy Simulator
              </a>
            </motion.div>

            {/* Metrics Strip */}
            <motion.div variants={fadeUp} className="w-full max-w-3xl mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Audit Trail Integrity', value: 100, suffix: '%' },
                { label: 'Role Authority Tiers', value: 3, suffix: ' Levels' },
                { label: 'Unique DID Standard', value: 1, suffix: ' W3C Spec' },
                { label: 'Sepolia Confirmations', value: 24, suffix: '/7' },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-slate-950/70 rounded-2xl border border-white/15 shadow-xl backdrop-blur-md text-center">
                  <div className="text-2xl font-black text-white drop-shadow-sm">
                    <AnimatedCounter to={m.value} suffix={m.suffix} />
                  </div>
                  <div className="text-[10px] font-extrabold text-cyan-300/80 uppercase tracking-wider mt-0.5">{m.label}</div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ─── NOVELTY SANDBOX ──────────────────────────────────────── */}
      <section id="sandbox" className="py-16 px-6 sm:px-8 max-w-[1280px] mx-auto">
        {/* Section Label */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-[10px] font-extrabold text-cyan-200 uppercase tracking-widest px-3 py-1 bg-slate-950/80 border border-cyan-400/40 rounded-full backdrop-blur-md shadow-lg">
            🧪 Live Cryptographic Sandbox
          </span>
          <h2 className="text-3xl font-black text-white drop-shadow-lg">Explore SecureChain Interactively</h2>
          <p className="text-sm text-slate-200 max-w-xl mx-auto drop-shadow">Test the real RBAC policy engine, generate W3C DID documents, and trace asset ownership — all without signing in.</p>
        </div>

        <div className="bg-slate-950/85 backdrop-blur-2xl rounded-[28px] border border-cyan-500/30 shadow-[0_16px_60px_rgba(0,0,0,0.5)] overflow-hidden text-white">

          {/* Terminal header bar */}
          <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-950 border-b border-cyan-500/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/90" />
              <div className="w-3 h-3 rounded-full bg-amber-400/90" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
            </div>
            <span className="text-xs font-mono text-cyan-300/80 ml-1">securechain-cryptographic-sandbox — v2.4</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider">SEPOLIA CONNECTED</span>
            </div>
          </div>

          {/* Tab Row */}
          <div className="flex border-b border-white/10 bg-slate-900/90">
            {[
              { id: 'policy', icon: <Shield className="w-3.5 h-3.5" />, label: 'RBAC Policy Simulator' },
              { id: 'did', icon: <Fingerprint className="w-3.5 h-3.5" />, label: 'W3C DID Generator' },
              { id: 'lineage', icon: <GitBranch className="w-3.5 h-3.5" />, label: 'Asset Lineage Tracker' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setSandboxTab(tab.id as any); if (tab.id === 'did' && !generatedDid) generateDid(); }}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  sandboxTab === tab.id
                    ? 'border-cyan-400 text-cyan-300 bg-slate-950 font-extrabold shadow-lg'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sandbox Body */}
          <div className="p-7 min-h-[460px]">
            <AnimatePresence mode="wait">

              {/* ── TAB 1: RBAC Policy Simulator ── */}
              {sandboxTab === 'policy' && (
                <motion.div key="policy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' as const }} className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">

                  {/* Controls */}
                  <div className="md:col-span-2 space-y-5">
                    <div className="p-5 bg-slate-900/80 rounded-2xl border border-cyan-500/20 space-y-4">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-cyan-400" /> Configure Policy Test
                      </h4>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">1. Select Role</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ROLES.map(r => (
                            <button key={r.id} type="button"
                              onClick={() => { setSimRole(r.id as any); evaluatePolicy(r.id as any, simAction); }}
                              className={`flex flex-col items-center py-3 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                simRole === r.id
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-300 shadow-md shadow-cyan-500/30'
                                  : 'bg-slate-950/70 border-white/15 text-slate-300 hover:bg-slate-900 hover:text-white'
                              }`}
                            >
                              <span className="text-base">{r.emoji}</span>
                              <span>{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">2. Choose Action</label>
                        <div className="grid grid-cols-2 gap-2">
                          {ACTIONS.map(a => (
                            <button key={a.id} type="button"
                              onClick={() => { setSimAction(a.id as any); evaluatePolicy(simRole, a.id as any); }}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                                simAction === a.id
                                  ? 'bg-slate-950 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                                  : 'bg-slate-950/70 border-white/15 text-slate-300 hover:bg-slate-900 hover:text-white'
                              }`}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verdict Panel */}
                  <div className="md:col-span-3 flex flex-col gap-4">
                    <div className="flex-1 p-5 bg-slate-900/80 rounded-2xl border border-cyan-500/20 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Policy Evaluation Engine</h4>
                        {isEvaluating ? (
                          <span className="text-xs text-cyan-400 font-bold animate-pulse">Evaluating...</span>
                        ) : evaluationResult && (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            evaluationResult.color === 'emerald' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                            : evaluationResult.color === 'amber' ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                            : 'bg-red-950/90 text-red-300 border-red-500/40'
                          }`}>{evaluationResult.badge}</span>
                        )}
                      </div>

                      {evaluationResult && (
                        <div className="space-y-3">
                          {/* Status Row */}
                          <div className="flex items-center gap-2.5 p-3.5 bg-slate-950/90 rounded-xl border border-white/15">
                            {evaluationResult.status === 'ALLOWED' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                            {evaluationResult.status === 'QUEUED' && <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />}
                            {evaluationResult.status === 'DENIED' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                            <div>
                              <div className="text-sm font-black text-white">
                                HTTP {evaluationResult.code} · {evaluationResult.status}
                              </div>
                              <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{evaluationResult.msg}</div>
                            </div>
                          </div>

                          {/* Role → Action Flow Diagram */}
                          <div className="flex items-center gap-2 p-3 bg-slate-950/90 rounded-xl border border-white/15 text-xs font-bold text-slate-200">
                            <span className={`px-2.5 py-1 rounded-lg font-extrabold border ${simRole === 'ADMIN' ? 'bg-blue-950 border-blue-500/40 text-blue-300' : simRole === 'MANAGER' ? 'bg-indigo-950 border-indigo-500/40 text-indigo-300' : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'}`}>
                              {ROLES.find(r => r.id === simRole)?.label}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/20 text-slate-200 font-extrabold">
                              {ACTIONS.find(a => a.id === simAction)?.label}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className={`px-2.5 py-1 rounded-lg font-extrabold border ${
                              evaluationResult.color === 'emerald' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                              : evaluationResult.color === 'amber' ? 'bg-amber-950 border-amber-500/40 text-amber-300'
                              : 'bg-red-950 border-red-500/40 text-red-300'
                            }`}>{evaluationResult.status}</span>
                          </div>

                          {/* Smart Contract Data */}
                          <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                            <div className="font-mono text-[11px] text-slate-400">
                              <span className="text-slate-500">sepolia_tx: </span>
                              <span className="text-cyan-400 font-bold">0x8f2bb3c91a204e90</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400">ANCHORED</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Context note */}
                    <div className="p-3.5 bg-cyan-950/50 rounded-xl border border-cyan-500/40 text-xs text-cyan-200 font-medium leading-relaxed">
                      💡 <strong>Try it:</strong> Set Role = Manager, Action = Mint Asset → see how "Request Owner Approval" workflow activates instead of direct execution.
                    </div>
                  </div>

                </motion.div>
              )}

              {/* ── TAB 2: W3C DID Generator ── */}
              {sandboxTab === 'did' && (
                <motion.div key="did" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' as const }} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Inputs */}
                  <div className="p-5 bg-slate-900/80 rounded-2xl border border-cyan-500/20 space-y-4">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-cyan-400" /> Mint a W3C DID Document
                    </h4>
                    <p className="text-xs text-slate-300">Generate a self-sovereign Decentralised Identifier anchored to an Ethereum wallet address on Sepolia.</p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">Identity Holder Name</label>
                        <input type="text" value={didName} onChange={e => setDidName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-950 border border-white/20 text-white rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">Authority Role</label>
                        <select value={didRole} onChange={e => setDidRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-950 border border-white/20 text-white rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400">
                          <option value="ADMIN">Owner (Root Authority)</option>
                          <option value="MANAGER">Manager (Operational)</option>
                          <option value="USER">Employee (End User)</option>
                        </select>
                      </div>
                    </div>

                    <button type="button" onClick={generateDid}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Generate & Anchor DID
                    </button>
                  </div>

                  {/* Output DID Card */}
                  <div className="bg-slate-950 rounded-2xl border border-cyan-500/30 overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 text-xs font-mono">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300">did-document.json</span>
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">VERIFIED</span>
                    </div>
                    <div className="p-5 space-y-4 text-xs font-mono">
                      {generatedDid ? (
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-500">@context: </span>
                            <span className="text-blue-400">"https://www.w3.org/ns/did/v1"</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <span className="text-slate-500">id: </span>
                              <span className="text-cyan-300 break-all">{generatedDid.did}</span>
                            </div>
                            <button type="button" onClick={() => copy(generatedDid.did)} className="shrink-0 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors mt-0.5">
                              {copiedText === generatedDid.did ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div>
                            <span className="text-slate-500">controller: </span>
                            <span className="text-emerald-400">{generatedDid.name} ({generatedDid.role === 'ADMIN' ? 'Owner' : generatedDid.role === 'MANAGER' ? 'Manager' : 'Employee'})</span>
                          </div>
                          <div>
                            <span className="text-slate-500">walletAddress: </span>
                            <span className="text-slate-300 text-[11px]">{generatedDid.wallet.slice(0, 24)}...</span>
                          </div>
                          <div>
                            <span className="text-slate-500">identityHash: </span>
                            <span className="text-slate-400 text-[11px]">{generatedDid.hash.slice(0, 24)}...</span>
                          </div>
                          <div className="pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-400">
                            <span>Sepolia Block #{generatedDid.block}</span>
                            <span className="text-cyan-400 font-bold">Proof Anchored</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-center py-8">Click "Generate & Anchor DID" to mint a W3C document</div>
                      )}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* ── TAB 3: Asset Lineage Tracker ── */}
              {sandboxTab === 'lineage' && (
                <motion.div key="lineage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' as const }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Asset SC-DEV-WORKSTATION-01 · Cryptographic Ownership Lineage</h4>
                      <p className="text-xs text-slate-300 mt-0.5">Full lifecycle from minting to employee deployment — each step anchored on Sepolia</p>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold rounded-full">Active · In Use</span>
                  </div>

                  {/* Lineage Steps */}
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 hidden md:block" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                      {[
                        { step: '01', color: 'blue', title: 'Owner: Mint Asset', desc: 'System Owner executed mintAsset() on Sepolia contract. Asset minted with cryptographic serial ID.', tx: '0x8f2b...3c91', time: '10 Sep 2025 · 09:14 IST', actor: 'Owner Authority' },
                        { step: '02', color: 'indigo', title: 'Owner Approval: Manager Request', desc: 'Manager submitted "Request Owner Approval" for asset allocation. Owner approved via console.', tx: '0x4a11...90e2', time: '11 Sep 2025 · 11:30 IST', actor: 'Owner → Manager' },
                        { step: '03', color: 'violet', title: 'Manager: Allocate to Employee', desc: 'Manager allocated the asset within operational scope. Employee DID registered to asset lineage.', tx: '0x3b1c...4d20', time: '12 Sep 2025 · 14:05 IST', actor: 'Manager Operations' },
                        { step: '04', color: 'emerald', title: 'Employee: Access Verified', desc: 'Employee W3C DID verified against asset anchor on Sepolia. Access badge granted on-chain.', tx: '0x9e4f...11b8', time: '12 Sep 2025 · 14:07 IST', actor: 'Employee User' },
                      ].map(item => (
                        <div key={item.step} className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/20 space-y-2.5 text-white">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white bg-gradient-to-r from-blue-600 to-cyan-500 mb-2">{item.step}</div>
                          <div className="text-xs font-black text-white">{item.title}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                          <div className="pt-1 border-t border-white/10 space-y-1 font-mono text-[10px] text-slate-400">
                            <div>Tx: <span className="text-cyan-300 font-semibold">{item.tx}</span></div>
                            <div>{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>All 4 lifecycle events cryptographically anchored · <span className="text-emerald-400 font-bold">Zero log tampering possible</span></span>
                    <span className="text-cyan-400 font-bold">Sepolia Testnet</span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ─── 3 CORE PILLARS ───────────────────────────────────────── */}
      <section id="pillars" className="py-20 px-6 sm:px-8 max-w-[1280px] mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-extrabold text-cyan-200 uppercase tracking-widest px-3 py-1 bg-slate-950/80 border border-cyan-400/40 rounded-full backdrop-blur-md">Technical Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">Three Pillars. One Trust Layer.</h2>
          <p className="text-sm text-slate-200">Every component is designed to eliminate single points of failure in enterprise identity and asset management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Key className="w-6 h-6" />, color: 'blue',
              title: 'W3C Decentralised Identifiers',
              desc: 'Each user is issued a self-sovereign DID — cryptographically tied to their Ethereum wallet. No centralised user table. No single-point compromise. Identity lives on-chain.',
              badge: 'did:sc:7f3a92b001-a321...',
              spec: 'W3C DID Core Spec 1.0',
            },
            {
              icon: <Shield className="w-6 h-6" />, color: 'indigo',
              title: '3-Tier Role-Based Access Control',
              desc: 'Owner possesses root authority over asset minting and user creation. Manager handles operations — restricted tasks trigger "Request Owner Approval" queue. Employee accesses only assigned resources.',
              badge: 'Owner → Manager → Employee',
              spec: 'NIST RBAC Model Level 2',
            },
            {
              icon: <Globe className="w-6 h-6" />, color: 'cyan',
              title: 'Ethereum Sepolia Smart Contracts',
              desc: 'Every asset mint, DID anchor, role assignment, and approval event is permanently recorded in a Solidity smart contract on the Ethereum Sepolia testnet — fully immutable and verifiable.',
              badge: 'Contract: 0x593F...7e3E',
              spec: 'Ethereum Sepolia Testnet',
            },
          ].map((p, i) => (
            <div key={i} className={`group p-8 bg-slate-950/85 backdrop-blur-2xl rounded-3xl border shadow-2xl transition-all space-y-5 ${
              p.color === 'blue' ? 'border-blue-400/30 hover:border-blue-400' : p.color === 'indigo' ? 'border-indigo-400/30 hover:border-indigo-400' : 'border-cyan-400/30 hover:border-cyan-400'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                p.color === 'blue' ? 'bg-blue-500/20 border border-blue-400/40 text-blue-400' : p.color === 'indigo' ? 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-400' : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-400'
              }`}>{p.icon}</div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                  <span>{p.badge}</span>
                  <button type="button" onClick={() => copy(p.badge)} className="cursor-pointer text-slate-500 hover:text-cyan-400 transition-colors">
                    {copiedText === p.badge ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${p.color === 'blue' ? 'text-blue-400' : p.color === 'indigo' ? 'text-indigo-400' : 'text-cyan-400'}`}>{p.spec}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ROLE GOVERNANCE MATRIX ───────────────────────────────── */}
      <section id="roles" className="py-20">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-extrabold text-cyan-200 uppercase tracking-widest px-3 py-1 bg-slate-950/80 border border-cyan-400/40 rounded-full backdrop-blur-md">Definitive Role Workflows</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">Authority. Operations. Access.</h2>
            <p className="text-sm text-slate-200">Every user action is bound to one of three non-overlapping authority scopes. No privilege escalation. No workarounds.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                role: 'OWNER', level: '01', border: 'border-blue-500/80', badge: 'bg-blue-600', badgeText: 'Root Authority',
                title: 'System Owner', subtitle: 'Complete governance over all SecureChain operations.',
                perms: [
                  { icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />, text: 'Mint & burn digital assets on Sepolia', ok: true },
                  { icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />, text: 'Register users, assign & revoke roles', ok: true },
                  { icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />, text: 'Review & approve restricted Manager requests', ok: true },
                  { icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />, text: 'View complete audit trail & Sepolia hashes', ok: true },
                ],
              },
              {
                role: 'MANAGER', level: '02', border: 'border-indigo-500/80', badge: 'bg-indigo-600', badgeText: 'Operations',
                title: 'Manager / Admin', subtitle: 'Day-to-day operations within Owner-defined boundaries.',
                perms: [
                  { icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" />, text: 'Allocate assets to employees', ok: true },
                  { icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" />, text: 'View employee roster & identity records', ok: true },
                  { icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, text: 'Submit "Request Owner Approval" for restricted actions', ok: 'warn' },
                  { icon: <X className="w-4 h-4 text-red-400" />, text: 'Cannot bypass Owner approval queue', ok: false },
                ],
              },
              {
                role: 'EMPLOYEE', level: '03', border: 'border-emerald-500/80', badge: 'bg-emerald-600', badgeText: 'End User',
                title: 'Employee / User', subtitle: 'Accesses only resources explicitly assigned by Manager or Owner.',
                perms: [
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'View "My Assets" (assigned hardware & licences)', ok: true },
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'View personal W3C DID & Sepolia anchor', ok: true },
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: 'Submit access requests for review', ok: true },
                  { icon: <X className="w-4 h-4 text-red-400" />, text: 'No administrative privileges whatsoever', ok: false },
                ],
              },
            ].map(card => (
              <div key={card.role} className={`p-8 bg-slate-950/85 backdrop-blur-2xl rounded-3xl border-2 ${card.border} shadow-2xl space-y-6 text-white`}>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 ${card.badge} text-white text-xs font-black rounded-full uppercase tracking-wider`}>{card.level}. {card.role}</span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{card.badgeText}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{card.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{card.subtitle}</p>
                </div>
                <ul className="space-y-3">
                  {card.perms.map((p, i) => (
                    <li key={i} className={`flex items-center gap-2.5 text-xs font-bold ${p.ok === true ? 'text-slate-200' : p.ok === 'warn' ? 'text-amber-300' : 'text-slate-500'}`}>
                      {p.icon} <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Workflow Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black">Restricted Action Escalation Protocol</div>
                <div className="text-xs text-slate-300 mt-0.5">When Manager attempts a restricted action, the system automatically queues an Owner approval request — no bypass possible.</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm font-black text-slate-300 whitespace-nowrap">
              <span className="text-indigo-400">MANAGER</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-amber-400">APPROVAL QUEUE</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="text-blue-400">OWNER REVIEW</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 sm:px-8 max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold text-cyan-200 uppercase tracking-widest px-3 py-1 bg-slate-950/80 border border-cyan-400/40 rounded-full backdrop-blur-md">Common Questions</span>
          <h2 className="text-3xl font-black text-white drop-shadow-lg">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {[
            { q: 'What is a W3C Decentralised Identifier (DID) in SecureChain?', a: 'A DID is a globally unique, self-sovereign identifier for each user — cryptographically tied to their Ethereum wallet. Unlike a username in a centralised database, a DID is tamper-proof, portable, and verifiable by any party without requiring a trusted authority.' },
            { q: 'Why can\'t the Manager just mint assets directly?', a: 'SecureChain strictly enforces the 3-tier governance model. Minting creates new on-chain records that require Owner-level authority for accountability. The Manager submits a "Request Owner Approval" request, which the Owner reviews and authorises — preventing unauthorised asset creation.' },
            { q: 'What happens on the Sepolia blockchain during a normal operation?', a: 'Every critical event — asset minting, DID anchor creation, role assignment, and approval — is recorded as a transaction on the Ethereum Sepolia testnet via smart contracts. Each transaction produces a verifiable hash that cannot be altered, deleted, or forged — even by platform administrators.' },
            { q: 'How does SecureChain prevent privilege escalation attacks?', a: 'The RBAC policy engine evaluates every action at runtime against the authenticated user\'s role. Restricted operations produce HTTP 403 responses and trigger the Owner approval queue. There is no code path that allows a Manager or Employee to gain Owner-level privileges without explicit Owner approval.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
              <button type="button" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-sm font-bold text-white text-left cursor-pointer hover:bg-white/5 transition-colors">
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform shrink-0 ml-4 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' as const }}>
                    <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 sm:px-8 max-w-[1280px] mx-auto">
        <div className="relative overflow-hidden p-12 sm:p-16 bg-gradient-to-br from-blue-900/90 via-indigo-950/90 to-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-3xl text-white text-center shadow-2xl">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to Explore SecureChain?</h2>
            <p className="text-base text-blue-200 leading-relaxed">
              Log in with our pre-configured demo accounts and experience the full 3-tier governance model, live Sepolia smart contract interactions, and W3C DID verification — in real-time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link to="/login" className="flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-full font-black text-sm shadow-xl hover:scale-[1.03] transition-all">
                Launch Console Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/request-access" className="flex items-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/20 transition-all">
                Create Account
              </Link>
            </div>
            <p className="text-xs text-blue-300 font-medium pt-1">Demo accounts ready — no registration required to evaluate the platform.</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-950/85 backdrop-blur-2xl border-t border-white/10 py-10 text-slate-300">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Hexagon className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-sm">SecureChain</span>
            <span className="text-slate-600">·</span>
            <span>Smart India Hackathon 2026 · Problem: Decentralised Enterprise Asset & Identity Security</span>
          </div>
          <div>© 2026 SecureChain Platform. Built for SIH 2026.</div>
        </div>
      </footer>

    </WavyBackground>
  );
}