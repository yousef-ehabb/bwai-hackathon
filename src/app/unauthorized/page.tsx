'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

function getDashboardPath(role: string): string {
  switch (role) {
    case 'citizen':
      return '/citizen/dashboard';
    case 'manager':
      return '/manager/dashboard';
    case 'technician':
      return '/technician/dashboard';
    case 'governor':
      return '/governor/dashboard';
    default:
      return '/login';
  }
}

export default function UnauthorizedPage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleGoToDashboard = () => {
    if (currentUser) {
      router.push(getDashboardPath(currentUser.role));
    } else {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#0f172a]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
            <ShieldX className="h-16 w-16 text-red-400" />
          </div>
        </div>

        <h1 className="font-syne text-4xl font-bold text-white mb-4">
          Access Denied
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          You don&apos;t have permission to view this page.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleGoToDashboard}
            className="bg-[#1a56db] hover:bg-[#1e40af] text-white px-6"
            size="lg"
          >
            Go to my dashboard
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-[#334155] text-slate-300 hover:bg-[#1e293b] hover:text-white px-6"
            size="lg"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
