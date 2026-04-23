'use client';

import { useEffect, useState } from 'react';
import { getCategoryBreakdown, getDistrictRankings } from '@/lib/gov-storage';
import { CategoryStats, DistrictStats } from '@/lib/gov-types';
import GovCategoryChart from '@/components/shared/GovCategoryChart';
import GovResolutionGraph from '@/components/shared/GovResolutionGraph';
import { BarChart3, Clock } from 'lucide-react';

export default function GovernorAnalyticsPage() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [districts, setDistricts] = useState<DistrictStats[]>([]);

  useEffect(() => {
    setCategories(getCategoryBreakdown());
    setDistricts(getDistrictRankings());
  }, []);

  const totalReports = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#0f172a]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white font-display">City Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Aggregated insights across all districts — {totalReports} total reports tracked.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Top Reported Categories</h2>
              <p className="text-xs text-slate-500">By volume across the city</p>
            </div>
          </div>
          <GovCategoryChart data={categories} />
        </div>

        {/* Resolution Time Graph */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Avg Resolution Time</h2>
              <p className="text-xs text-slate-500">By district — green &lt;4h, yellow &lt;12h, red 12h+</p>
            </div>
          </div>
          <GovResolutionGraph data={districts} />
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white text-base">Detailed Category Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider pb-3 font-medium">Category</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider pb-3 font-medium">Reports</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider pb-3 font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {categories.map((cat) => (
                <tr key={cat.category} className="hover:bg-[#0f172a]/50 transition-colors">
                  <td className="py-3 text-slate-300 font-medium">{cat.category}</td>
                  <td className="py-3 text-right text-white font-semibold">{cat.count}</td>
                  <td className="py-3 text-right text-slate-400">
                    {totalReports > 0 ? `${((cat.count / totalReports) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">No reports data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
