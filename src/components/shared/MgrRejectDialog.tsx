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
import { Textarea } from "@/components/ui/textarea";
import { XCircle, AlertCircle } from 'lucide-react';

interface MgrRejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onReject: (reason: string) => void;
}

export function MgrRejectDialog({ isOpen, onClose, reportId, onReject }: MgrRejectDialogProps) {
  const [reason, setReason] = useState('');

  const isValid = reason.trim().length >= 10;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-[32px] sm:max-w-[440px] p-8">
        <DialogHeader className="mb-6">
          <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mb-4">
             <XCircle className="h-6 w-6 text-danger" />
          </div>
          <DialogTitle className="text-3xl font-display font-medium tracking-tight">Reject Report</DialogTitle>
          <DialogDescription className="text-muted-foreground font-body">
            Provide a mandatory reason for rejecting report <span className="font-bold text-primary">#{reportId.slice(0,8)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mb-8">
          <div className="space-y-3">
             <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Rejection Reason</Label>
             <Textarea 
                placeholder="Describe why this report cannot be addressed (e.g., Duplication, outside jurisdiction, insufficient evidence...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px] rounded-2xl border-border bg-surface/50 p-4 focus:ring-danger/20"
             />
             <div className="flex items-center gap-2 mt-2">
                <AlertCircle className={reason.length >= 10 ? "h-3 w-3 text-emerald-500" : "h-3 w-3 text-muted-foreground"} />
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                   {reason.length < 10 ? `Need ${10 - reason.length} more characters` : "Reason valid"}
                </p>
             </div>
          </div>
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
             onClick={() => onReject(reason)} 
             disabled={!isValid}
             className="bg-danger border-danger text-white rounded-full flex-[1.5]"
           >
             Confirm Rejection
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
