import { Report } from "@/lib/types";
import { StatusBadge } from "@/app/citizen/dashboard/page"; // Reusing Phase 2 Component
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MgrReportCardProps {
  report: Report;
  onClick: () => void;
}

export function MgrReportCard({ report, onClick }: MgrReportCardProps) {
  const urgencyStyles: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-blue-50 text-[#494fdf]',
    High: 'bg-danger/10 text-danger font-bold',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex flex-col md:flex-row items-start md:items-center justify-between",
        "p-6 bg-white rounded-[32px] border border-border/50",
        "hover:border-brand-blue/30 hover:bg-surface/30 hover:scale-[1.01]",
        "px-8 transition-all cursor-pointer duration-300 active:scale-[0.99]"
      )}
    >
      <div className="flex items-center gap-6 mb-4 md:mb-0">
        <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
          {report.beforePhoto ? (
            <img src={report.beforePhoto} className="w-full h-full object-cover rounded-full" alt="Issue" />
          ) : (
            "📋"
          )}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h4 className="text-[18px] font-bold text-primary font-display">{report.category}</h4>
             <Badge className={cn("rounded-full px-2 py-0 text-[10px] uppercase font-bold tracking-widest border-none", urgencyStyles[report.urgency])}>
                {report.urgency}
             </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate max-w-xs md:max-w-md">
            <MapPin className="h-3.5 w-3.5" /> {report.address}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-12 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-border">
         <div className="flex flex-col md:items-end">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 flex items-center gap-1.5">
               <Calendar className="h-3 w-3" /> {new Date(report.createdAt).toLocaleDateString()}
            </p>
            <StatusBadge status={report.status} />
         </div>
         
         <div className="md:w-32 hidden lg:flex flex-col items-end">
             {report.assignedTo ? (
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-blue" />
                  <p className="text-[11px] font-bold text-primary uppercase">Assigned</p>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-[11px] font-bold text-amber-500 uppercase">Unassigned</p>
               </div>
             )}
         </div>
      </div>
    </div>
  );
}
