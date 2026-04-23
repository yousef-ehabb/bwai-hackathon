'use client';

import Link from 'next/link';
import { ReactNode, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTechnicianTasks } from '@/lib/tech-storage';
import { ClipboardList, Clock3, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function TechnicianDashboard() {
  const { currentUser } = useAuth();
  const tasks = useMemo(() => {
    if (!currentUser) return [];
    return getTechnicianTasks(currentUser.id);
  }, [currentUser]);

  const stats = useMemo(() => {
    if (!currentUser) {
      return { myTasks: 0, inProgress: 0, completedToday: 0, pending: 0 };
    }
    const today = new Date().toDateString();
    return {
      myTasks: tasks.length,
      inProgress: tasks.filter((task) => task.status === 'In Progress').length,
      pending: tasks.filter((task) => task.status === 'Pending').length,
      completedToday: tasks.filter(
        (task) => task.status === 'Resolved' && task.resolvedAt && new Date(task.resolvedAt).toDateString() === today
      ).length,
    };
  }, [currentUser, tasks]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-primary">Technician Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}. Track your assigned maintenance work.
          </p>
        </div>
        <Link href="/technician/tasks">
          <Button className="min-h-11 px-6">
            Open My Tasks
            <ClipboardList className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Tasks" value={stats.myTasks} icon={<ClipboardList className="h-5 w-5 text-brand-blue" />} />
        <StatCard label="In Progress" value={stats.inProgress} icon={<PlayCircle className="h-5 w-5 text-[#494fdf]" />} />
        <StatCard label="Completed Today" value={stats.completedToday} icon={<CheckCircle2 className="h-5 w-5 text-[#00a87e]" />} />
        <StatCard label="Pending" value={stats.pending} icon={<Clock3 className="h-5 w-5 text-[#ec7e00]" />} />
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-display font-medium text-primary mb-2">Shift Summary</h2>
          <p className="text-muted-foreground">
            You currently have {stats.myTasks} assigned task{stats.myTasks === 1 ? '' : 's'}.
            {' '}
            {stats.pending > 0
              ? `${stats.pending} pending task${stats.pending === 1 ? '' : 's'} are waiting for action.`
              : 'No pending tasks right now.'}
          </p>
          <p className="text-muted-foreground mt-2">
            Only your assignments are shown in this dashboard, following technician-level access control.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Card className="rounded-2xl border border-border bg-white">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          {icon}
        </div>
        <p className="mt-3 text-4xl font-display font-medium text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}
