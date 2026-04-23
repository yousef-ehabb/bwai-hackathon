'use client';

import { DistrictStats } from '@/lib/gov-types';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface GovResolutionGraphProps {
  data: DistrictStats[];
}

export default function GovResolutionGraph({ data }: GovResolutionGraphProps) {
  const max = Math.max(...data.map((d) => d.avgResolutionTime), 1);

  return (
    <div className="space-y-4">
      {data.map((district) => {
        const pct = (district.avgResolutionTime / max) * 100;
        const hours = district.avgResolutionTime;
        const label = hours < 1
          ? `${Math.round(hours * 60)}m`
          : `${hours.toFixed(1)}h`;

        const barColor = hours < 4
          ? 'bg-emerald-400'
          : hours < 12
          ? 'bg-yellow-400'
          : 'bg-red-400';

        return (
          <div key={district.districtName} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <p className="text-[13px] font-medium text-slate-300">{district.districtName}</p>
              <div className="flex items-center gap-1 text-[12px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{district.resolvedCount > 0 ? label : '—'}</span>
              </div>
            </div>
            <div className="w-full bg-[#0f172a] rounded-full h-2 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', barColor)}
                style={{ width: `${district.resolvedCount > 0 ? pct : 0}%` }}
              />
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
