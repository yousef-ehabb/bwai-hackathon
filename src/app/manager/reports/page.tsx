'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDistrictReports, getDistrictTechnicians, assignTechnician, rejectReport } from '@/lib/manager-storage';
import { Report, ReportStatus } from '@/lib/types';
import { TechnicianWorkload } from '@/lib/manager-types';
import { MgrReportCard } from '@/components/shared/MgrReportCard';
import { MgrAssignDialog } from '@/components/shared/MgrAssignDialog';
import { MgrRejectDialog } from '@/components/shared/MgrRejectDialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ArrowLeft, MoreVertical, Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Main Reports Page Wrapped in Suspense for Search Params
 */
export default function ManagerReportsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading Situation Room...</div>}>
       <ReportsContent />
    </Suspense>
  );
}

function ReportsContent() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWorkload[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // States for Dialogs
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Filters
  const initialFilter = searchParams.get('filter');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter === 'SLA' ? 'Pending' : 'All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  function loadData() {
    if (currentUser?.district) {
      const all = getDistrictReports(currentUser.district);
      const techs = getDistrictTechnicians(currentUser.district);
      setReports(all);
      setTechnicians(techs);
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    const matchesSearch = r.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAssign = (techId: string) => {
    if (!selectedReport) return;
    assignTechnician(selectedReport.id, techId);
    toast.success('Technician Assigned Successfully');
    setIsAssignOpen(false);
    setIsDetailOpen(false);
    loadData();
  };

  const handleReject = (reason: string) => {
    if (!selectedReport) return;
    rejectReport(selectedReport.id, reason);
    toast.success('Report Rejected');
    setIsRejectOpen(false);
    setIsDetailOpen(false);
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/manager/dashboard')}>
               <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
               <h1 className="text-4xl font-display font-semibold tracking-tight text-primary">Triage Room</h1>
               <p className="text-sm text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1">Report Crisis Management</p>
            </div>
         </div>
         <Badge className="bg-brand-blue/10 text-brand-blue border-none rounded-full px-4 py-2 font-display font-bold text-sm">
            {currentUser?.district} District
         </Badge>
      </div>

      {/* Toolbar */}
      <div className="bg-surface rounded-full p-2 pl-6 mb-8 flex flex-col md:flex-row items-center gap-4 border border-border/50">
          <div className="flex-1 flex items-center gap-3 w-full">
             <Search className="h-5 w-5 text-muted-foreground" />
             <Input 
                placeholder="Search by address or category..." 
                className="bg-transparent border-none focus-visible:ring-0 text-primary placeholder:text-muted-foreground/60 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="flex items-center gap-2 pr-2 w-full md:w-auto">
             <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'All')}>
                <SelectTrigger className="h-12 w-full md:w-40 rounded-full border-border bg-white text-primary">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl">
                   <SelectItem value="All">All Statuses</SelectItem>
                   <SelectItem value="Pending">Pending</SelectItem>
                   <SelectItem value="In Progress">In Progress</SelectItem>
                   <SelectItem value="Resolved">Resolved</SelectItem>
                   <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
             </Select>
          </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        {filteredReports.length > 0 ? filteredReports.map(report => (
           <MgrReportCard 
              key={report.id} 
              report={report} 
              onClick={() => {
                setSelectedReport(report);
                setIsDetailOpen(true);
              }}
           />
        )) : (
          <div className="text-center py-20 bg-surface rounded-[40px] border-2 border-dashed border-border">
             <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-xl font-bold text-primary">No matching reports</h3>
             <p className="text-muted-foreground">Adjust your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-white rounded-[32px] sm:max-w-2xl p-0 overflow-hidden">
           {selectedReport && (
             <div className="flex flex-col">
                <div className="w-full h-64 bg-surface relative">
                   {selectedReport.beforePhoto ? (
                      <img src={selectedReport.beforePhoto} className="w-full h-full object-cover" alt="Citizen Photo" />
                   ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No Evidence Photo</div>
                   )}
                   <div className="absolute top-6 left-6">
                      <Badge className="bg-primary text-white rounded-full px-4 py-1 uppercase font-bold tracking-widest border-none">
                         {selectedReport.urgency}
                      </Badge>
                   </div>
                </div>

                <div className="p-8">
                   <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-display font-medium tracking-tight mb-2">{selectedReport.category}</h2>
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                           <MapPinIcon className="h-4 w-4" /> {selectedReport.address}
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Generated</p>
                         <p className="text-sm font-bold text-primary">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="bg-surface/50 rounded-2xl p-6 mb-8 border border-border/50">
                      <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-3">Citizen Description</p>
                      <p className="text-primary leading-relaxed italic">
                         "{selectedReport.description}"
                      </p>
                   </div>

                   {selectedReport.status === 'Pending' ? (
                      <div className="flex p-1 bg-surface rounded-full gap-2">
                         <Button 
                            className="flex-1 bg-brand-blue border-brand-blue text-white rounded-full group overflow-hidden relative h-14"
                            onClick={() => setIsAssignOpen(true)}
                         >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                               <Check className="h-5 w-5" /> Assign Technician
                            </span>
                         </Button>
                         <Button 
                            variant="ghost" 
                            className="flex-1 text-danger hover:bg-danger/10 rounded-full h-14"
                            onClick={() => setIsRejectOpen(true)}
                         >
                            <X className="h-5 w-5 mr-2" /> Reject Report
                         </Button>
                      </div>
                   ) : (
                      <div className="flex items-center justify-center gap-4 py-4 border-2 border-border/30 rounded-[32px]">
                         <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                         <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">
                            Status: {selectedReport.status}
                         </p>
                      </div>
                   )}
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>

      {/* Secondary Dialogs */}
      {selectedReport && (
        <>
          <MgrAssignDialog 
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            reportId={selectedReport.id}
            technicians={technicians}
            onAssign={handleAssign}
          />
          <MgrRejectDialog 
            isOpen={isRejectOpen}
            onClose={() => setIsRejectOpen(false)}
            reportId={selectedReport.id}
            onReject={handleReject}
          />
        </>
      )}
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
