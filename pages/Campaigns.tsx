import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { ExternalLink, Calendar, CheckCircle2, Trophy, Flame, RefreshCw, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { fetchCheckInStats, verifyCheckIn } from '../services/web3Service';

export const Campaigns: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<{ currentStreak: number; totalCheckIns: number } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(localStorage.getItem('baseflow_wallet'));

  const MILESTONES = [1, 5, 10, 15, 30, 50, 100];
  const EXTERNAL_APP_URL = "https://my-first-base-miniapp.vercel.app/";

  useEffect(() => {
    loadStats();
  }, [walletAddress]);

  const loadStats = async () => {
    const addr = localStorage.getItem('baseflow_wallet');
    setWalletAddress(addr);
    
    if (addr) {
      setLoading(true);
      try {
        const data = await fetchCheckInStats(addr);
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    if (!walletAddress) return;
    
    setVerifying(true);
    setErrorMsg(null);
    
    try {
        // 1. Get current stats before refresh
        const oldStreak = stats?.currentStreak || 0;

        // 2. Poll the API
        const newData = await verifyCheckIn(walletAddress);
        
        // 3. Compare results
        if (newData.currentStreak > oldStreak) {
            setStats(newData);
            // Success sound or effect could go here
        } else {
            // No change detected
            setErrorMsg("Transaction not detected on Base chain yet. Please ensure you have completed the check-in on the external app.");
            setStats(newData); // Still update in case something else changed
        }
    } catch (e) {
        setErrorMsg("Failed to verify status. Please try again.");
    } finally {
        setVerifying(false);
    }
  };

  const getProgressWidth = (streak: number) => {
    const max = 100;
    return Math.min((streak / max) * 100, 100);
  };

  return (
    <div className="pt-24 pb-12 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
            <h1 className="text-4xl font-bold text-white mb-2">Daily Check-in</h1>
            <p className="text-gray-400 text-lg">Build your on-chain consistency streak to unlock exclusive reputation badges.</p>
        </div>
        {stats && (
           <Button variant="outline" onClick={loadStats} isLoading={loading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Sync Data
           </Button>
        )}
      </div>

      {!walletAddress ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
             <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet to View Progress</h2>
             <p className="text-gray-400">Please connect your wallet to sync your daily check-in data.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Main Status Card */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-base-blue/20 rounded-full blur-3xl"></div>

             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border ${stats?.currentStreak ? 'bg-orange-500/20 text-orange-500 border-orange-500/20' : 'bg-gray-700/50 text-gray-400 border-gray-600'}`}>
                         <Flame className={`w-4 h-4 ${!stats?.currentStreak && 'grayscale'}`} /> 
                         {stats?.currentStreak ? 'Streak Active' : 'No Active Streak'}
                      </span>
                   </div>
                   
                   {loading ? (
                       <div className="h-20 flex items-center">
                           <Loader2 className="w-8 h-8 animate-spin text-base-blue" />
                           <span className="ml-3 text-xl text-gray-400">Fetching data from external app...</span>
                       </div>
                   ) : (
                       <h2 className="text-6xl font-bold text-white mb-2">
                           {stats?.currentStreak || 0} <span className="text-2xl text-gray-500 font-normal">Days</span>
                       </h2>
                   )}
                   
                   <p className="text-gray-400 mb-6 max-w-md">
                       Checking data source: <span className="text-base-blue underline cursor-pointer" onClick={() => window.open(EXTERNAL_APP_URL, '_blank')}>my-first-base-miniapp</span>
                   </p>

                   {errorMsg && (
                       <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-sm text-red-200">
                           <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                           {errorMsg}
                       </div>
                   )}
                   
                   <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        size="lg" 
                        onClick={() => window.open(EXTERNAL_APP_URL, '_blank')}
                        className="w-full sm:w-auto shadow-xl shadow-base-blue/20"
                      >
                         Open Check-in App <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <Button 
                         variant="secondary"
                         size="lg"
                         onClick={handleVerify}
                         isLoading={verifying}
                         disabled={loading}
                         className="w-full sm:w-auto"
                      >
                         Verify Action <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                   </div>
                </div>

                {/* Progress Visual */}
                <div className="space-y-8">
                   <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                      <span>Progress to Master</span>
                      <span className="text-white">{stats?.currentStreak || 0}/100 Days</span>
                   </div>
                   
                   {/* Custom Progress Bar */}
                   <div className="relative h-4 bg-gray-800 rounded-full w-full">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-base-blue to-purple-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getProgressWidth(stats?.currentStreak || 0)}%` }}
                      ></div>
                      
                      {/* Milestones Markers */}
                      {MILESTONES.map((m) => {
                         const achieved = (stats?.currentStreak || 0) >= m;
                         const leftPos = (m / 100) * 100;
                         return (
                            <div 
                                key={m}
                                className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all z-10
                                    ${achieved ? 'bg-base-blue border-base-dark text-white scale-110' : 'bg-gray-800 border-base-dark text-gray-500'}
                                `}
                                style={{ left: `calc(${leftPos}% - 16px)` }}
                            >
                               {m}
                            </div>
                         );
                      })}
                   </div>

                   {/* Milestone Legend */}
                   <div className="grid grid-cols-4 gap-2 pt-4">
                      {MILESTONES.slice(0, 4).map((m) => (
                          <div key={m} className={`text-center p-2 rounded-lg ${ (stats?.currentStreak || 0) >= m ? 'bg-white/5' : 'opacity-30' }`}>
                              <div className={`text-xs uppercase font-bold mb-1 ${ (stats?.currentStreak || 0) >= m ? 'text-green-400' : 'text-gray-500' }`}>
                                 { (stats?.currentStreak || 0) >= m ? 'Unlocked' : 'Locked' }
                              </div>
                              <div className="text-sm font-bold">{m} Days</div>
                          </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Detailed Milestone List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {MILESTONES.map((day) => {
                 const isCompleted = (stats?.currentStreak || 0) >= day;
                 return (
                     <div key={day} className={`glass-panel p-6 rounded-xl border transition-all ${isCompleted ? 'border-green-500/30 bg-green-900/5' : 'border-gray-800 hover:border-gray-700'}`}>
                         <div className="flex justify-between items-start mb-4">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-600'}`}>
                                 {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                             </div>
                             <span className={`text-xl font-bold ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                                 {day}
                             </span>
                         </div>
                         <h3 className={`font-bold mb-1 ${isCompleted ? 'text-white' : 'text-gray-500'}`}>Day {day} Milestone</h3>
                         <p className="text-xs text-gray-500">{isCompleted ? 'Completed & Verified' : 'Keep checking in to unlock'}</p>
                     </div>
                 );
             })}
             <div className="glass-panel p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => window.open(EXTERNAL_APP_URL, '_blank')}>
                 <ExternalLink className="w-8 h-8 text-base-blue mb-3" />
                 <h3 className="font-bold text-white">Go to App</h3>
                 <p className="text-xs text-gray-500">Launch external mini-app</p>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};