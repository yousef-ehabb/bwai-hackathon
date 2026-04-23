'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role !== 'manager') {
      router.replace('/unauthorized');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'manager') return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f9fafb]">
      <Sidebar role="manager" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
