import React from 'react';
import { Button } from '../components/Button';
import { ShieldCheck, Database, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingProps {
  onConnect: () => void;
  isConnected: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onConnect, isConnected }) => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-base-blue/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-base-blue"></span>
                <span className="text-sm font-medium text-gray-300">Live on Base Mainnet</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Your On-Chain <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue to-purple-500">Reputation Layer</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                BaseFlow aggregates your history, verifies your humanity without KYC, 
                and unlocks exclusive rewards from the best projects on Base.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isConnected ? (
                     <Link to="/dashboard">
                        <Button size="lg" className="w-full sm:w-auto">
                            Go to Dashboard
                        </Button>
                     </Link>
                ) : (
                    <Button size="lg" onClick={onConnect} className="w-full sm:w-auto">
                        Connect Wallet
                    </Button>
                )}
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    View Documentation
                </Button>
            </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        icon: <ShieldCheck className="w-8 h-8 text-base-blue" />,
                        title: "Anti-Sybil Proof",
                        desc: "Advanced behavior analysis separates real users from bots without invasive KYC."
                    },
                    {
                        icon: <Database className="w-8 h-8 text-purple-500" />,
                        title: "On-Chain History",
                        desc: "Your transactions, gas spend, and contract interactions build your permanent reputation score."
                    },
                    {
                        icon: <Zap className="w-8 h-8 text-yellow-500" />,
                        title: "Instant Utility",
                        desc: "Use your BaseFlow Score to access whitelists, lower fees, and governance rights."
                    }
                ].map((feature, i) => (
                    <div key={i} className="glass-panel p-8 rounded-2xl hover:bg-white/5 transition-colors">
                        <div className="mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-400">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                    { label: "Verified Users", val: "142k+" },
                    { label: "Badges Minted", val: "850k+" },
                    { label: "Partner Apps", val: "64" },
                    { label: "Base TVL Tracked", val: "$1.2B" },
                ].map((stat, i) => (
                    <div key={i}>
                        <div className="text-4xl font-bold text-white mb-1">{stat.val}</div>
                        <div className="text-gray-500 uppercase text-sm tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>
         </div>
      </section>
    </div>
  );
};