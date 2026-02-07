import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { ExternalLink, Zap, Activity, RefreshCw, Layers, Shield } from 'lucide-react';
import { fetchCheckInStats } from '../services/web3Service';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{ currentStreak: number; totalCheckIns: number; nextMilestone: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(localStorage.getItem('baseflow_wallet'));

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const loadData = async () => {
    const addr = localStorage.getItem('baseflow_wallet');
    setWalletAddress(addr);
    
    if (addr) {
      setLoading(true);
      try {
        const data = await fetchCheckInStats(addr);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const EXTERNAL_APP_URL = "https://my-first-base-miniapp.vercel.app/";

  return (
    <div className="pt-24 pb-12 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Live Data Monitor</h1>
            <p className="text-gray-400 mt-1">Real-time status from external Mini-App</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={loadData} isLoading={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
             </Button>
             <Button variant="secondary" size="sm" onClick={() => window.open(EXTERNAL_APP_URL, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" /> View Live App
             </Button>
        </div>
      </div>

      {!walletAddress ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
             <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
             <p className="text-gray-400">Please connect a wallet to view live analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Real Data Card 1 */}
            <div className="glass-panel p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Active Streak</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{stats?.currentStreak || 0}</h3>
                    </div>
                    <div className="bg-base-blue/20 p-2 rounded-lg text-base-blue">
                        <Zap className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs text-blue-300">Fetched directly from API</p>
            </div>

            {/* Real Data Card 2 */}
            <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Total Check-ins</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{stats?.totalCheckIns || 0}</h3>
                    </div>
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-500">
                        <Layers className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs text-gray-500">Lifetime interaction count</p>
            </div>

            {/* Real Data Card 3 */}
            <div className="glass-panel p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Next Milestone</p>
                        <h3 className="text-4xl font-bold text-white mt-2">{stats?.nextMilestone || 1}</h3>
                    </div>
                    <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs text-gray-500">Target goal for user</p>
            </div>
        </div>
      )}
    </div>
  );
};