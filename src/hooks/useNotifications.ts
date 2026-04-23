/**
 * useNotifications Hook
 * 
 * React hook for managing notifications across the app.
 * Provides real-time updates and browser push integration.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  NotificationType,
  NotificationSettings,
  getNotifications,
  addNotification,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationSettings,
  updateNotificationSettings,
  requestBrowserPushPermission,
  sendBrowserPush,
  playNotificationSound,
  updateLastSeen,
  createStatusChangeNotification,
  createTaskAssignedNotification,
  createTaskReassignedNotification,
  createSLABreachNotification,
  createReportFollowedNotification,
} from '@/lib/notifications';
import { Report, ReportStatus } from '@/lib/types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  
  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestBrowserPermission: () => Promise<boolean>;
  
  // Creators
  notifyStatusChange: (report: Report, oldStatus: ReportStatus, newStatus: ReportStatus, targetUserId: string) => void;
  notifyTaskAssigned: (report: Report, technicianId: string) => void;
  notifyTaskReassigned: (report: Report, newTechnicianId: string, fromTechnicianName: string) => void;
  notifySLABreach: (report: Report, managerId: string, breachType: 'critical' | 'high') => void;
  notifyReportFollowed: (report: Report, followerId: string, followerName: string) => void;
  
  // Utility
  refresh: () => void;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use refs to prevent stale closures in intervals
  const userIdRef = useRef(userId);
  const settingsRef = useRef(settings);
  
  useEffect(() => {
    userIdRef.current = userId;
    settingsRef.current = settings;
  }, [userId, settings]);

  // Initial load and visibility change handler
  useEffect(() => {
    if (!userId) return;
    
    const loadData = () => {
      setNotifications(getNotifications(userId));
      setUnreadCount(getUnreadCount(userId));
      setSettings(getNotificationSettings());
    };
    
    loadData();
    updateLastSeen();
    
    // Update when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
        updateLastSeen();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Poll for new notifications every 30 seconds (simulates realtime)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const currentUnread = getUnreadCount(userId);
        setUnreadCount(currentUnread);
        
        // Refresh list if new notifications detected
        const currentNotifications = getNotifications(userId);
        if (currentNotifications.length !== notifications.length) {
          setNotifications(currentNotifications);
        }
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [userId]);

  const refresh = useCallback(() => {
    if (!userId) return;
    setNotifications(getNotifications(userId));
    setUnreadCount(getUnreadCount(userId));
  }, [userId]);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markNotificationAsRead(notificationId);
    refresh();
  }, [refresh]);

  const handleMarkAllAsRead = useCallback(() => {
    if (!userId) return;
    markAllAsRead(userId);
    refresh();
  }, [userId, refresh]);

  const handleDelete = useCallback((notificationId: string) => {
    deleteNotification(notificationId);
    refresh();
  }, [refresh]);

  const handleUpdateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    updateNotificationSettings(newSettings);
    setSettings(getNotificationSettings());
  }, []);

  const handleRequestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestBrowserPushPermission();
    setSettings(getNotificationSettings());
    return granted;
  }, []);

  // --- Notification Creators ---

  const notifyStatusChange = useCallback((
    report: Report,
    oldStatus: ReportStatus,
    newStatus: ReportStatus,
    targetUserId: string
  ) => {
    const notificationData = createStatusChangeNotification(targetUserId, report, oldStatus, newStatus);
    
    // Add to in-app notifications
    addNotification(notificationData);
    
    // Send browser push if enabled
    sendBrowserPush(notificationData);
    
    // Play sound for important updates
    if (newStatus === 'Resolved' || newStatus === 'Rejected') {
      playNotificationSound(notificationData.priority);
    }
    
    // Refresh local state if this is the current user
    if (targetUserId === userIdRef.current) {
      refresh();
    }
  }, [refresh]);

  const notifyTaskAssigned = useCallback((report: Report, technicianId: string) => {
    const notificationData = createTaskAssignedNotification(technicianId, report);
    
    addNotification(notificationData);
    sendBrowserPush(notificationData);
    playNotificationSound(notificationData.priority);
    
    if (technicianId === userIdRef.current) {
      refresh();
    }
  }, [refresh]);

  const notifyTaskReassigned = useCallback((
    report: Report,
    newTechnicianId: string,
    fromTechnicianName: string
  ) => {
    const notificationData = createTaskReassignedNotification(newTechnicianId, report, fromTechnicianName);
    
    addNotification(notificationData);
    sendBrowserPush(notificationData);
    playNotificationSound('medium');
    
    // Also notify the old technician
    if (report.assignedTo) {
      const oldTechNotification = {
        userId: report.assignedTo,
        type: 'task_reassigned' as const,
        title: 'Task Transferred',
        message: `Your ${report.category} task has been reassigned to another technician`,
        priority: 'medium' as const,
        reportId: report.id,
        read: false,
        actionUrl: `/technician/tasks`,
      };
      addNotification(oldTechNotification);
      sendBrowserPush(oldTechNotification);
    }
    
    if (newTechnicianId === userIdRef.current) {
      refresh();
    }
  }, [refresh]);

  const notifySLABreach = useCallback((report: Report, managerId: string, breachType: 'critical' | 'high') => {
    const notificationData = createSLABreachNotification(managerId, report, breachType);
    
    addNotification(notificationData);
    sendBrowserPush(notificationData);
    playNotificationSound(breachType === 'critical' ? 'critical' : 'high');
    
    if (managerId === userIdRef.current) {
      refresh();
    }
  }, [refresh]);

  const notifyReportFollowed = useCallback((report: Report, followerId: string, followerName: string) => {
    // Don't notify if user follows their own report
    if (report.citizenId === followerId) return;
    
    const notificationData = createReportFollowedNotification(report.citizenId, report, followerName);
    
    addNotification(notificationData);
    // No browser push for follows (too noisy)
    
    if (report.citizenId === userIdRef.current) {
      refresh();
    }
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    settings,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    updateSettings: handleUpdateSettings,
    requestBrowserPermission: handleRequestPermission,
    notifyStatusChange,
    notifyTaskAssigned,
    notifyTaskReassigned,
    notifySLABreach,
    notifyReportFollowed,
    refresh,
  };
}

// Hook for notification bell/badge in navbar
export function useNotificationBell(userId?: string): {
  unreadCount: number;
  hasUnread: boolean;
  refresh: () => void;
} {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!userId) return;
    
    const update = () => {
      setCount(getUnreadCount(userId));
    };
    
    update();
    
    const interval = setInterval(update, 10000); // Check every 10 seconds
    
    // Update on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        update();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);
  
  const refresh = useCallback(() => {
    if (!userId) return;
    setCount(getUnreadCount(userId));
  }, [userId]);
  
  return {
    unreadCount: count,
    hasUnread: count > 0,
    refresh,
  };
}
