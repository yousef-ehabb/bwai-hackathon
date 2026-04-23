'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role !== 'citizen') {
      router.replace('/unauthorized');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'citizen') return null;

  return (
    <div className="flex h-screen bg-[#0f172a]">
      <Sidebar role="citizen" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
