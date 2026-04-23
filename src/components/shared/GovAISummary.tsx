'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, Bot, BrainCircuit, Lightbulb, ShieldCheck } from 'lucide-react';
import { CityOverview, DistrictStats, SLABreach, DailySummary } from '@/lib/gov-types';
import { cn } from '@/lib/utils';

interface GovAISummaryProps {
  overview: CityOverview | null;
  rankings: DistrictStats[];
  breaches: SLABreach[];
  summary: DailySummary | null;
}

export default function GovAISummary({ overview, rankings, breaches, summary }: GovAISummaryProps) {
  const [aiText, setAiText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!overview || !summary) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overview, rankings, breaches, summary }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAiText(data.summary);
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
      setError('Unable to reach Command Intelligence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [overview?.totalReports]); // Refetch when reports change

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
      
      <div className="relative bg-[#1e293b]/80 backdrop-blur-xl border border-[#334155] rounded-[32px] overflow-hidden shadow-2xl">
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-50"></div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BrainCircuit className="w-8 h-8 text-white animate-pulse-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white font-display tracking-tight">Command Intelligence</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Gemini 1.5 Pro</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">Real-time city status synthesis & strategic outlook</p>
              </div>
            </div>
            
            <button 
              onClick={fetchSummary}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                "bg-[#0f172a] text-slate-300 border border-[#334155] hover:border-blue-500/50 hover:text-white",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              {loading ? "Synthesizing..." : "Refresh Insight"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main AI Text Content */}
            <div className="md:col-span-8 space-y-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded-full w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-700 rounded-full w-5/6"></div>
                  <div className="h-4 bg-slate-700 rounded-full w-2/3"></div>
                </div>
              ) : error ? (
                <div className="flex items-start gap-3 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 font-medium">{error}</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                    {aiText || "Awaiting city data synchronization..."}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics / AI Focus */}
            <div className="md:col-span-4 space-y-4">
               <div className="p-6 bg-[#0f172a]/50 rounded-2xl border border-[#334155] space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Lightbulb className="w-3 h-3 text-yellow-400" /> Key Focus Areas
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <p className="text-xs text-slate-300 font-semibold">Infrastructure Latency</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <p className="text-xs text-slate-300 font-semibold">SLA Compliance Trends</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <p className="text-xs text-slate-300 font-semibold">District Efficiency Index</p>
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/60" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-tighter">System Integrity</p>
                    <p className="text-xs text-slate-400 font-medium">Analytics verified by UrbanFix Core</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-[#0f172a]/30 border-t border-[#334155] flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-blue-400/50" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI-Generated Content • Human verification recommended</p>
           </div>
           <p className="text-[10px] font-bold text-slate-600 uppercase">Ver v2.4.0</p>
        </div>
      </div>
    </div>
  );
}
