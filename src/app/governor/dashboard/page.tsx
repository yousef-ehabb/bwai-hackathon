'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCityOverviewStats, getDistrictRankings, getSLABreaches, getDailyExecutiveSummary } from '@/lib/gov-storage';
import { getReports } from '@/lib/storage';
import { CityOverview, DistrictStats, SLABreach, DailySummary } from '@/lib/gov-types';
import { Report } from '@/lib/types';
import GovStatCard from '@/components/shared/GovStatCard';
import GovDistrictRanking from '@/components/shared/GovDistrictRanking';
import GovDailySummary from '@/components/shared/GovDailySummary';
import UrbanFixMap from '@/components/shared/UrbanFixMap';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Activity,
  MapPin,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function GovernorDashboard() {
  const { currentUser } = useAuth();
  const [overview, setOverview] = useState<CityOverview | null>(null);
  const [rankings, setRankings] = useState<DistrictStats[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    setOverview(getCityOverviewStats());
    setRankings(getDistrictRankings());
    setBreaches(getSLABreaches());
    setSummary(getDailyExecutiveSummary());
    setReports(getReports());
  }, []);

  const now = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 min-h-screen bg-[#0f172a]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#e61e49] animate-pulse" />
            <p className="text-[12px] font-medium text-[#e61e49] uppercase tracking-widest">Live City Command</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight">
            Governor's Command Center
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">{now}</p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <p className="text-emerald-500/80 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin-slow" /> Last City Sync: 08:00 AM
            </p>
          </div>
        </div>
        
        {summary && (
          <div className="bg-[#1e293b]/50 border border-[#334155] rounded-2xl p-4 flex gap-8">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">New Today</p>
              <p className="text-2xl font-bold text-white">{summary.totalNewReports}</p>
            </div>
            <div className="w-px bg-slate-800" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Resolved</p>
              <p className="text-2xl font-bold text-emerald-400">{summary.resolvedIssues}</p>
            </div>
          </div>
        )}
      </div>

      {/* SLA Breach Banner */}
      {breaches.length > 0 && (
        <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-300">
              {breaches.length} Active SLA Breach{breaches.length > 1 ? 'es' : ''} Identified
            </p>
            <p className="text-red-400/70 text-sm mt-1 leading-relaxed">
              {breaches.filter(b => b.severity === 'Critical').length} Critical incidents unassigned &gt; 30 mins. {breaches.filter(b => b.severity === 'High').length} High priority issues pending &gt; 4 hours. Immediate district intervention required.
            </p>
          </div>
          <a
            href="/governor/dashboard#breaches"
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 rounded-full border border-red-500/20 transition-all"
          >
            ACTION CENTER
          </a>
        </div>
      )}

      {/* Stat Cards */}
      {overview && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <GovStatCard
            label="Total Reports"
            value={overview.totalReports}
            icon={<FileText className="w-5 h-5" />}
            accentColor="text-blue-400"
            bgColor="bg-blue-400/10"
          />
          <GovStatCard
            label="Active Issues"
            value={overview.activeIssues}
            icon={<Activity className="w-5 h-5" />}
            accentColor="text-orange-400"
            bgColor="bg-orange-400/10"
            trend={overview.activeIssues > 0 ? 'down' : 'neutral'}
            trendLabel={overview.activeIssues > 0 ? 'Needs attention' : 'All clear'}
          />
          <GovStatCard
            label="Resolved Today"
            value={overview.resolvedToday}
            icon={<CheckCircle className="w-5 h-5" />}
            accentColor="text-emerald-400"
            bgColor="bg-emerald-400/10"
            trend={overview.resolvedToday > 0 ? 'up' : 'neutral'}
            trendLabel={overview.resolvedToday > 0 ? 'Great progress' : 'None yet today'}
          />
          <GovStatCard
            label="Avg Resolution"
            value={
              overview.avgResolutionTime < 1
                ? `${Math.round(overview.avgResolutionTime * 60)}m`
                : `${overview.avgResolutionTime.toFixed(1)}h`
            }
            icon={<Clock className="w-5 h-5" />}
            accentColor="text-purple-400"
            bgColor="bg-purple-400/10"
          />
        </div>
      )}

      {/* City-wide Heatmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-400" /> City Infrastructure Heatmap
           </h2>
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Real-time incidents</span>
        </div>
        <UrbanFixMap reports={reports} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* District Rankings */}
        <div className="lg:col-span-2 bg-[#1e293b]/50 border border-[#334155] rounded-[32px] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-xl flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> District Performance
            </h2>
            <a href="/governor/districts" className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">
              Detailed Rankings →
            </a>
          </div>
          <GovDistrictRanking data={rankings.slice(0, 5)} compact={false} />
        </div>

        {/* Daily Executive Summary Sidebar */}
        <div className="space-y-8">
            {/* Daily Executive Summary */}
            <GovDailySummary />

            {/* SLA Breaches Sidebar */}
            <div id="breaches" className="bg-[#1e293b]/50 border border-[#334155] rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg">Active Breaches</h2>
                {breaches.length > 0 && (
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 uppercase tracking-tighter">
                    {breaches.length} Alert{breaches.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {breaches.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium text-center">All systems operational.<br/>Zero breaches detected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {breaches.slice(0, 4).map((b) => (
                    <div key={b.reportId} className="group p-4 bg-[#0f172a]/50 rounded-2xl border border-[#334155] hover:border-red-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${b.severity === 'Critical' ? 'bg-red-400 text-[#0f172a]' : 'bg-orange-400 text-[#0f172a]'}`}>
                          {b.severity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">+{b.timeExceeded}</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{b.category}</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{b.district}</p>
                    </div>
                  ))}
                  {breaches.length > 4 && (
                    <button className="w-full py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                      + {breaches.length - 4} more alerts
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Delay Analysis */}
            {summary && summary.highestDelayDistricts.length > 0 && (
               <div className="bg-[#1e293b]/50 border border-[#334155] rounded-[32px] p-8 space-y-6">
                  <h2 className="font-bold text-white text-lg flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-400" /> Delay Analysis
                  </h2>
                  <div className="space-y-4">
                     {summary.highestDelayDistricts.map((d, i) => (
                        <div key={d.district} className="space-y-2">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-400 uppercase tracking-widest">{d.district}</span>
                              <span className="text-white">{d.avgDelay.toFixed(1)}h avg</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full" 
                                style={{ width: `${Math.min((d.avgDelay / 48) * 100, 100)}%` }}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
        </div>
      </div>
    </div>
  );
}
