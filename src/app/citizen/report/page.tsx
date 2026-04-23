'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { addReport, getReports, getCategories } from '@/lib/storage';
import { followReport } from '@/lib/follow-system';
import { Report, ReportStatus, Urgency } from '@/lib/types';
import { haversineDistance } from '@/lib/geo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Check,
  MapPin,
  Camera,
  UploadCloud,
  X,
  Loader2,
  AlertTriangle,
  FileText,
  Info,
  CheckCircle,
  Copy,
  ArrowLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Types & Constants ---

type UrgencyType = 'Low' | 'Medium' | 'High';

type FormState = {
  category: string;
  urgency: UrgencyType | '';
  description: string;
  lat: number | null;
  lng: number | null;
  address: string;
  photoBase64: string | null;
  photoPreviewUrl: string | null;
};

const categoryEmojis: Record<string, string> = {
  Pothole: '🕳',
  Streetlight: '💡',
  'Water Leak': '💧',
  Trash: '🗑',
  Sewage: '🔧',
  Electrical: '⚡',
  'Road Damage': '🚧',
};

const defaultCoords = { lat: 30.0626, lng: 31.2497 }; // Cairo

// --- Main Component ---

export default function ReportPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState<Report | null>(null);
  
  const [form, setForm] = useState<FormState>({
    category: '',
    urgency: '',
    description: '',
    lat: null,
    lng: null,
    address: '',
    photoBase64: null,
    photoPreviewUrl: null,
  });

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // --- Handlers ---

  const handleNext = () => {
    if (step === 1) {
      if (!form.category) return toast.error('Please select a category');
      if (!form.urgency) return toast.error('Please select urgency');
      if (form.description.length < 20) return toast.error('Description must be at least 20 characters');
      setStep(2);
    } else if (step === 2) {
      if (form.lat === null) return toast.error('Please capture your location');
      if (!form.address.trim()) return toast.error('Please enter an address');
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const captureLocation = () => {
    setGpsStatus('loading');
    if (!navigator.geolocation) {
      setForm({ ...form, ...defaultCoords });
      setGpsStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('success');
      },
      () => {
        setForm({ ...form, ...defaultCoords });
        setGpsStatus('error');
      },
      { timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    
    // Stop browser behavior for drag events
    if ('dataTransfer' in e) {
      e.preventDefault();
      e.stopPropagation();
      file = e.dataTransfer.files?.[0];
    } else if (e.target.files) {
      file = e.target.files[0];
    }

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large. Max 5MB');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        photoBase64: reader.result as string,
        photoPreviewUrl: URL.createObjectURL(file!),
      }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setForm({ ...form, photoBase64: null, photoPreviewUrl: null });
  };

  const checkForDuplicates = () => {
    const allReports = getReports();
    const active = allReports.filter((r) => r.status !== 'Resolved' && r.status !== 'Rejected' && r.category === form.category);
    const nearby = active.find((r) => 
      haversineDistance(form.lat!, form.lng!, r.gps.lat, r.gps.lng) <= 50
    );
    
    if (nearby) {
      setDuplicateFound(nearby);
      setShowDuplicateDialog(true);
      return true;
    }
    return false;
  };

  const saveReport = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);

    const report: Report = {
      id: 'RPT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      category: form.category,
      urgency: form.urgency as Urgency,
      description: form.description,
      gps: { lat: form.lat!, lng: form.lng! },
      address: form.address,
      district: currentUser.district || 'District A',
      beforePhoto: form.photoBase64,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      assignedTo: null,
      resolvedAt: null,
      afterPhoto: null,
      rejectionReason: null,
      isPublic: false,
    };

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));
    
    addReport(report);
    setSubmittedId(report.id);
    setStep('success');
    setIsSubmitting(false);
  };

  const handleSubmitClick = () => {
    if (!form.photoBase64) return toast.error('Please upload a photo');
    if (!checkForDuplicates()) {
      saveReport();
    }
  };

  const resetForm = () => {
    setForm({
      category: '',
      urgency: '',
      description: '',
      lat: null,
      lng: null,
      address: '',
      photoBase64: null,
      photoPreviewUrl: null,
    });
    setGpsStatus('idle');
    setStep(1);
  };

  // --- UI Parts ---

  if (step === 'success') {
    return <SuccessState id={submittedId} onReset={resetForm} />;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-[calc(100vh-2rem)] flex flex-col">
      {/* Header & Step Indicator */}
      <div className="mb-10">
        <h1 className="font-syne text-3xl font-bold text-white mb-6">Report an Issue</h1>
        
        <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800 -z-10 mx-10" />
            
            <StepCircle num={1} label="Issue Details" active={step === 1} completed={step > 1} />
            <StepCircle num={2} label="Location" active={step === 2} completed={step > 2} />
            <StepCircle num={3} label="Evidence" active={step === 3} completed={step > 3} />
        </div>
      </div>

      <Card className="bg-[#1e293b]/50 border-[#334155] flex-1 flex flex-col shadow-2xl">
        <CardContent className="p-8 flex-1">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                 <Label className="text-slate-300 mb-4 block">Select Category</Label>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {getCategories().map((cat) => (
                     <div
                       key={cat}
                       onClick={() => setForm({ ...form, category: cat })}
                       className={cn(
                         "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                         form.category === cat 
                           ? "bg-[#3b82f6]/10 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                           : "bg-[#0f172a] border-[#334155] hover:border-[#3b82f6]/50"
                       )}
                     >
                       <span className="text-3xl mb-2">{categoryEmojis[cat] || '📋'}</span>
                       <span className="text-xs font-bold text-white text-center">{cat}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <Label className="text-slate-300 mb-4 block">Urgency Level</Label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <UrgencyButton 
                        label="Low" 
                        color="green" 
                        selected={form.urgency === 'Low'} 
                        onClick={() => setForm({...form, urgency: 'Low'})} 
                        desc="Can wait a few days"
                    />
                    <UrgencyButton 
                        label="Medium" 
                        color="yellow" 
                        selected={form.urgency === 'Medium'} 
                        onClick={() => setForm({...form, urgency: 'Medium'})} 
                        desc="Fix within a week"
                    />
                    <UrgencyButton 
                        label="High" 
                        color="red" 
                        selected={form.urgency === 'High'} 
                        onClick={() => setForm({...form, urgency: 'High'})} 
                        desc="Immediate danger"
                    />
                 </div>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <Label className="text-slate-300">Description</Label>
                   <span className={cn(
                     "text-xs",
                     form.description.length >= 20 ? "text-emerald-400" : "text-slate-500"
                   )}>
                     {form.description.length} / 500
                   </span>
                 </div>
                 <Textarea 
                    placeholder="Describe the issue in detail..."
                    className="bg-[#0f172a] border-[#334155] text-white min-h-[120px] focus:ring-[#3b82f6]/30"
                    maxLength={500}
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                 />
                 {form.description.length > 0 && form.description.length < 20 && (
                   <p className="text-xs text-red-400 mt-2">At least 20 characters required.</p>
                 )}
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-4">
                  <Label className="text-slate-300">GPS Location</Label>
                  {gpsStatus === 'idle' && (
                    <Button 
                        onClick={captureLocation} 
                        className="w-full py-12 flex-col gap-4 bg-[#0f172a] border-2 border-dashed border-[#334155] hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 text-slate-400 hover:text-[#3b82f6] transition-all"
                        variant="outline"
                    >
                        <MapPin className="h-10 w-10" />
                        Capture My Current Location
                    </Button>
                  )}

                  {gpsStatus === 'loading' && (
                    <div className="w-full py-12 flex flex-col items-center justify-center gap-4 bg-[#0f172a] rounded-xl border border-[#334155]">
                        <Loader2 className="h-10 w-10 animate-spin text-[#3b82f6]" />
                        <span className="text-slate-400">Getting your location...</span>
                    </div>
                  )}

                  {gpsStatus === 'success' && (
                    <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-emerald-400" />
                        <div>
                            <p className="text-emerald-400 font-bold">Location Captured</p>
                            <p className="text-sm font-mono text-slate-400">
                                Lat: {form.lat?.toFixed(4)} | Lng: {form.lng?.toFixed(4)}
                            </p>
                        </div>
                    </div>
                  )}

                  {gpsStatus === 'error' && (
                    <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
                        <AlertTriangle className="h-10 w-10 text-amber-500" />
                        <div>
                            <p className="text-amber-500 font-bold">Using Fallback Coordinates (Cairo)</p>
                            <p className="text-sm font-mono text-slate-400">
                                Lat: {form.lat?.toFixed(4)} | Lng: {form.lng?.toFixed(4)}
                            </p>
                            <p className="text-[10px] text-amber-500/70 mt-1 italic">GPS unavailable — your manager may adjust the location later.</p>
                        </div>
                    </div>
                  )}
               </div>

               <div className="space-y-4">
                 <Label className="text-slate-300">Detailed Address</Label>
                 <Input 
                    placeholder="e.g. Near El Salam Hospital, Corniche Road"
                    className="bg-[#0f172a] border-[#334155] text-white py-6"
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                 />
               </div>

               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Assigned District</Label>
                    <Badge variant="outline" className="bg-[#0f172a] text-slate-400 border-[#334155] py-1">
                        <Info className="h-3 w-3 mr-1" /> System Assigned
                    </Badge>
                 </div>
                 <Input 
                    value={currentUser?.district || 'District A'} 
                    disabled 
                    className="bg-[#0f172a]/50 border-none text-slate-500 py-6"
                 />
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div>
                  <Label className="text-slate-300 mb-4 block">Visual Evidence</Label>
                  
                  {form.photoPreviewUrl ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#1a56db] shadow-lg shadow-[#1a56db]/20">
                        <img 
                            src={form.photoPreviewUrl} 
                            alt="Preview" 
                            className="w-full max-h-64 object-cover"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                             <Badge className="bg-emerald-500 text-white border-none shadow-lg">
                                <Check className="h-3 w-3 mr-1" /> Photo Ready
                             </Badge>
                             <button 
                                onClick={clearPhoto}
                                type="button"
                                className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                             >
                                <X className="h-4 w-4" />
                             </button>
                        </div>
                    </div>
                  ) : (
                    <>
                        <div 
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={handlePhotoUpload}
                            onClick={() => document.getElementById('photo-input')?.click()}
                            className="group flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed border-[#334155] hover:border-[#1a56db] hover:bg-[#1a56db]/5 transition-all cursor-pointer text-center"
                        >
                            <UploadCloud className="h-12 w-12 text-slate-600 group-hover:text-[#3b82f6] transition-colors mb-4" />
                            <p className="text-slate-300 font-bold mb-1">Click to upload or drag & drop</p>
                            <p className="text-xs text-slate-500">JPG, PNG, WEBP · Max 5MB</p>
                        </div>
                        <input 
                            id="photo-input" 
                            type="file" 
                            hidden 
                            accept="image/*" 
                            onChange={handlePhotoUpload} 
                        />
                    </>
                  )}
               </div>

               <Card className="bg-[#0f172a] border-[#334155]">
                  <CardHeader className="py-4">
                     <CardTitle className="text-sm uppercase tracking-wider text-slate-400 font-bold">Review Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <SummaryRow label="Category" value={`${categoryEmojis[form.category]} ${form.category}`} />
                     <SummaryRow label="Urgency" value={<Badge className={cn(
                         "border-none",
                         form.urgency === 'Low' ? "bg-emerald-500/20 text-emerald-400" :
                         form.urgency === 'Medium' ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-500"
                     )}>{form.urgency}</Badge>} />
                     <SummaryRow label="Location" value={`${form.lat?.toFixed(2)}, ${form.lng?.toFixed(2)}`} />
                     <SummaryRow label="Address" value={form.address} />
                     <SummaryRow 
                        label="Description" 
                        value={form.description.length > 60 ? form.description.substring(0, 60) + '...' : form.description} 
                     />
                  </CardContent>
               </Card>
            </div>
          )}
        </CardContent>
        
        <div className="p-8 border-t border-[#334155] flex justify-between bg-[#1e293b]/30">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1 || isSubmitting}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          {step < 3 ? (
            <Button 
                onClick={handleNext}
                className="bg-[#1a56db] hover:bg-[#1e40af] text-white px-8"
            >
                Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
                disabled={!form.photoBase64 || isSubmitting}
                onClick={handleSubmitClick}
                className="bg-[#1a56db] hover:bg-[#1e40af] text-white px-10 relative overflow-hidden"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                    </>
                ) : (
                    <>🚀 Submit Report</>
                )}
            </Button>
          )}
        </div>
      </Card>

      {/* Duplicate Warning Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="bg-[#1e293b] border-[#334155] text-white max-w-sm">
            <DialogHeader className="items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <DialogTitle className="font-syne text-xl">Similar Issue Reported</DialogTitle>
                <DialogDescription className="text-slate-400">
                    An active <span className="text-white font-bold">{form.category}</span> report exists within 50 meters of your location.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button 
                    className="w-full bg-[#1a56db] hover:bg-[#1e40af]"
                    onClick={() => {
                        setShowDuplicateDialog(false);
                        saveReport();
                    }}
                >
                    Submit Anyway
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full border-[#334155] text-slate-300"
                    onClick={() => {
                        if (duplicateFound && currentUser) {
                            followReport(duplicateFound.id, currentUser.id);
                            toast.success('You are now following this report.');
                            router.push('/citizen/my-reports');
                        }
                    }}
                >
                    Follow Existing Report
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-components ---

function StepCircle({ num, label, active, completed }: { num: number, label: string, active: boolean, completed: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2 z-10">
            <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
                completed ? "bg-emerald-500 border-emerald-500 text-white" :
                active ? "bg-[#1a56db] border-[#1a56db] text-white ring-4 ring-[#1a56db]/20" :
                "bg-[#0f172a] border-[#334155] text-slate-500"
            )}>
                {completed ? <Check className="h-4 w-4" /> : num}
            </div>
            <span className={cn(
                "text-[10px] uppercase font-bold tracking-wider",
                active ? "text-white" : "text-slate-500"
            )}>{label}</span>
        </div>
    );
}

function UrgencyButton({ label, color, selected, onClick, desc }: { label: string, color: string, selected: boolean, onClick: () => void, desc: string }) {
    const styles: Record<string, string> = {
        green: selected ? "bg-emerald-500/10 border-emerald-500" : "border-emerald-500/20",
        yellow: selected ? "bg-amber-500/10 border-amber-500" : "border-amber-500/20",
        red: selected ? "bg-red-500/10 border-red-500" : "border-red-500/20",
    };

    return (
        <div 
            onClick={onClick}
            className={cn(
                "p-4 rounded-xl border-l-4 border bg-[#0f172a] transition-all cursor-pointer",
                styles[color]
            )}
        >
            <div className="flex items-center gap-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full", `bg-${color}-500`)} />
                <span className="text-sm font-bold text-white">{label}</span>
            </div>
            <p className="text-[10px] text-slate-500">{desc}</p>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="text-white font-medium text-right max-w-[200px]">{value}</span>
        </div>
    );
}

function SuccessState({ id, onReset }: { id: string, onReset: () => void }) {
    const router = useRouter();
    const [bounce, setBounce] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setBounce(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className={cn(
                "w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8",
                bounce && "animate-bounce"
            )}>
                <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>

            <h1 className="font-syne text-4xl font-bold text-white mb-4">Report Submitted!</h1>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1e293b] rounded-lg border border-[#334155] mb-10">
                <span className="font-mono text-slate-400">{id}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-300 hover:text-white"
                    onClick={() => {
                        navigator.clipboard.writeText(id);
                        toast.success('Report ID copied!');
                    }}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>

            {/* Status Tracker */}
            <div className="w-full max-w-md mx-auto mb-10 flex items-center justify-between relative px-2">
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-800 -z-10 mx-6" />
                <SuccessStep label="Submitted" completed />
                <SuccessArrow />
                <SuccessStep label="Under Review" />
                <SuccessArrow />
                <SuccessStep label="Fixed" />
            </div>

            <p className="text-slate-400 max-w-xs mb-10">
                Your district manager will review your report shortly. Tracking updates will appear here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button 
                    className="flex-1 bg-[#1a56db] hover:bg-[#1e40af]" 
                    onClick={() => router.push('/citizen/my-reports')}
                >
                    View My Reports
                </Button>
                <Button 
                    variant="outline" 
                    className="flex-1 border-[#334155] text-slate-300"
                    onClick={onReset}
                >
                    Report Another Issue
                </Button>
            </div>
        </div>
    );
}

function SuccessStep({ label, completed = false }: { label: string, completed?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-[#0f172a] border-[#334155] text-slate-700"
            )}>
                {completed && <Check className="h-3 w-3" />}
            </div>
            <span className={cn(
                "text-[9px] uppercase font-bold tracking-wider",
                completed ? "text-emerald-400" : "text-slate-600"
            )}>{label}</span>
        </div>
    );
}

function SuccessArrow() {
    return <div className="h-0.5 flex-1 bg-slate-800 mx-1" />;
}
