/**
 * GovDailySummary Component
 * 
 * Daily Executive Summary widget for Governor Dashboard.
 * Displays key metrics, trends, and critical issues.
 */

'use client';

import { useEffect, useState } from 'react';
import { DailySummary, getScheduledSummary, formatSummaryForEmail } from '@/lib/gov-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ShieldAlert,
  MapPin,
  ChevronRight,
  RefreshCw,
  Mail,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GovDailySummaryProps {
  className?: string;
}

export default function GovDailySummary({ className }: GovDailySummaryProps) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const loadSummary = () => {
    setIsLoading(true);
    // Simulate async loading
    setTimeout(() => {
      const data = getScheduledSummary();
      setSummary(data);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleRefresh = () => {
    loadSummary();
    toast.success('Summary refreshed');
  };

  const handleEmailPreview = () => {
    setShowEmailPreview(true);
  };

  if (isLoading) {
    return (
      <Card className={cn('bg-[#1e293b] border-[#334155]', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading executive summary...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className={cn('bg-[#1e293b] border-[#334155]', className)}>
        <CardContent className="p-6">
          <p className="text-slate-400 text-sm">No summary data available</p>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { metrics, trends, criticalIssues, topDistricts } = summary;

  return (
    <>
      <Card className={cn('bg-[#1e293b] border-[#334155] overflow-hidden', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white text-lg font-semibold">
                  Daily Executive Summary
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated at {new Date(summary.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={handleEmailPreview}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Created"
              value={metrics.reportsCreated}
              trend={trends.vsYesterday.reportsCreated}
              icon={<FileText className="h-4 w-4" />}
              accent="blue"
            />
            <MetricCard
              label="Resolved"
              value={metrics.reportsResolved}
              trend={trends.vsYesterday.reportsResolved}
              icon={<CheckCircle className="h-4 w-4" />}
              accent="emerald"
            />
            <MetricCard
              label="Avg Time"
              value={`${metrics.avgResolutionTime.toFixed(1)}h`}
              trend={null}
              icon={<Clock className="h-4 w-4" />}
              accent="purple"
            />
            <MetricCard
              label="Breaches"
              value={metrics.slaBreaches}
              trend={null}
              isNegativeGood={true}
              icon={<ShieldAlert className="h-4 w-4" />}
              accent={metrics.slaBreaches > 0 ? 'red' : 'emerald'}
            />
          </div>

          {/* SLA Alert Banner */}
          {metrics.slaBreaches > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">
                  {metrics.slaBreaches} Active SLA Breach{metrics.slaBreaches > 1 ? 'es' : ''}
                </p>
                <p className="text-xs text-red-400/70 mt-0.5">
                  {metrics.criticalUnassigned} critical ({'>'}30min) · {metrics.highPriorityUnassigned} high priority ({'>'}4h)
                </p>
              </div>
              <Badge variant="outline" className="border-red-400/30 text-red-400 text-xs">
                Action Required
              </Badge>
            </div>
          )}

          {/* Top Districts Preview */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Top Districts by Volume
            </h4>
            <div className="space-y-2">
              {topDistricts.slice(0, 3).map((district, index) => (
                <div
                  key={district.districtName}
                  className="flex items-center gap-3 p-2.5 bg-[#0f172a] rounded-lg"
                >
                  <span className="text-xs font-bold text-slate-500 w-4">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {district.districtName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{district.reportCount} reports</span>
                      <span>·</span>
                      <span className={cn(
                        district.resolutionRate >= 70 ? 'text-emerald-400' :
                        district.resolutionRate >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      )}>
                        {district.resolutionRate.toFixed(0)}% resolved
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Details Button */}
          <Button
            variant="outline"
            className="w-full border-[#334155] text-slate-300 hover:bg-[#334155]/50 hover:text-white"
            onClick={() => setShowDetails(true)}
          >
            View Full Summary
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Full Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Daily Executive Summary
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {new Date(summary.date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Full Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Reports Created" value={metrics.reportsCreated} />
              <StatBox label="Reports Resolved" value={metrics.reportsResolved} />
              <StatBox label="In Progress" value={metrics.reportsInProgress} />
              <StatBox label="Avg Resolution" value={`${metrics.avgResolutionTime.toFixed(1)}h`} />
            </div>

            {/* Critical Issues */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                Critical Issues ({criticalIssues.length})
              </h4>
              {criticalIssues.length > 0 ? (
                <div className="space-y-2">
                  {criticalIssues.slice(0, 5).map((issue) => (
                    <div
                      key={issue.reportId}
                      className={cn(
                        'p-3 rounded-lg border flex items-center justify-between',
                        issue.status === 'critical'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-orange-500/10 border-orange-500/20'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {issue.category} in {issue.district}
                        </p>
                        <p className="text-xs text-slate-400">
                          {issue.urgency} priority · {issue.hoursUnassigned.toFixed(1)}h unassigned
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          'text-xs',
                          issue.status === 'critical'
                            ? 'bg-red-400/20 text-red-400 border-red-400/30'
                            : 'bg-orange-400/20 text-orange-400 border-orange-400/30'
                        )}
                      >
                        {issue.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                  {criticalIssues.length > 5 && (
                    <p className="text-xs text-slate-500 text-center py-2">
                      +{criticalIssues.length - 5} more issues
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-emerald-400">No critical issues at this time</p>
                </div>
              )}
            </div>

            {/* All Districts */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                All Districts Performance
              </h4>
              <div className="space-y-2">
                {topDistricts.map((district, index) => (
                  <div
                    key={district.districtName}
                    className="p-3 bg-[#0f172a] rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-4">{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{district.districtName}</p>
                        <p className="text-xs text-slate-500">
                          Avg resolution: {district.avgResolutionTime < 1
                            ? `${Math.round(district.avgResolutionTime * 60)}m`
                            : `${district.avgResolutionTime.toFixed(1)}h`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{district.reportCount}</p>
                      <p className={cn(
                        'text-xs',
                        district.resolutionRate >= 70 ? 'text-emerald-400' :
                        district.resolutionRate >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      )}>
                        {district.resolvedCount}/{district.reportCount} resolved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" />
              Email Preview
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This is how the daily summary would appear in email format
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {formatSummaryForEmail(summary)}
              </pre>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="border-[#334155] text-slate-300"
                onClick={() => {
                  navigator.clipboard.writeText(formatSummaryForEmail(summary));
                  toast.success('Copied to clipboard');
                }}
              >
                Copy Text
              </Button>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  toast.success('Email simulation: Sent to Governor');
                  setShowEmailPreview(false);
                }}
              >
                Simulate Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Sub-components ---

function MetricCard({
  label,
  value,
  trend,
  icon,
  accent,
  isNegativeGood = false,
}: {
  label: string;
  value: number | string;
  trend: number | null;
  icon: React.ReactNode;
  accent: 'blue' | 'emerald' | 'purple' | 'red' | 'yellow';
  isNegativeGood?: boolean;
}) {
  const accentColors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-400/10', text: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
    purple: { bg: 'bg-purple-400/10', text: 'text-purple-400' },
    red: { bg: 'bg-red-400/10', text: 'text-red-400' },
    yellow: { bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
  };

  const showTrend = trend !== null && trend !== 0;
  const isPositive = trend !== null && trend > 0;
  const trendIsGood = isNegativeGood ? !isPositive : isPositive;

  return (
    <div className={cn('p-3 rounded-xl', accentColors[accent].bg)}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('text-slate-400', accentColors[accent].text)}>{icon}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-white">{value}</span>
        {showTrend && (
          <div className={cn(
            'flex items-center text-xs',
            trendIsGood ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-0.5" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-0.5" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 bg-[#0f172a] rounded-lg text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
