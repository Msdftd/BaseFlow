import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { AdminDashboard } from './pages/Admin';
import { ConnectModal } from './components/ConnectModal';
import sdk from '@farcaster/frame-sdk';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Initialize Farcaster Frame SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
      } catch (e) {
        console.log("Farcaster SDK not in context");
      }
    };
    initSDK();
  }, []);

  // Check if wallet is already connected via localstorage persistence
  useEffect(() => {
    const savedAddress = localStorage.getItem('baseflow_wallet');
    if (savedAddress) {
        setWalletAddress(savedAddress);
    }
  }, []);

  const handleConnect = (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('baseflow_wallet', address);
    setIsConnectModalOpen(false);
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('baseflow_wallet');
  };

  return (
    <Router>
      <div className="min-h-screen bg-base-dark text-white font-sans selection:bg-base-blue selection:text-white">
        <Navbar 
            isConnected={!!walletAddress} 
            onConnect={() => setIsConnectModalOpen(true)}
            onDisconnect={handleDisconnect}
            walletAddress={walletAddress} 
        />
        
        <ConnectModal 
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
            onConnect={handleConnect}
        />

        <Routes>
          <Route path="/" element={<Landing onConnect={() => setIsConnectModalOpen(true)} isConnected={!!walletAddress} />} />
          <Route path="/dashboard" element={<Dashboard isConnected={!!walletAddress} walletAddress={walletAddress || ''} />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 bg-black/30">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
                <p>&copy; 2024 BaseFlow. Built on Base.</p>
            </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
