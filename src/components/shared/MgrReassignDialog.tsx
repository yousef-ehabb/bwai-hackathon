/**
 * MgrReassignDialog Component
 * 
 * Dialog for reassigning a task from one technician to another.
 * Extends manager functionality without modifying existing files.
 */

'use client';

import { useState, useMemo } from 'react';
import { Report } from '@/lib/types';
import { TechnicianWorkload } from '@/lib/manager-types';
import { 
  reassignReport, 
  getAvailableTechniciansForReassignment,
  validateReassignment 
} from '@/lib/manager-extensions';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRightLeft, 
  AlertCircle, 
  CheckCircle2, 
  User,
  Briefcase,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MgrReassignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  currentManagerId: string;
  onReassign: () => void;
}

export default function MgrReassignDialog({
  isOpen,
  onClose,
  report,
  currentManagerId,
  onReassign,
}: MgrReassignDialogProps) {
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const { notifyTaskReassigned } = useNotifications(currentManagerId);

  // Get available technicians
  const availableTechnicians = useMemo(() => {
    if (!report) return [];
    return getAvailableTechniciansForReassignment(report.district, report.assignedTo);
  }, [report]);

  // Get current technician info
  const currentTech = useMemo(() => {
    if (!report?.assignedTo) return null;
    return availableTechnicians.find(t => t.id === report.assignedTo);
  }, [report, availableTechnicians]);

  // Get selected technician info
  const selectedTech = useMemo(() => {
    return availableTechnicians.find(t => t.id === selectedTechId);
  }, [availableTechnicians, selectedTechId]);

  const handleTechSelect = (techId: string | null) => {
    if (techId) {
      setSelectedTechId(techId);
      setError(null);
    }
  };

  const handleContinue = () => {
    if (!selectedTechId) {
      setError('Please select a technician');
      return;
    }
    
    if (!report) return;
    
    const validationError = validateReassignment(report.id, selectedTechId);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setStep('confirm');
  };

  const handleReassign = async () => {
    if (!report || !selectedTechId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = reassignReport(report.id, selectedTechId, reason || undefined);
    
    if (result.success && result.report && result.reassignmentRecord) {
      // Send notifications
      notifyTaskReassigned(
        result.report,
        selectedTechId,
        result.reassignmentRecord.fromTechnicianName
      );
      
      toast.success('Task reassigned successfully');
      onReassign();
      handleClose();
    } else {
      setError(result.error || 'Failed to reassign task');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSelectedTechId('');
    setReason('');
    setError(null);
    setStep('select');
    setIsSubmitting(false);
    onClose();
  };

  if (!report) return null;

  const hasAssignedTech = !!report.assignedTo;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white rounded-[32px] sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#494fdf]/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-[#494fdf]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-semibold text-primary">
                Reassign Task
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Transfer this report to another technician
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Current Assignment Info */}
          <div className="bg-surface rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Current Assignment
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary">{report.category}</p>
                <p className="text-xs text-muted-foreground">{report.address}</p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  report.urgency === 'High' ? 'border-red-400 text-red-500' :
                  report.urgency === 'Medium' ? 'border-yellow-400 text-yellow-600' :
                  'border-emerald-400 text-emerald-600'
                )}
              >
                {report.urgency}
              </Badge>
            </div>
            
            {hasAssignedTech ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border/50">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-primary">{currentTech?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">Current assignee</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">This report is not currently assigned</p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-sm text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {step === 'select' ? (
            <>
              {/* Technician Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-primary">
                  Select New Technician
                </Label>
                
                {availableTechnicians.length > 0 ? (
                  <Select value={selectedTechId} onValueChange={handleTechSelect}>
                    <SelectTrigger className="w-full rounded-xl h-14">
                      <SelectValue placeholder="Select a technician..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {availableTechnicians.map((tech) => (
                        <SelectItem 
                          key={tech.id} 
                          value={tech.id}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-semibold text-primary text-sm">
                              {tech.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-primary">{tech.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Briefcase className="h-3 w-3" />
                                <span>{tech.activeTasks} active tasks</span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-6 bg-surface rounded-xl">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No other technicians available in this district
                    </p>
                  </div>
                )}
              </div>

              {/* Reason Input (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-semibold text-primary">
                  Reason for Reassignment <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Original technician on leave, workload rebalancing..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[80px] resize-none rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full h-12"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-full h-12 bg-[#494fdf] hover:bg-[#494fdf]/90"
                  onClick={handleContinue}
                  disabled={!selectedTechId || isSubmitting}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <div className="space-y-6">
              <div className="bg-[#494fdf]/5 border-2 border-[#494fdf]/20 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-primary">
                      {currentTech?.name || 'Unassigned'}
                    </p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  
                  <ArrowRightLeft className="h-6 w-6 text-[#494fdf]" />
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#494fdf]/10 flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-5 text-[#494fdf]" />
                    </div>
                    <p className="text-sm font-medium text-primary">{selectedTech?.name}</p>
                    <p className="text-xs text-[#494fdf]">New Assignee</p>
                  </div>
                </div>
                
                {reason && (
                  <div className="mt-4 pt-4 border-t border-[#494fdf]/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-sm text-primary italic">&ldquo;{reason}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full h-12"
                  onClick={() => setStep('select')}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-full h-12 bg-[#494fdf] hover:bg-[#494fdf]/90"
                  onClick={handleReassign}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reassigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm Reassignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
