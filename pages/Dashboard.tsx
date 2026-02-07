import React, { useState, useEffect } from 'react';
import { ScoreGauge } from '../components/ScoreGauge';
import { Button } from '../components/Button';
import { WalletStats, ReputationScore, AiAnalysisResult } from '../types';
import { analyzeWalletReputation } from '../services/geminiService';
import { getWalletData } from '../services/web3Service';
import { Activity, Share2, Zap, AlertTriangle, CheckCircle, RefreshCw, Layers, Calendar, ExternalLink, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  isConnected: boolean;
  walletAddress: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ isConnected, walletAddress }) => {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [score, setScore] = useState<ReputationScore | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data when wallet connects or changes
  useEffect(() => {
    if (isConnected && walletAddress) {
        loadData();
    }
  }, [isConnected, walletAddress]);

  const loadData = () => {
    setIsRefreshing(true);
    // Simulate network fetch
    setTimeout(() => {
        const data = getWalletData(walletAddress);
        setStats(data.stats);
        setScore(data.score);
        // Reset analysis when wallet changes
        setAnalysis(null); 
        setIsRefreshing(false);
    }, 600);
  };

  const handleAnalyze = async () => {
    if(!stats || !score) return;
    
    setIsAnalyzing(true);
    try {
        const result = await analyzeWalletReputation(stats, score);
        setAnalysis(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  // Helper for activity chart generation based on score
  const getActivityData = (scoreTotal: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
        day,
        txs: Math.floor((scoreTotal / 100) * (Math.random() * i + 1)) % 20
    }));
  };

  if (!isConnected || !stats || !score) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="bg-gray-800 p-6 rounded-full inline-block animate-pulse">
             <Activity className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold">Connect Wallet to View Dashboard</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Your on-chain reputation is waiting. Connect a wallet or simulate an address to see your BaseFlow Score.
          </p>
        </div>
      </div>
    );
  }

  const activityData = getActivityData(score.total);

  return (
    <div className="pt-24 pb-12 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-4 duration-500">
        <div>
            <h1 className="text-3xl font-bold text-white">Your Proof Profile</h1>
            <p className="text-gray-400 flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                Tracking: <span className="font-mono text-gray-300">{walletAddress}</span>
            </p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" /> Basescan
             </Button>
             <Button variant="primary" size="sm" onClick={loadData} isLoading={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Score & Core Stats */}
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-base-blue to-purple-500"></div>
                <ScoreGauge score={score.total} />
                <div className="w-full mt-6 space-y-4">
                    <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-gray-400">Sybil Risk</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${score.riskLevel === 'Low' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                            {score.riskLevel.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm px-2">
                        <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> First Tx</span>
                        <span className="text-white font-medium font-mono">{stats.firstTxDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm px-2">
                        <span className="text-gray-400 flex items-center gap-2"><Layers className="w-4 h-4" /> Total Gas</span>
                        <span className="text-white font-medium font-mono">{stats.gasSpent} ETH</span>
                    </div>
                    <div className="flex justify-between items-center text-sm px-2">
                        <span className="text-gray-400 flex items-center gap-2"><Activity className="w-4 h-4" /> Tx Count</span>
                        <span className="text-white font-medium font-mono">{stats.txCount}</span>
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-base-blue" />
                    Weekly Activity
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                             <XAxis dataKey="day" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false}/>
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1E2025', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                             />
                             <Bar dataKey="txs" radius={[4, 4, 0, 0]}>
                                {activityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.txs > 8 ? '#0052FF' : '#374151'} />
                                ))}
                             </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Right Col: AI Analysis & Badges */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* AI Analysis Section */}
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-base-blue bg-gradient-to-r from-base-blue/5 to-transparent">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        AI Reputation Engine
                    </h3>
                    {!analysis && (
                        <Button onClick={handleAnalyze} isLoading={isAnalyzing} size="sm">
                            Run Deep Scan
                        </Button>
                    )}
                </div>

                {analysis ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <p className="text-gray-200 leading-relaxed italic">"{analysis.summary}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/10">
                                <h4 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Strong Signals
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-orange-500/5 p-4 rounded-lg border border-orange-500/10">
                                <h4 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Risks / Weaknesses
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0"></span>
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                        <p>Click "Run Deep Scan" to generate a behavioral profile using Gemini AI.</p>
                    </div>
                )}
            </div>

            {/* Credentials / Badges */}
            <div className="glass-panel rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Earned Credentials</h3>
                    <span className="text-sm text-gray-400">{Math.floor(score.total / 100)}/12 Unlocked</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { name: "Base OG", type: "Longevity", threshold: 700 },
                        { name: "DeFi Power User", type: "Volume", threshold: 500 },
                        { name: "NFT Collector", type: "Holding", threshold: 400 },
                        { name: "Gitcoin Donor", type: "Public Goods", threshold: 300 },
                        { name: "Governance Voter", type: "DAO", threshold: 600 },
                        { name: "Liquidity Provider", type: "DeFi", threshold: 800 },
                    ].map((badge, idx) => {
                        const active = score.total >= badge.threshold;
                        return (
                            <div key={idx} className={`p-4 rounded-xl border transition-all ${active ? 'bg-base-blue/10 border-base-blue/30' : 'bg-gray-800/30 border-gray-700 opacity-50 grayscale'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-base-blue text-white shadow-lg shadow-blue-500/20' : 'bg-gray-700 text-gray-500'}`}>
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{badge.name}</h4>
                                        <span className="text-xs text-gray-400">{badge.type}</span>
                                    </div>
                                </div>
                                {!active && <div className="mt-2 text-[10px] text-gray-500 text-center">Requires {badge.threshold} score</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};