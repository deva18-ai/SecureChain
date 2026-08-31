import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (tx: ethers.TransactionRequest) => Promise<ethers.TransactionReceipt | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const TARGET_CHAIN_ID = 31337;
const TARGET_NETWORK = {
  chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
  chainName: 'Hardhat Localhost',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: ['http://127.0.0.1:8545'],
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const isConnected = !!account;

  const updateAccount = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const addr = accounts[0].address;
        setAccount(addr);
        const bal = await provider.getBalance(addr);
        setBalance(ethers.formatEther(bal));
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      } else {
        setAccount(null);
        setBalance(null);
        setChainId(null);
      }
    } catch (error) {
      console.error('Failed to update account:', error);
      setAccount(null);
      setBalance(null);
      setChainId(null);
    }
  }, []);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      await browserProvider.send('eth_requestAccounts', []);
      await updateAccount(browserProvider);

      browserProvider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setBalance(null);
        } else {
          updateAccount(browserProvider);
        }
      });

      browserProvider.on('chainChanged', (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
        window.location.reload();
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setProvider(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as { code: number }).code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [TARGET_NETWORK],
        });
      } else {
        throw error;
      }
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!provider) throw new Error('Wallet not connected');
    const signer = await provider.getSigner();
    return signer.signMessage(message);
  };

  const sendTransaction = async (tx: ethers.TransactionRequest): Promise<ethers.TransactionReceipt | null> => {
    if (!provider) throw new Error('Wallet not connected');
    const signer = await provider.getSigner();
    const txResponse = await signer.sendTransaction(tx);
    return txResponse.wait();
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      updateAccount(browserProvider);
    }
  }, [updateAccount]);

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        balance,
        isConnecting,
        isConnected,
        connect,
        disconnect,
        switchNetwork,
        signMessage,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}