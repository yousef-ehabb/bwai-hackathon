'use client';

import { Button } from '@/components/ui/button';
import { TechnicianTask } from '@/lib/tech-types';
import { CheckCircle2, PlayCircle } from 'lucide-react';

export function TechStatusUpdater({
  task,
  proofPhoto,
  isUpdating,
  onStartWork,
  onResolve,
}: {
  task: TechnicianTask;
  proofPhoto: string | null;
  isUpdating: boolean;
  onStartWork: () => void;
  onResolve: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        type="button"
        onClick={onStartWork}
        disabled={task.status !== 'Pending' || isUpdating}
        className="min-h-11 px-5"
      >
        <PlayCircle className="h-4 w-4 mr-2" />
        Start Work
      </Button>
      <Button
        type="button"
        variant="default"
        onClick={onResolve}
        disabled={task.status !== 'In Progress' || !proofPhoto || isUpdating}
        className="min-h-11 px-5 bg-[#00a87e] hover:bg-[#008b69]"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Mark Resolved
      </Button>
    </div>
  );
}
