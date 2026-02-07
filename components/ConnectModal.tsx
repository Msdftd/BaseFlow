import React, { useState } from 'react';
import { Button } from './Button';
import { X, Wallet, Monitor } from 'lucide-react';
import { connectWallet } from '../services/web3Service';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [manualAddress, setManualAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleMetaMaskConnect = async () => {
    setIsLoading(true);
    const address = await connectWallet();
    setIsLoading(false);
    if (address) {
      onConnect(address);
      onClose();
    } else {
      alert("MetaMask not detected or request rejected. You can use Manual Entry.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.length > 0) {
      onConnect(manualAddress);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2">Connect to BaseFlow</h2>
        <p className="text-gray-400 text-sm mb-6">Choose how you want to connect to the platform.</p>

        <div className="space-y-4">
          <button 
            onClick={handleMetaMaskConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-base-blue/10 border border-base-blue/30 hover:bg-base-blue/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-base-blue flex items-center justify-center text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Browser Wallet</div>
                <div className="text-xs text-blue-300">MetaMask, Coinbase, Rainbow</div>
              </div>
            </div>
            {isLoading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-base-blue border-t-transparent"></span>}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-500">Or simulate</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Enter ANY Address</label>
                <input 
                  type="text" 
                  placeholder="0x..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-base-blue focus:ring-1 focus:ring-base-blue outline-none transition-all"
                />
             </div>
             <Button 
                type="submit" 
                className="w-full" 
                variant="secondary"
                disabled={!manualAddress}
             >
                <Monitor className="w-4 h-4 mr-2" />
                Simulate User
             </Button>
          </form>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            BaseFlow uses read-only access to verify on-chain activity.
          </p>
        </div>
      </div>
    </div>
  );
};