'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getReports, getCategories } from '@/lib/storage';
import { getFollowedReportIds } from '@/lib/follow-system';
import { Report, ReportStatus, Urgency } from '@/lib/types';
import { StatusBadge } from '../dashboard/page';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Separator
} from '@/components/ui/separator';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    MapPin,
    Clock,
    Zap,
    Search,
    Filter,
    ArrowUpDown,
    ChevronRight,
    Info,
    Calendar,
    User,
    CheckCircle2,
    Circle,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Helpers ---

const categoryEmojis: Record<string, string> = {
    Pothole: '🕳',
    Streetlight: '💡',
    'Water Leak': '💧',
    Trash: '🗑',
    Sewage: '🔧',
    Electrical: '⚡',
    'Road Damage': '🚧',
};

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

function formatDate(isoString: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(isoString));
}

// --- Status Timeline Component ---

function StatusTimeline({ currentStatus, dates }: { currentStatus: ReportStatus, dates: { submitted: string, resolved?: string | null } }) {
    const steps = [
        { label: 'Submitted', status: 'Pending' as ReportStatus, date: formatDate(dates.submitted) },
        { label: 'Under Review', status: 'In Progress' as ReportStatus, date: 'Pending review' },
        { label: 'In Progress', status: 'In Progress' as ReportStatus, date: 'Technician assigned' },
        { label: 'Resolved', status: 'Resolved' as ReportStatus, date: dates.resolved ? formatDate(dates.resolved) : 'Final step' },
    ];

    const getStepState = (status: ReportStatus, index: number) => {
        const order: ReportStatus[] = ['Pending', 'In Progress', 'Resolved'];
        const currentIndex = order.indexOf(currentStatus === 'Rejected' ? 'Pending' : currentStatus);

        if (currentStatus === 'Resolved' && index === 3) return 'completed';
        if (currentIndex >= index) return 'completed';
        return 'pending';
    };

    return (
        <div className="space-y-6 mt-6">
            {steps.map((step, idx) => {
                const state = getStepState(currentStatus, idx);
                return (
                    <div key={idx} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                state === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#334155] text-slate-800"
                            )}>
                                {state === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            {idx < steps.length - 1 && <div className={cn("w-0.5 flex-1 my-1", state === 'completed' ? "bg-emerald-500" : "bg-[#334155]")} />}
                        </div>
                        <div className="pb-4">
                            <p className={cn("text-sm font-bold", state === 'completed' ? "text-white" : "text-slate-500")}>{step.label}</p>
                            <p className="text-[10px] text-slate-500">{step.date}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- Main Page ---

export default function MyReportsPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        if (currentUser) {
            const all = getReports();
            const followedIds = getFollowedReportIds(currentUser.id);
            setAllReports(all.filter(r => r.citizenId === currentUser.id || followedIds.includes(r.id)));
        }
    }, [currentUser]);

    const filteredReports = useMemo(() => {
        let list = [...allReports];

        if (statusFilter !== 'All') {
            list = list.filter(r => r.status === statusFilter);
        }

        if (categoryFilter !== 'All') {
            list = list.filter(r => r.category === categoryFilter);
        }

        list.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });

        return list;
    }, [allReports, statusFilter, categoryFilter, sortOrder]);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="font-syne text-4xl font-bold text-white mb-2">My Reports</h1>
                    <p className="text-slate-400">Track and manage your submitted infrastructure issues.</p>
                </div>
                <Button
                    onClick={() => router.push('/citizen/report')}
                    className="bg-[#1a56db] hover:bg-[#1e40af] text-white px-6 shadow-xl shadow-[#1a56db]/20"
                >
                    + New Report
                </Button>
            </div>

            {/* Filters Bar */}
            <Card className="bg-[#1e293b]/50 border-[#334155] mb-8">
                <CardContent className="p-4 flex flex-col gap-4">
                    {/* Status Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <Filter className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
                        {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap",
                                    statusFilter === s
                                        ? "bg-[#1a56db] text-white border-[#1a56db] shadow-lg shadow-[#1a56db]/30"
                                        : "bg-[#0f172a] text-slate-400 border-[#334155] hover:border-[#3b82f6]/50"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <Separator className="bg-[#334155]" />

                    {/* Dropdown Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'All')}>
                                <SelectTrigger className="bg-[#0f172a] border-[#334155] text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        <SelectValue placeholder="All Categories" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-[#334155] text-white">
                                    <SelectItem value="All">All Categories</SelectItem>
                                    {getCategories().map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-48">
                            <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val || 'newest')}>
                                <SelectTrigger className="bg-[#0f172a] border-[#334155] text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="h-4 w-4" />
                                        <SelectValue placeholder="Sort Order" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-[#334155] text-white">
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(statusFilter !== 'All' || categoryFilter !== 'All') && (
                            <Button
                                variant="ghost"
                                onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); }}
                                className="text-slate-500 hover:text-white"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <Card
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="bg-[#1e293b]/50 border-[#334155] hover:border-[#3b82f6]/40 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <CardContent className="p-0">
                                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#0f172a] border border-[#334155] flex items-center justify-center text-2xl shrink-0">
                                            {categoryEmojis[report.category] || '📋'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-bold">{report.category}</h3>
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] px-1 py-0 border-none",
                                                    report.urgency === 'High' ? "text-red-500 bg-red-500/10" :
                                                        report.urgency === 'Medium' ? "text-amber-500 bg-amber-500/10" : "text-emerald-500 bg-emerald-500/10"
                                                )}>
                                                    {report.urgency}
                                                </Badge>
                                                {report.citizenId !== currentUser?.id && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-none text-blue-500 bg-blue-500/10">
                                                        Following
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 truncate max-w-[280px] sm:max-w-md">
                                                {report.address}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none border-[#334155]/30 pt-3 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <StatusBadge status={report.status} />
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {timeAgo(report.createdAt)}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                                {/* Small ID tag */}
                                <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#334155]/30 text-[9px] font-mono text-slate-600 rounded-bl-lg">
                                    {report.id}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="p-20 text-center flex flex-col items-center">
                        <MapPin className="h-16 w-16 text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-500 mb-2">No reports found</h3>
                        <p className="text-slate-600 mb-6 max-w-xs">Adjust your filters or submit a new report to populate this list.</p>
                        {(statusFilter !== 'All' || categoryFilter !== 'All') && (
                            <Button onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); }} variant="outline" className="border-[#334155]">
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
                <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-2xl overflow-y-auto max-h-[90vh] scrollbar-thin">
                    {selectedReport && (
                        <>
                            <DialogHeader className="flex-row items-center justify-between pr-8 border-b border-[#334155] pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{categoryEmojis[selectedReport.category]}</span>
                                    <div>
                                        <DialogTitle className="font-syne text-2xl">{selectedReport.category}</DialogTitle>
                                        <p className="text-[10px] font-mono text-slate-500">{selectedReport.id}</p>
                                    </div>
                                </div>
                                <StatusBadge status={selectedReport.status} />
                            </DialogHeader>

                            {selectedReport.beforePhoto && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-[#334155]">
                                    <img src={selectedReport.beforePhoto} className="w-full max-h-64 object-cover" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                {/* Info Grid */}
                                <div className="space-y-4">
                                    <DetailItem icon={<Zap className="h-4 w-4" />} label="Urgency" value={
                                        <Badge className={cn(
                                            "border-none",
                                            selectedReport.urgency === 'High' ? "bg-red-500/20 text-red-500" :
                                                selectedReport.urgency === 'Medium' ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
                                        )}>{selectedReport.urgency}</Badge>
                                    } />
                                    <DetailItem icon={<MapPin className="h-4 w-4" />} label="District" value={selectedReport.district} />
                                    <DetailItem icon={<Calendar className="h-4 w-4" />} label="Submitted" value={formatDate(selectedReport.createdAt)} />
                                    <DetailItem icon={<User className="h-4 w-4" />} label="Assigned To" value={selectedReport.assignedTo || 'Not yet assigned'} />

                                    <Separator className="bg-[#334155]" />

                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</p>
                                        <p className="text-sm text-slate-300 leading-relaxed bg-[#0f172a] p-3 rounded-lg border border-[#334155]">
                                            {selectedReport.description}
                                        </p>
                                    </div>

                                    {selectedReport.address && (
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Exact Address</p>
                                            <p className="text-sm text-white italic">{selectedReport.address}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status Timeline */}
                                <div className="bg-[#0f172a] p-6 rounded-xl border border-[#334155]">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                        <Info className="h-4 w-4 text-[#3b82f6]" /> Status Timeline
                                    </h4>
                                    <StatusTimeline
                                        currentStatus={selectedReport.status}
                                        dates={{ submitted: selectedReport.createdAt, resolved: selectedReport.resolvedAt }}
                                    />
                                </div>
                            </div>

                            {selectedReport.status === 'Rejected' && (
                                <Alert className="bg-red-500/10 border-red-500/30 mt-6">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <AlertTitle className="text-red-500 font-bold">Report Rejected</AlertTitle>
                                    <AlertDescription className="text-red-400">
                                        {selectedReport.rejectionReason || "Reason: Issue doesn't meet reporting criteria or insufficient evidence provided."}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#334155] flex items-center justify-center text-slate-500 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                <div className="text-sm text-white">{value}</div>
            </div>
        </div>
    );
}
