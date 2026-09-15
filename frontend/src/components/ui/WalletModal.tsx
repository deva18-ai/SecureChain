import { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { formatAddress } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { isConnected, account, chainId, connect, disconnect } = useWallet();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectProvider = async (providerName: string) => {
    setConnectingProvider(providerName);
    try {
      if (providerName === 'MetaMask') {
        await connect();
        toast.success('MetaMask connected successfully');
      } else {
        // Simulated connection for demo showcase
        await new Promise(res => setTimeout(res, 600));
        toast.success(`${providerName} connected successfully (Sepolia Testnet)`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || `Failed to connect ${providerName}`);
    } finally {
      setConnectingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect Wallet</h3>
              <p className="text-xs text-slate-500">Connect your web3 wallet to interact with on-chain assets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isConnected ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-emerald-900">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sepolia Network Active
                </span>
                <span className="text-xs text-emerald-700 font-mono">Chain ID: {chainId || 11155111}</span>
              </div>
              <div className="font-mono text-sm font-bold bg-white/80 px-3 py-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span>{formatAddress(account || '0x71A8...8A82')}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <a
                  href={`https://sepolia.etherscan.io/address/${account || '0x71A8...8A82'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-800 hover:underline font-medium"
                >
                  View on Etherscan <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => {
                    disconnect();
                    toast.success('Wallet disconnected');
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* MetaMask */}
              <button
                onClick={() => handleConnectProvider('MetaMask')}
                disabled={!!connectingProvider}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm">
                    🦊
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">MetaMask</div>
                    <div className="text-xs text-slate-500">Browser Extension / Web3 Wallet</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100/80 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              </button>

              {/* WalletConnect */}
              <button
                onClick={() => handleConnectProvider('WalletConnect')}
                disabled={!!connectingProvider}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    🌐
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">WalletConnect</div>
                    <div className="text-xs text-slate-500">Scan QR Code with mobile wallet</div>
                  </div>
                </div>
              </button>

              {/* Coinbase Wallet */}
              <button
                onClick={() => handleConnectProvider('Coinbase Wallet')}
                disabled={!!connectingProvider}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">Coinbase Wallet</div>
                    <div className="text-xs text-slate-500">Coinbase Browser Extension</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-slate-400">
            SecureChain verifies wallet signatures using standard EIP-712 typed data hashing.
          </div>
        </div>
      </div>
    </div>
  );
}
