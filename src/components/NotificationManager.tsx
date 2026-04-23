'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getReports } from '@/lib/storage';
import { Report } from '@/lib/types';
import { Bell } from 'lucide-react';

export default function NotificationManager() {
  const [lastReportCount, setLastReportCount] = useState<number | null>(null);
  const [lastStatuses, setLastStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initial load
    const reports = getReports();
    setLastReportCount(reports.length);
    const statuses: Record<string, string> = {};
    reports.forEach(r => statuses[r.id] = r.status);
    setLastStatuses(statuses);

    // Poll for changes every 5 seconds (mocking real-time)
    const interval = setInterval(() => {
      const currentReports = getReports();
      
      // Check for new reports
      if (lastReportCount !== null && currentReports.length > lastReportCount) {
        const newCount = currentReports.length - lastReportCount;
        toast('New Report Received', {
          description: `${newCount} new infrastructure issue${newCount > 1 ? 's' : ''} reported.`,
          icon: <Bell className="h-4 w-4 text-brand-blue" />,
        });
      }

      // Check for status changes (e.g. Technician starting work or Manager assigning)
      currentReports.forEach(r => {
        const oldStatus = lastStatuses[r.id];
        if (oldStatus && oldStatus !== r.status) {
          toast('Report Status Updated', {
            description: `Issue #${r.id.slice(-4)} moved from ${oldStatus} to ${r.status}.`,
            icon: <Bell className="h-4 w-4 text-emerald-500" />,
          });
        }
      });

      // Update state for next poll
      setLastReportCount(currentReports.length);
      const newStatuses: Record<string, string> = {};
      currentReports.forEach(r => newStatuses[r.id] = r.status);
      setLastStatuses(newStatuses);
    }, 5000);

    return () => clearInterval(interval);
  }, [lastReportCount, lastStatuses]);

  return null;
}
