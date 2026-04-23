import { Report, ReportStatus, Urgency } from '@/lib/types';

export type TaskStatusFilter = 'All' | 'Pending' | 'In Progress' | 'Resolved';

export type TaskSortOption = 'urgency' | 'newest' | 'oldest';

export type TechnicianTask = Report;

export type TechnicianStats = {
  myTasks: number;
  inProgress: number;
  pending: number;
  completedToday: number;
};

export const URGENCY_WEIGHT: Record<Urgency, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const ACTIVE_TASK_STATUSES: ReportStatus[] = ['Pending', 'In Progress'];
