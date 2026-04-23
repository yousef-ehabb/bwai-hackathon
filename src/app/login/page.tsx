'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DemoCredentials from '@/components/DemoCredentials';
import { Zap, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

function getDashboardPath(role: Role): string {
  switch (role) {
    case 'citizen':
      return '/citizen/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'technician':
      return '/technician/dashboard';
    case 'governor':
      return '/governor/dashboard';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = login(id, password);
    if (result.success && result.role) {
      router.push(getDashboardPath(result.role));
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Top Left Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-display font-medium text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary mb-3">Sign in</h1>
          <p className="text-muted-foreground font-body">Manage your city profile and reports</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-danger/10 border-danger/20 text-danger rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-bold uppercase tracking-wider">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-id" className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Employee / National ID
            </Label>
            <Input
              id="login-id"
              type="text"
              placeholder="e.g. GOV001"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="h-14 rounded-xl border-border bg-surface/50 focus:bg-white focus:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-xl border-border bg-surface/50 focus:bg-white focus:ring-primary/20 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-blue border-brand-blue text-white h-14 text-lg"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-10 space-y-4">
           <p className="text-sm text-muted-foreground">
             Don't have an account?{' '}
             <Link href="/register" className="text-brand-blue font-bold hover:underline">
               Register
             </Link>
           </p>
           
           <div className="pt-6">
              <DemoCredentials />
           </div>
        </div>
      </div>
      
      {/* Minimal Footer */}
      <div className="absolute bottom-10 text-center">
         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Fintech-scale Infrastructure Reporting
         </p>
      </div>
    </div>
  );
}
