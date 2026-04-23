'use client';

import { CategoryStats } from '@/lib/gov-types';
import { cn } from '@/lib/utils';

interface GovCategoryChartProps {
  data: CategoryStats[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Pothole: 'bg-orange-400',
  'Broken Streetlight': 'bg-yellow-400',
  'Water Leak': 'bg-blue-400',
  Trash: 'bg-red-400',
  Flooding: 'bg-cyan-400',
  'Damaged Road': 'bg-amber-400',
  'Fallen Tree': 'bg-green-400',
};

function getColor(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-slate-400';
}

export default function GovCategoryChart({ data }: GovCategoryChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct = (item.count / max) * 100;
        return (
          <div key={item.category} className="flex items-center gap-3">
            <p className="w-40 text-[13px] text-slate-300 truncate shrink-0">{item.category}</p>
            <div className="flex-1 bg-[#0f172a] rounded-full h-2.5 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', getColor(item.category))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-[13px] font-semibold text-white shrink-0">
              {item.count}
            </span>
          </div>
        );
      })}
      {data.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">No data available</p>
      )}
    </div>
  );
}
