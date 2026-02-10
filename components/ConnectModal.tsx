import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { connectWallet } from '../services/web3Service';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);

  // ✅ FIX: Auto-detect if running inside Base App / Coinbase Wallet frame
  // In that context, wallet is already available - connect seamlessly
  useEffect(() => {
    if (isOpen) {
      detectEmbeddedWallet();
    }
  }, [isOpen]);

  const detectEmbeddedWallet = async () => {
    // Check if we're inside a Mini App frame (Base app provides ethereum provider automatically)
    const provider = getProvider();
    if (provider?.isCoinbaseWallet || provider?.isFrame) {
      setIsAutoConnecting(true);
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          // Already connected inside Base app - no popup needed!
          onConnect(accounts[0]);
          onClose();
          return;
        }
      } catch {
        // Fall through to manual connect
      } finally {
        setIsAutoConnecting(false);
      }
    }
  };

  if (!isOpen) return null;

  const getProvider = () => {
    if (typeof window === 'undefined') return null;
    const win = window as any;

    // Priority: Coinbase Wallet > injected provider
    if (win.coinbaseWalletExtension) return win.coinbaseWalletExtension;
    if (win.ethereum?.isCoinbaseWallet) return win.ethereum;
    if (win.ethereum?.providers) {
      const cbProvider = win.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      if (cbProvider) return cbProvider;
    }
    return win.ethereum || null;
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const address = await connectWallet();
      if (address) {
        onConnect(address);
        onClose();
      } else {
        setError("No wallet detected. Please open this app inside the Base app or install Coinbase Wallet.");
      }
    } catch (err) {
      setError("Connection was rejected. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show auto-connecting state when inside Base app
  if (isAutoConnecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-10 h-10 text-base-blue animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-1">Connecting...</h2>
          <p className="text-gray-400 text-sm">Detecting your Base wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2">Connect to BaseFlow</h2>
        <p className="text-gray-400 text-sm mb-6">
          Connect your wallet to track your on-chain reputation score.
        </p>

        <div className="space-y-4">
          {/* ✅ FIX: Single clean connect button - works with Coinbase Wallet, MetaMask, etc. */}
          {/* No external redirects - uses injected provider which is native inside Base app */}
          <button 
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-base-blue/10 border border-base-blue/30 hover:bg-base-blue/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-base-blue flex items-center justify-center text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Connect Wallet</div>
                <div className="text-xs text-blue-300">Coinbase Wallet, MetaMask, or injected</div>
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-base-blue animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-gray-600 group-hover:text-base-blue transition-colors" />
            )}
          </button>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}
          
          {/* ✅ FIX: Removed "Simulate User" / manual address entry */}
          {/* That was a security concern - anyone could enter any address */}

          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              <span>No external redirects or popups inside Base app</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              <span>Read-only access to verify on-chain activity</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              <span>No email, phone, or KYC required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
