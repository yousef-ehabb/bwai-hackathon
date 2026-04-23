/**
 * NotificationProvider Component
 * 
 * Root-level provider for the notification system.
 * Handles Service Worker registration and global notification state.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { getReports } from '@/lib/storage';
import { Bell } from 'lucide-react';
import { useState, useRef } from 'react';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { settings, requestBrowserPermission, refresh } = useNotifications(currentUser?.id);

  // Register Service Worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Request browser permission on first login
  useEffect(() => {
    if (currentUser && !settings.browserPushEnabled && settings.inAppEnabled) {
      // Show toast asking for permission (only once per session)
      const hasAskedPermission = sessionStorage.getItem('notification_permission_asked');
      
      if (!hasAskedPermission) {
        toast.info('Enable browser notifications?', {
          description: 'Get notified about report updates even when the app is closed',
          duration: 10000,
          action: {
            label: 'Enable',
            onClick: () => {
              requestBrowserPermission().then((granted) => {
                if (granted) {
                  toast.success('Notifications enabled!');
                } else {
                  toast.error('Permission denied. You can enable this in settings later.');
                }
              });
            },
          },
        });
        
        sessionStorage.setItem('notification_permission_asked', 'true');
      }
    }
  }, [currentUser, settings.browserPushEnabled, settings.inAppEnabled, requestBrowserPermission]);

  // Handle incoming messages from Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        // Refresh notifications when user clicks on a browser notification
        refresh();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [refresh]);

  // Status Polling Logic
  const lastReportCountRef = useRef<number | null>(null);
  const lastStatusesRef = useRef<Record<string, string>>({});

  // One-time notice on login
  useEffect(() => {
    if (currentUser) {
      toast('System Archival Engine Active', {
        description: 'Resolving city logs and archiving historical reports (48h rule).',
        icon: <Bell className="h-4 w-4 text-purple-500" />,
      });
      
      // Initialize refs
      const initialReports = getReports();
      lastReportCountRef.current = initialReports.length;
      const initialStatuses: Record<string, string> = {};
      initialReports.forEach(r => initialStatuses[r.id] = r.status);
      lastStatusesRef.current = initialStatuses;
    }
  }, [currentUser]);

  // Polling interval
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const currentReports = getReports();
      const lastCount = lastReportCountRef.current;
      const lastStatuses = lastStatusesRef.current;
      
      if (lastCount !== null && currentReports.length > lastCount) {
        const newCount = currentReports.length - lastCount;
        toast('New Infrastructure Alert', {
          description: `${newCount} new issue${newCount > 1 ? 's' : ''} reported to authorities.`,
          icon: <Bell className="h-4 w-4 text-blue-500" />,
        });
      }

      currentReports.forEach(r => {
        const oldStatus = lastStatuses[r.id];
        if (oldStatus && oldStatus !== r.status) {
          toast('Dispatch Status Change', {
            description: `Issue #${r.id.slice(-4)} moved to ${r.status}.`,
            icon: <Bell className="h-4 w-4 text-emerald-500" />,
          });
        }
      });

      // Update refs
      lastReportCountRef.current = currentReports.length;
      const newStatuses: Record<string, string> = {};
      currentReports.forEach(r => newStatuses[r.id] = r.status);
      lastStatusesRef.current = newStatuses;
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  return <>{children}</>;
}
