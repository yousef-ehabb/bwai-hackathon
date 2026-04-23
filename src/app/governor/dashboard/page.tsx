'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCityOverviewStats, getDistrictRankings, getSLABreaches } from '@/lib/gov-storage';
import { CityOverview, DistrictStats, SLABreach } from '@/lib/gov-types';
import GovStatCard from '@/components/shared/GovStatCard';
import GovDistrictRanking from '@/components/shared/GovDistrictRanking';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Activity,
} from 'lucide-react';

export default function GovernorDashboard() {
  const { currentUser } = useAuth();
  const [overview, setOverview] = useState<CityOverview | null>(null);
  const [rankings, setRankings] = useState<DistrictStats[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);

  useEffect(() => {
    setOverview(getCityOverviewStats());
    setRankings(getDistrictRankings());
    setBreaches(getSLABreaches());
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
    <div className="p-8 space-y-8 min-h-screen bg-[#0f172a]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#e61e49] animate-pulse" />
          <p className="text-[12px] font-medium text-[#e61e49] uppercase tracking-widest">Live City View</p>
        </div>
        <h1 className="text-3xl font-bold text-white font-display">
          Governor's Command Center
        </h1>
        <p className="text-slate-400 mt-1 text-sm">{now}</p>
      </div>

      {/* SLA Breach Banner */}
      {breaches.length > 0 && (
        <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-300 text-sm">
              {breaches.length} Active SLA Breach{breaches.length > 1 ? 'es' : ''}
            </p>
            <p className="text-red-400/70 text-xs mt-0.5">
              {breaches.filter(b => b.severity === 'Critical').length} Critical · {breaches.filter(b => b.severity === 'High').length} High priority — immediate attention required.
            </p>
          </div>
          <a
            href="/governor/dashboard#breaches"
            className="ml-auto text-xs text-red-400 hover:text-red-300 underline underline-offset-2 whitespace-nowrap"
          >
            View All
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Rankings */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-base">District Performance</h2>
            <a href="/governor/districts" className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">
              Full View →
            </a>
          </div>
          <GovDistrictRanking data={rankings.slice(0, 5)} compact />
        </div>

        {/* SLA Breaches */}
        <div id="breaches" className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-base">SLA Breaches</h2>
            {breaches.length > 0 && (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                {breaches.length} Active
              </span>
            )}
          </div>
          {breaches.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <p className="text-sm text-slate-400">All SLAs are within limits</p>
            </div>
          ) : (
            <div className="space-y-2">
              {breaches.slice(0, 5).map((b) => (
                <div key={b.reportId} className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-[#1e293b]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${b.severity === 'Critical' ? 'bg-red-400' : 'bg-orange-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{b.category}</p>
                    <p className="text-xs text-slate-500">{b.district}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.severity === 'Critical' ? 'bg-red-400/10 text-red-400' : 'bg-orange-400/10 text-orange-400'}`}>
                      {b.severity}
                    </span>
                    <span className="text-xs text-slate-500">+{b.timeExceeded}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
