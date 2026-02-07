import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { Wallet, Menu, X, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  walletAddress: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ isConnected, onConnect, onDisconnect, walletAddress }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-white" : "text-gray-400 hover:text-white";
  const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-base-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-base-blue flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">BaseFlow</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/campaigns" className={`text-sm font-medium transition-colors ${isActive('/campaigns')}`}>Campaigns</Link>
            <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin')}`}>Project Admin</Link>
          </div>

          <div className="hidden md:flex items-center">
            {isConnected ? (
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Base Mainnet
                </div>
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 pr-3 border border-gray-700">
                    <div className="bg-gradient-to-tr from-blue-500 to-purple-600 w-8 h-8 rounded flex items-center justify-center text-xs font-bold">
                        {walletAddress?.slice(2,4)}
                    </div>
                    <span className="text-sm font-medium text-gray-200">{walletAddress ? formatAddress(walletAddress) : ''}</span>
                    <button onClick={onDisconnect} className="ml-2 text-gray-500 hover:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ) : (
              <Button onClick={onConnect} size="sm">
                Connect Wallet
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white bg-white/5">Home</Link>
             <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Dashboard</Link>
             <Link to="/campaigns" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Campaigns</Link>
             <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Project Admin</Link>
             <div className="mt-4 px-3">
                {isConnected ? (
                    <Button onClick={() => { onDisconnect(); setIsMenuOpen(false); }} className="w-full" variant="outline">
                        Disconnect
                    </Button>
                ) : (
                    <Button onClick={() => { onConnect(); setIsMenuOpen(false); }} className="w-full">
                        Connect Wallet
                    </Button>
                )}
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};