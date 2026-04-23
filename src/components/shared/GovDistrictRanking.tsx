'use client';

import { DistrictStats } from '@/lib/gov-types';
import { cn } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GovDistrictRankingProps {
  data: DistrictStats[];
  compact?: boolean;
}

function getRankBadge(index: number) {
  if (index === 0) return 'text-yellow-400';
  if (index === 1) return 'text-slate-300';
  if (index === 2) return 'text-amber-600';
  return 'text-slate-500';
}

function getPerformanceColor(rate: number): string {
  if (rate >= 70) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (rate >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
}

function getPerformanceIcon(rate: number) {
  if (rate >= 70) return <TrendingUp className="w-3.5 h-3.5" />;
  if (rate >= 40) return <Minus className="w-3.5 h-3.5" />;
  return <TrendingDown className="w-3.5 h-3.5" />;
}

export default function GovDistrictRanking({ data, compact = false }: GovDistrictRankingProps) {
  return (
    <div className="space-y-2">
      {data.map((district, index) => {
        const perfColor = getPerformanceColor(district.resolutionRate);
        return (
          <div
            key={district.districtName}
            className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-[#1e293b] hover:border-[#334155] transition-all"
          >
            {/* Rank */}
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', getRankBadge(index))}>
              {index < 3 ? (
                <Trophy className="w-3.5 h-3.5" />
              ) : (
                <span className="text-[12px] font-bold text-slate-500">{index + 1}</span>
              )}
            </div>

            {/* District Name */}
            <p className="flex-1 text-[14px] font-semibold text-white">{district.districtName}</p>

            {/* Stats (hide if compact) */}
            {!compact && (
              <div className="flex gap-4 text-[12px] text-slate-400">
                <span><span className="text-white font-medium">{district.totalReports}</span> reports</span>
                <span><span className="text-white font-medium">{district.pendingCount}</span> pending</span>
              </div>
            )}

            {/* Resolution Rate Badge */}
            <div className={cn('flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full border', perfColor)}>
              {getPerformanceIcon(district.resolutionRate)}
              <span>{district.resolutionRate.toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
      {data.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">No district data available</p>
      )}
    </div>
  );
}
