'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import RoleBadge from '@/components/RoleBadge';

export default function ManagerDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="p-8">
      <h1 className="font-syne text-3xl font-bold text-white mb-2">
        Manager Dashboard
      </h1>
      <p className="text-slate-400 mb-6">Phase 1 complete. Phase 2 coming next.</p>
      <Card className="bg-[#1e293b] border-[#334155]">
        <CardContent className="pt-6 space-y-3">
          <p className="text-slate-300">
            Logged in as: <strong className="text-white">{currentUser?.name}</strong>
          </p>
          {currentUser && <RoleBadge role={currentUser.role} />}
        </CardContent>
      </Card>
    </div>
  );
}
