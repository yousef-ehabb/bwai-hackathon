'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GovStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accentColor?: string;
  bgColor?: string;
}

export default function GovStatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  accentColor = 'text-blue-400',
  bgColor = 'bg-blue-400/10',
}: GovStatCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="relative bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#475569] transition-all duration-200 overflow-hidden group">
      {/* Glow accent */}
      <div className={cn('absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all duration-300 group-hover:opacity-20', bgColor)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-400 tracking-wide uppercase">{label}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bgColor)}>
          <span className={cn('w-5 h-5', accentColor)}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-white font-display">{value}</p>

      {/* Trend */}
      {trend && trendLabel && (
        <div className={cn('flex items-center gap-1 text-[12px] font-medium', trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
