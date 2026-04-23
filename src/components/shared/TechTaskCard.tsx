'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TechnicianTask } from '@/lib/tech-types';
import { cn } from '@/lib/utils';
import { Clock, MapPin, User } from 'lucide-react';

const categoryEmojis: Record<string, string> = {
  Pothole: '🕳',
  Streetlight: '💡',
  'Water Leak': '💧',
  Trash: '🗑',
  Sewage: '🔧',
  Electrical: '⚡',
  'Road Damage': '🚧',
};

function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusBadge({ status }: { status: TechnicianTask['status'] }) {
  const styles: Record<TechnicianTask['status'], string> = {
    Pending: 'bg-yellow-500/10 text-[#ec7e00] border-[#ec7e00]/20',
    'In Progress': 'bg-[#494fdf]/10 text-[#494fdf] border-[#494fdf]/20',
    Resolved: 'bg-[#00a87e]/10 text-[#00a87e] border-[#00a87e]/20',
    Rejected: 'bg-[#e23b4a]/10 text-[#e23b4a] border-[#e23b4a]/20',
  };
  return (
    <Badge variant="outline" className={cn('rounded-full px-3 py-0.5 text-[11px] font-bold uppercase', styles[status])}>
      {status}
    </Badge>
  );
}

export function TechTaskCard({
  task,
  expanded,
  onClick,
}: {
  task: TechnicianTask;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer border transition-all duration-200',
        expanded ? 'border-brand-blue shadow-lg shadow-brand-blue/10 bg-surface' : 'border-border bg-white hover:border-brand-blue/40'
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="h-12 w-12 shrink-0 rounded-full bg-surface border border-border flex items-center justify-center text-2xl">
              {categoryEmojis[task.category] || '📋'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-primary">{task.category}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-2 py-0 border-none',
                    task.urgency === 'High'
                      ? 'text-red-500 bg-red-500/10'
                      : task.urgency === 'Medium'
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-emerald-500 bg-emerald-500/10'
                  )}
                >
                  {task.urgency}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{task.description}</p>
              <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-3">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {task.address}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {task.citizenName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Assigned {timeAgo(task.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
            <StatusBadge status={task.status} />
            <span className="text-xs text-muted-foreground">{expanded ? 'Hide details' : 'View details'}</span>
          </div>
        </div>

        {task.beforePhoto ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <img src={task.beforePhoto} alt={`Before fix for ${task.id}`} className="w-full h-48 object-cover" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
