/// <reference types="vite/client" />

interface Window {
  ethereum?: import('ethers').Eip1193Provider & {
    isMetaMask?: boolean;
    on?: (eventName: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void;
  };
}
