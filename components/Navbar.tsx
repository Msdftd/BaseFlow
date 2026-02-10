import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { Wallet, Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { getWalletDisplayInfo, generateAvatarGradient, formatDisplayAddress } from '../services/basenameService';

interface NavbarProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  walletAddress: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ isConnected, onConnect, onDisconnect, walletAddress }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // ✅ FIX: Resolve basename instead of showing raw 0x
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarGradient, setAvatarGradient] = useState<{ from: string; to: string }>({ from: '#0052FF', to: '#7B3FE4' });
  const [isBasename, setIsBasename] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      // Set immediate fallback
      setDisplayName(formatDisplayAddress(walletAddress));
      setAvatarGradient(generateAvatarGradient(walletAddress));

      // Resolve basename async
      getWalletDisplayInfo(walletAddress).then((info) => {
        setDisplayName(info.displayName);
        setAvatarGradient(info.avatarGradient);
        setIsBasename(info.isBasename);
      });
    }
  }, [walletAddress]);

  const isActive = (path: string) => location.pathname === path ? "text-white" : "text-gray-400 hover:text-white";

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
                {/* ✅ FIX: Avatar + Basename display instead of raw 0x */}
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 pr-3 border border-gray-700">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})` }}
                    >
                        {isBasename 
                          ? displayName.charAt(0).toUpperCase() 
                          : (walletAddress?.slice(2,4).toUpperCase() || '?')
                        }
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-200 leading-tight">{displayName}</span>
                      {isBasename && walletAddress && (
                        <span className="text-[10px] text-gray-500 leading-tight">{formatDisplayAddress(walletAddress)}</span>
                      )}
                    </div>
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
             {/* ✅ FIX: Show avatar + name in mobile menu too */}
             {isConnected && walletAddress && (
               <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-white/5">
                 <div 
                   className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                   style={{ background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})` }}
                 >
                   {isBasename ? displayName.charAt(0).toUpperCase() : walletAddress.slice(2,4).toUpperCase()}
                 </div>
                 <div className="min-w-0">
                   <div className="text-sm font-medium text-white truncate">{displayName}</div>
                   {isBasename && <div className="text-xs text-gray-500 truncate">{formatDisplayAddress(walletAddress)}</div>}
                 </div>
               </div>
             )}
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
