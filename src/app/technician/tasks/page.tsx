'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TechTaskCard } from '@/components/shared/TechTaskCard';
import { TechProofUpload } from '@/components/shared/TechProofUpload';
import { TechStatusUpdater } from '@/components/shared/TechStatusUpdater';
import { getFilteredTechnicianTasks, updateTaskProofPhoto, updateTaskStatus } from '@/lib/tech-storage';
import { TaskSortOption, TaskStatusFilter } from '@/lib/tech-types';
import { Report } from '@/lib/types';
import { toast } from 'sonner';
import { ClipboardCheck, Filter, ListFilter } from 'lucide-react';

export default function TechnicianTasksPage() {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('All');
  const [sortBy, setSortBy] = useState<TaskSortOption>('urgency');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [proofDrafts, setProofDrafts] = useState<Record<string, string>>({});
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const tasks = currentUser ? getFilteredTechnicianTasks(currentUser.id, statusFilter, sortBy) : [];
  const selectedTask = tasks.find((task) => task.id === expandedTaskId) ?? null;

  const effectiveProof = selectedTask
    ? (proofDrafts[selectedTask.id] ?? selectedTask.afterPhoto ?? null)
    : null;

  const handleProofUpload = (task: Report, base64: string) => {
    if (!currentUser) return;

    if (!base64) {
      setProofDrafts((prev) => ({ ...prev, [task.id]: '' }));
      return;
    }

    try {
      const updated = updateTaskProofPhoto(currentUser.id, task.id, base64);
      setProofDrafts((prev) => ({ ...prev, [task.id]: updated.afterPhoto ?? '' }));
      toast.success('Proof photo uploaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload proof.');
    }
  };

  const startWork = async (task: Report) => {
    if (!currentUser) return;
    try {
      setUpdatingTaskId(task.id);
      updateTaskStatus(currentUser.id, task.id, 'In Progress');
      toast.success('Task moved to In Progress.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const markResolved = async (task: Report) => {
    if (!currentUser) return;
    try {
      setUpdatingTaskId(task.id);
      updateTaskStatus(currentUser.id, task.id, 'Resolved');
      toast.success('Task marked as resolved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resolve task.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-medium text-primary">My Tasks</h1>
        <p className="text-muted-foreground mt-2">Mobile-first queue for assigned field tasks and status updates.</p>
      </div>

      <Card className="rounded-2xl mb-6">
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status
            </label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatusFilter)}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
              <ListFilter className="h-3 w-3" /> Sort by
            </label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as TaskSortOption)}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgency">Urgency (High first)</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(statusFilter !== 'All' || sortBy !== 'urgency') && (
            <Button
              variant="outline"
              className="min-h-11 mt-1 sm:mt-6"
              onClick={() => {
                setStatusFilter('All');
                setSortBy('urgency');
              }}
            >
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-10 text-center">
              <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h2 className="text-xl font-semibold text-primary">No tasks found</h2>
              <p className="text-muted-foreground mt-2">
                You currently have no assigned tasks for this filter. Check again after manager assignment.
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="space-y-3">
              <TechTaskCard
                task={task}
                expanded={expandedTaskId === task.id}
                onClick={() => setExpandedTaskId((prev) => (prev === task.id ? null : task.id))}
              />

              {expandedTaskId === task.id && (
                <Card className="rounded-2xl border border-border">
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload proof before resolving. Resolve is blocked unless a photo exists.
                    </p>
                    <TechProofUpload
                      value={proofDrafts[task.id] ?? task.afterPhoto}
                      onUpload={(base64) => handleProofUpload(task, base64)}
                    />
                    <TechStatusUpdater
                      task={task}
                      proofPhoto={proofDrafts[task.id] ?? task.afterPhoto}
                      isUpdating={updatingTaskId === task.id}
                      onStartWork={() => startWork(task)}
                      onResolve={() => markResolved(task)}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ))
        )}
      </div>

      {selectedTask ? (
        <p className="mt-6 text-xs text-muted-foreground">
          Working on task <span className="font-semibold text-primary">{selectedTask.id}</span>.
          {' '}
          {effectiveProof ? 'Proof image ready.' : 'Proof image is required to resolve this task.'}
        </p>
      ) : null}
    </div>
  );
}
