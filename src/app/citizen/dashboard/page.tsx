'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getReports } from '@/lib/storage';
import { getFollowedReportIds } from '@/lib/follow-system';
import { Report, ReportStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RoleBadge from '@/components/RoleBadge';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle,
  ChevronRight,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for time ago
function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// StatusBadge Component
export function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    Pending: 'bg-yellow-500/10 text-[#ec7e00] border-[#ec7e00]/20',
    'In Progress': 'bg-[#494fdf]/10 text-[#494fdf] border-[#494fdf]/20',
    Resolved: 'bg-[#00a87e]/10 text-[#00a87e] border-[#00a87e]/20',
    Rejected: 'bg-[#e23b4a]/10 text-[#e23b4a] border-[#e23b4a]/20',
  };

  return (
    <Badge variant="outline" className={cn('rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider', styles[status])}>
      {status}
    </Badge>
  );
}

const categoryEmojis: Record<string, string> = {
  Pothole: '🕳',
  Streetlight: '💡',
  'Water Leak': '💧',
  Trash: '🗑',
  Sewage: '🔧',
  Electrical: '⚡',
  'Road Damage': '🚧',
};

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (currentUser) {
      const allReports = getReports();
      const followedIds = getFollowedReportIds(currentUser.id);
      setReports(allReports.filter((r) => r.citizenId === currentUser.id || followedIds.includes(r.id)));
    }
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [currentUser]);

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    inProgress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  };

  const recentReports = reports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 sm:mb-3">{formattedDate}</p>
          <h1 className="text-4xl sm:text-5xl md:text-display-hero text-primary font-medium tracking-tight leading-tight sm:leading-none">
            {greeting},<br />
            {currentUser?.name?.split(' ')[0]}
          </h1>
        </div>
        <Button onClick={() => router.push('/citizen/report')} className="w-full sm:w-auto h-12 sm:h-auto bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/20">
          Report New Issue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Active" value={stats.inProgress} color="blue" />
        <StatCard label="Resolved" value={stats.resolved} color="green" />
      </div>

      {/* Featured CTA */}
      <div
        className="relative overflow-hidden rounded-[32px] bg-primary p-10 sm:p-16 mb-12 group cursor-pointer transition-all active:scale-[0.98]"
        onClick={() => router.push('/citizen/report')}
      >
        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-display font-medium text-white mb-6 leading-tight">
            Help us fix your neighborhood.
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed font-body">
            Report infrastructure issues like potholes, leaks, or broken streetlights and watch them get fixed in real-time.
          </p>
          <div className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-primary font-display font-bold text-lg group-hover:scale-105 transition-transform">
            Start a report
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-2xl font-display font-medium text-primary">Recent Activity</h2>
          <Link href="/citizen/my-reports" className="text-sm font-bold text-brand-blue hover:underline">View all</Link>
        </div>

        {recentReports.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-6 rounded-[24px] bg-surface hover:bg-border/20 transition-all cursor-pointer group"
                onClick={() => router.push('/citizen/my-reports')}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-white border border-border flex items-center justify-center text-3xl shadow-sm">
                    {categoryEmojis[report.category] || '📋'}
                  </div>
                  <div>
                    <h4 className="text-[18px] font-bold text-primary mb-1">{report.category}</h4>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-md">
                      {report.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <StatusBadge status={report.status} />
                    <p className="text-[11px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">{timeAgo(report.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-[32px] border-2 border-dashed border-border group hover:border-brand-blue/30 transition-all">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:text-brand-blue group-hover:scale-110 transition-all" />
            <h3 className="text-xl font-bold text-primary mb-2">No active reports</h3>
            <p className="text-muted-foreground">Your city is quiet. Report any issues you find.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'primary' }: { label: string, value: number, color?: string }) {
  const textStyles: Record<string, string> = {
    primary: 'text-primary',
    yellow: 'text-[#ec7e00]',
    blue: 'text-[#494fdf]',
    green: 'text-[#00a87e]',
  };

  return (
    <Card className="bg-surface border-none rounded-[28px] overflow-hidden">
      <CardContent className="p-8">
        <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
        <p className={cn('text-5xl font-display font-medium tracking-tighter', textStyles[color])}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
