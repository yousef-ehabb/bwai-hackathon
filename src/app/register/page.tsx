'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FormErrors = {
  fullName?: string;
  nationalId?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName || fullName.trim().length < 3) newErrors.fullName = 'Full name must be at least 3 characters';
    if (!nationalId || !/^\d{14}$/.test(nationalId)) newErrors.nationalId = 'National ID must be exactly 14 numeric digits';
    if (!phone || !/^01\d{9}$/.test(phone)) newErrors.phone = 'Phone must start with 01 and be exactly 11 digits';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validate()) {
      const result = register({ nationalId, fullName: fullName.trim(), phone, password });
      if (result.success) {
        toast.success('Account created successfully!');
        router.push('/citizen/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-20 px-6">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-display font-medium text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary mb-3">
            Get Started
          </h1>
          <p className="text-muted-foreground font-body">
            Register as a citizen to improve your city
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
            <Input
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={cn("h-13 rounded-xl border-border bg-surface/30", errors.fullName && "border-danger")}
            />
            {errors.fullName && <p className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 ml-1">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">National ID</Label>
               <Input
                 placeholder="14-digit ID"
                 value={nationalId}
                 onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 14))}
                 className={cn("h-13 rounded-xl border-border bg-surface/30 font-mono", errors.nationalId && "border-danger")}
               />
               {errors.nationalId && <p className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 ml-1">{errors.nationalId}</p>}
             </div>
             <div className="space-y-2">
               <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone</Label>
               <Input
                 placeholder="01XXXXXXXXX"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                 className={cn("h-13 rounded-xl border-border bg-surface/30 font-mono", errors.phone && "border-danger")}
               />
               {errors.phone && <p className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 ml-1">{errors.phone}</p>}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
               <Input
                 type="password"
                 placeholder="Min 6 chars"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className={cn("h-13 rounded-xl border-border bg-surface/30", errors.password && "border-danger")}
               />
               {errors.password && <p className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 ml-1">{errors.password}</p>}
             </div>
             <div className="space-y-2">
               <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm</Label>
               <Input
                 type="password"
                 placeholder="Re-enter"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 className={cn("h-13 rounded-xl border-border bg-surface/30", errors.confirmPassword && "border-danger")}
               />
               {errors.confirmPassword && <p className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 ml-1">{errors.confirmPassword}</p>}
             </div>
          </div>

          <Button
            onClick={handleRegister}
            className="w-full bg-brand-blue border-brand-blue text-white h-14 text-lg mt-4"
          >
            Create Account <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-blue font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
