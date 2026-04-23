'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

export default function GovernorLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role !== 'governor') {
      router.replace('/unauthorized');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'governor') return null;

  return (
    <div className="flex h-screen bg-[#0f172a]">
      <Sidebar role="governor" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
