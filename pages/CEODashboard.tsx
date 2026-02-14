import React, { useEffect, useState } from 'react';
import { getEcosystemStats } from '../services/mockData';
import { EcosystemStats } from '../types';
import { TrendingUp, Users, ShoppingCart, Activity, Globe, Zap, ArrowUpRight } from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const [stats, setStats] = useState<EcosystemStats | null>(null);

  useEffect(() => {
    setStats(getEcosystemStats());
  }, []);

  if (!stats) return <div className="min-h-screen bg-black flex items-center justify-center text-aura-purple animate-pulse">Initializing God Mode...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
       <div className="bg-[#050505] border-b border-white/10 p-6 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-serif font-bold text-white">
                    CEO COMMAND CENTER
                </h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Live Ecosystem Overview</p>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-mono text-green-400 uppercase tracking-widest">System Optimal</span>
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard 
                title="Active Vendors" 
                value={stats.totalVendors.toLocaleString()} 
                icon={<Users className="text-blue-400" />} 
                trend="+12% this week"
             />
             <StatCard 
                title="Live Inventory" 
                value={stats.activeProducts.toLocaleString()} 
                icon={<ShoppingCart className="text-purple-400" />} 
                trend="High Demand"
             />
             <StatCard 
                title="Monthly Volume" 
                value={`৳${(stats.monthlyVolume / 1000000).toFixed(1)}M`} 
                icon={<Activity className="text-green-400" />} 
                trend="+8.5% Growth"
             />
             <StatCard 
                title="AI Interventions" 
                value={stats.aiInteractions.toLocaleString()} 
                icon={<Zap className="text-yellow-400" />} 
                trend="99.9% Automation"
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                   <TrendingUp className="text-aura-purple" />
                   <h2 className="text-xl font-bold font-serif text-white">Aura Predictive Analysis (2025-2028)</h2>
                </div>

                <div className="space-y-6">
                   {stats.trendForecast.map((item, idx) => (
                      <div key={idx} className="relative group">
                         <div className="flex justify-between items-end mb-2 relative z-10">
                            <div>
                               <span className="text-sm font-mono text-gray-500">{item.year}</span>
                               <h3 className="text-lg font-bold text-white group-hover:text-aura-purple transition-colors">{item.trend}</h3>
                            </div>
                            <div className="text-right">
                               <span className="text-2xl font-bold text-green-400">+{item.growth}%</span>
                            </div>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-aura-purple rounded-full"
                                style={{ width: `${Math.min(item.growth / 2, 100)}%` }}
                            ></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <Globe size={64} className="text-gray-700 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Global Expansion</h3>
                <p className="text-gray-500 text-sm mb-6">
                   System optimized for cross-border logistics. Ready to activate international shipping modules.
                </p>
                <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2">
                   Activate Global Mode <ArrowUpRight size={14} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string }> = ({ title, value, icon, trend }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
       <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-black rounded-xl border border-white/10">
             {icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-white/5 px-2 py-1 rounded">{trend}</span>
       </div>
       <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
       <p className="text-gray-500 text-xs uppercase tracking-widest">{title}</p>
    </div>
);