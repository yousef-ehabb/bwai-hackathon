import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TechnicianWorkload } from '@/lib/manager-types';
import { UserCheck, AlertCircle } from 'lucide-react';

interface MgrAssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  technicians: TechnicianWorkload[];
  onAssign: (techId: string) => void;
}

export function MgrAssignDialog({ isOpen, onClose, reportId, technicians, onAssign }: MgrAssignDialogProps) {
  const [selectedTech, setSelectedTech] = useState<string>('');

  // Suggest least busy tech
  const suggestedTech = technicians.reduce((prev, curr) => 
    prev.activeTasks < curr.activeTasks ? prev : curr
  , technicians[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-[32px] sm:max-w-[440px] p-8">
        <DialogHeader className="mb-6">
          <div className="w-12 h-12 bg-[#494fdf]/10 rounded-full flex items-center justify-center mb-4">
             <UserCheck className="h-6 w-6 text-[#494fdf]" />
          </div>
          <DialogTitle className="text-3xl font-display font-medium tracking-tight">Assign Task</DialogTitle>
          <DialogDescription className="text-muted-foreground font-body">
            Dispatch a field technician to resolve report <span className="font-bold text-primary">#{reportId.slice(0,8)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mb-8">
          <div className="space-y-3">
             <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Technician</Label>
             <Select value={selectedTech} onValueChange={(val) => setSelectedTech(val || '')}>
                <SelectTrigger className="h-14 rounded-xl border-border bg-surface/50">
                   <SelectValue placeholder="Choose a technician" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border rounded-xl">
                   {technicians.map(tech => (
                      <SelectItem key={tech.id} value={tech.id} className="py-3">
                         <div className="flex flex-col">
                            <span className="font-bold text-primary">{tech.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                               {tech.activeTasks} Active Tasks
                            </span>
                         </div>
                      </SelectItem>
                   ))}
                </SelectContent>
             </Select>
          </div>

          {suggestedTech && !selectedTech && (
            <div className="p-4 bg-[#00a87e]/10 border border-[#00a87e]/20 rounded-2xl flex items-start gap-3">
               <AlertCircle className="h-5 w-5 text-[#00a87e] shrink-0 mt-0.5" />
               <div>
                  <p className="text-[11px] font-bold text-[#00a87e] uppercase tracking-wider mb-1">Recommendation</p>
                  <p className="text-sm text-primary leading-relaxed">
                     <span className="font-bold">{suggestedTech.name}</span> is currently the least busy with only {suggestedTech.activeTasks} active tasks.
                  </p>
               </div>
            </div>
          )}
        </div>

        <DialogFooter>
           <Button 
             variant="outline" 
             onClick={onClose} 
             className="rounded-full flex-1"
           >
             Cancel
           </Button>
           <Button 
             onClick={() => onAssign(selectedTech)} 
             disabled={!selectedTech}
             className="bg-brand-blue border-brand-blue text-white rounded-full flex-[1.5]"
           >
             Assign Now
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
