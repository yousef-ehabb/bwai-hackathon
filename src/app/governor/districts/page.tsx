'use client';

import { useEffect, useState } from 'react';
import { getDistrictRankings, getSLABreaches } from '@/lib/gov-storage';
import { DistrictStats, SLABreach } from '@/lib/gov-types';
import GovDistrictRanking from '@/components/shared/GovDistrictRanking';
import { Map, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GovernorDistrictsPage() {
  const [districts, setDistricts] = useState<DistrictStats[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const d = getDistrictRankings();
    setDistricts(d);
    setBreaches(getSLABreaches());
    if (d.length > 0) setSelected(d[0].districtName);
  }, []);

  const selectedDistrict = districts.find((d) => d.districtName === selected);
  const districtBreaches = breaches.filter((b) => b.district === selected);

  function getStatusColor(rate: number) {
    if (rate >= 70) return 'border-emerald-400/30 bg-emerald-400/5';
    if (rate >= 40) return 'border-yellow-400/30 bg-yellow-400/5';
    return 'border-red-400/30 bg-red-400/5';
  }

  function getStatusLabel(rate: number) {
    if (rate >= 70) return { label: 'High Performer', color: 'text-emerald-400' };
    if (rate >= 40) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'Needs Attention', color: 'text-red-400' };
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#0f172a]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
          <Map className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-display">District Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Performance rankings across {districts.length} districts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rankings List */}
        <div className="lg:col-span-1 bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-slate-400">Ranking</h2>
          <div className="space-y-2">
            {districts.map((d, i) => {
              const { label, color } = getStatusLabel(d.resolutionRate);
              return (
                <button
                  key={d.districtName}
                  onClick={() => setSelected(d.districtName)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                    selected === d.districtName
                      ? 'border-blue-400/40 bg-blue-400/5'
                      : 'border-[#0f172a] bg-[#0f172a] hover:border-[#334155]'
                  )}
                >
                  <span className="text-[13px] font-bold text-slate-500 w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{d.districtName}</p>
                    <p className={cn('text-xs', color)}>{label}</p>
                  </div>
                  <span className="text-xs font-bold text-white">{d.resolutionRate.toFixed(0)}%</span>
                </button>
              );
            })}
            {districts.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No district data</p>
            )}
          </div>
        </div>

        {/* District Detail */}
        {selectedDistrict && (
          <div className="lg:col-span-2 space-y-4">
            {/* Stats */}
            <div className={cn('border rounded-2xl p-6 space-y-4', getStatusColor(selectedDistrict.resolutionRate))}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedDistrict.districtName}</h2>
                  <p className={cn('text-sm font-medium mt-0.5', getStatusLabel(selectedDistrict.resolutionRate).color)}>
                    {getStatusLabel(selectedDistrict.resolutionRate).label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{selectedDistrict.resolutionRate.toFixed(0)}%</p>
                  <p className="text-xs text-slate-400">resolution rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Reports', value: selectedDistrict.totalReports },
                  { label: 'Resolved', value: selectedDistrict.resolvedCount },
                  { label: 'Pending', value: selectedDistrict.pendingCount },
                  {
                    label: 'Avg Resolution',
                    value:
                      selectedDistrict.avgResolutionTime < 1
                        ? `${Math.round(selectedDistrict.avgResolutionTime * 60)}m`
                        : `${selectedDistrict.avgResolutionTime.toFixed(1)}h`,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#0f172a]/60 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Breaches for this district */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">SLA Breaches in {selectedDistrict.districtName}</h3>
                {districtBreaches.length > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                    {districtBreaches.length} Active
                  </span>
                )}
              </div>
              {districtBreaches.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                  <p className="text-sm text-slate-400">No SLA breaches in this district</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {districtBreaches.map((b) => (
                    <div key={b.reportId} className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-[#1e293b]">
                      <AlertTriangle className={cn('w-4 h-4 shrink-0', b.severity === 'Critical' ? 'text-red-400' : 'text-orange-400')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{b.category}</p>
                        <p className="text-xs text-slate-500">Urgency: {b.urgency}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-xs font-semibold', b.severity === 'Critical' ? 'text-red-400' : 'text-orange-400')}>
                          {b.severity}
                        </p>
                        <p className="text-xs text-slate-500">+{b.timeExceeded} overdue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
