import { getReports, setReports } from '@/lib/storage';
import { Report, ReportStatus } from '@/lib/types';
import {
  TaskSortOption,
  TaskStatusFilter,
  TechnicianStats,
  TechnicianTask,
  URGENCY_WEIGHT,
} from '@/lib/tech-types';

export function getTechnicianTasks(technicianId: string): TechnicianTask[] {
  return getReports().filter((report) => report.assignedTo === technicianId);
}

export function getFilteredTechnicianTasks(
  technicianId: string,
  statusFilter: TaskStatusFilter,
  sortBy: TaskSortOption
): TechnicianTask[] {
  let tasks = getTechnicianTasks(technicianId);

  if (statusFilter !== 'All') {
    tasks = tasks.filter((task) => task.status === statusFilter);
  }

  return sortTechnicianTasks(tasks, sortBy);
}

export function getTechnicianStats(technicianId: string): TechnicianStats {
  const tasks = getTechnicianTasks(technicianId);
  const today = new Date().toDateString();

  return {
    myTasks: tasks.length,
    inProgress: tasks.filter((task) => task.status === 'In Progress').length,
    pending: tasks.filter((task) => task.status === 'Pending').length,
    completedToday: tasks.filter(
      (task) => task.status === 'Resolved' && task.resolvedAt && new Date(task.resolvedAt).toDateString() === today
    ).length,
  };
}

export function updateTaskProofPhoto(technicianId: string, reportId: string, afterPhoto: string): Report {
  if (!afterPhoto.trim()) {
    throw new Error('Proof photo is required.');
  }

  return updateReport(technicianId, reportId, (report) => ({
    ...report,
    afterPhoto,
  }));
}

export function updateTaskStatus(technicianId: string, reportId: string, nextStatus: ReportStatus): Report {
  return updateReport(technicianId, reportId, (report) => {
    if (nextStatus === 'In Progress') {
      if (report.status !== 'Pending') {
        throw new Error('Only pending tasks can be started.');
      }
      return { ...report, status: 'In Progress' };
    }

    if (nextStatus === 'Resolved') {
      if (report.status !== 'In Progress') {
        throw new Error('Only in-progress tasks can be resolved.');
      }
      if (!report.afterPhoto) {
        throw new Error('Proof photo is required before resolving.');
      }
      return { ...report, status: 'Resolved', resolvedAt: new Date().toISOString() };
    }

    throw new Error(`Unsupported status change to ${nextStatus}.`);
  });
}

function updateReport(
  technicianId: string,
  reportId: string,
  updater: (report: Report) => Report
): Report {
  const reports = getReports();
  const reportIndex = reports.findIndex((report) => report.id === reportId);

  if (reportIndex === -1) {
    throw new Error('Task not found.');
  }

  const report = reports[reportIndex];
  if (report.assignedTo !== technicianId) {
    throw new Error('You can only update tasks assigned to you.');
  }

  const updatedReport = updater(report);
  const nextReports = [...reports];
  nextReports[reportIndex] = updatedReport;
  setReports(nextReports);
  return updatedReport;
}

function sortTechnicianTasks(tasks: TechnicianTask[], sortBy: TaskSortOption): TechnicianTask[] {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    if (sortBy === 'urgency') {
      const urgencyDiff = URGENCY_WEIGHT[b.urgency] - URGENCY_WEIGHT[a.urgency];
      if (urgencyDiff !== 0) {
        return urgencyDiff;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted;
}
