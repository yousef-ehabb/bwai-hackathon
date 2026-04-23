/**
 * Notification System Core
 * 
 * Manages in-app and browser push notifications.
 * Designed for easy migration to Supabase Realtime.
 */

import { Report, ReportStatus } from './types';

// Notification Types
export type NotificationType = 
  | 'status_change'
  | 'task_assigned'
  | 'task_reassigned'
  | 'sla_breach'
  | 'report_followed'
  | 'daily_summary';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  reportId?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// localStorage Keys
const NOTIFICATIONS_KEY = 'uf_notifications';
const NOTIFICATION_SETTINGS_KEY = 'uf_notification_settings';
const LAST_SEEN_KEY = 'uf_notifications_last_seen';

// Notification Settings
export interface NotificationSettings {
  browserPushEnabled: boolean;
  inAppEnabled: boolean;
  soundEnabled: boolean;
  mutedTypes: NotificationType[];
}

const defaultSettings: NotificationSettings = {
  browserPushEnabled: false,
  inAppEnabled: true,
  soundEnabled: true,
  mutedTypes: [],
};

// --- Storage Helpers ---

export function getNotifications(userId?: string): Notification[] {
  if (typeof window === 'undefined') return [];
  
  const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]') as Notification[];
  
  if (userId) {
    return all.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  return all;
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  const all = getNotifications();
  all.unshift(newNotification);
  
  // Keep only last 100 notifications per user to prevent storage bloat
  const userNotifications = all.filter(n => n.userId === notification.userId);
  const otherNotifications = all.filter(n => n.userId !== notification.userId);
  
  const trimmedUserNotifications = userNotifications.slice(0, 100);
  
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...trimmedUserNotifications, ...otherNotifications]));
  
  return newNotification;
}

export function markNotificationAsRead(notificationId: string): void {
  const all = getNotifications();
  const updated = all.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function markAllAsRead(userId: string): void {
  const all = getNotifications();
  const updated = all.map(n => 
    n.userId === userId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function deleteNotification(notificationId: string): void {
  const all = getNotifications();
  const filtered = all.filter(n => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter(n => !n.read).length;
}

// --- Settings ---

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return defaultSettings;
  return { ...defaultSettings, ...JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || '{}') };
}

export function updateNotificationSettings(settings: Partial<NotificationSettings>): void {
  const current = getNotificationSettings();
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}

// --- Browser Push Notifications ---

export async function requestBrowserPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  const granted = permission === 'granted';
  
  if (granted) {
    updateNotificationSettings({ browserPushEnabled: true });
  }
  
  return granted;
}

export function sendBrowserPush(notification: Omit<Notification, 'id' | 'createdAt'>): void {
  const settings = getNotificationSettings();
  
  if (!settings.browserPushEnabled) return;
  if (settings.mutedTypes.includes(notification.type)) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  // Use Service Worker for persistent notifications if available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION',
      payload: {
        title: notification.title,
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.reportId || notification.type,
        requireInteraction: notification.priority === 'critical',
        data: {
          actionUrl: notification.actionUrl,
          reportId: notification.reportId,
        },
      },
    });
  } else {
    // Fallback to standard Notification API
    new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: notification.reportId || notification.type,
      requireInteraction: notification.priority === 'critical',
    });
  }
}

// --- Notification Templates ---

export function createStatusChangeNotification(
  userId: string,
  report: Report,
  oldStatus: ReportStatus,
  newStatus: ReportStatus
): Omit<Notification, 'id' | 'createdAt'> {
  const statusMessages: Record<ReportStatus, string> = {
    'Pending': 'is pending review',
    'In Progress': 'is being worked on',
    'Resolved': 'has been resolved! 🎉',
    'Rejected': 'was rejected',
  };
  
  return {
    userId,
    type: 'status_change',
    title: `Report ${newStatus}`,
    message: `Your ${report.category} report ${statusMessages[newStatus]}`,
    priority: newStatus === 'Resolved' ? 'high' : 'medium',
    reportId: report.id,
    read: false,
    actionUrl: `/citizen/my-reports`,
  };
}

export function createTaskAssignedNotification(
  technicianId: string,
  report: Report
): Omit<Notification, 'id' | 'createdAt'> {
  return {
    userId: technicianId,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `You've been assigned a ${report.urgency.toLowerCase()} priority ${report.category} task`,
    priority: report.urgency === 'High' ? 'high' : 'medium',
    reportId: report.id,
    read: false,
    actionUrl: `/technician/tasks`,
  };
}

export function createTaskReassignedNotification(
  newTechnicianId: string,
  report: Report,
  fromTechnicianName: string
): Omit<Notification, 'id' | 'createdAt'> {
  return {
    userId: newTechnicianId,
    type: 'task_reassigned',
    title: 'Task Transferred',
    message: `A ${report.category} task was reassigned to you from ${fromTechnicianName}`,
    priority: 'medium',
    reportId: report.id,
    read: false,
    actionUrl: `/technician/tasks`,
  };
}

export function createSLABreachNotification(
  managerId: string,
  report: Report,
  breachType: 'critical' | 'high'
): Omit<Notification, 'id' | 'createdAt'> {
  return {
    userId: managerId,
    type: 'sla_breach',
    title: breachType === 'critical' ? '⚠️ Critical SLA Breach' : 'High Priority SLA Breach',
    message: `${report.category} in ${report.district} unassigned for ${breachType === 'critical' ? '>30min' : '>4h'}`,
    priority: breachType === 'critical' ? 'critical' : 'high',
    reportId: report.id,
    read: false,
    actionUrl: `/manager/reports`,
  };
}

export function createReportFollowedNotification(
  userId: string,
  report: Report,
  followerName: string
): Omit<Notification, 'id' | 'createdAt'> {
  return {
    userId: report.citizenId,
    type: 'report_followed',
    title: 'Someone Followed Your Report',
    message: `${followerName} is also tracking your ${report.category} report`,
    priority: 'low',
    reportId: report.id,
    read: false,
    actionUrl: `/citizen/my-reports`,
  };
}

// --- Sound Effects ---

const notificationSound = typeof window !== 'undefined' ? new Audio('/notification-sound.mp3') : null;

export function playNotificationSound(priority: NotificationPriority): void {
  const settings = getNotificationSettings();
  if (!settings.soundEnabled || !notificationSound) return;
  
  // Only play sound for medium+ priority
  if (priority === 'low') return;
  
  notificationSound.volume = priority === 'critical' ? 1.0 : 0.5;
  notificationSound.play().catch(() => {
    // Ignore autoplay restrictions
  });
}

// --- Last Seen Tracking ---

export function updateLastSeen(): void {
  localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
}

export function getLastSeen(): Date {
  const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
  return lastSeen ? new Date(lastSeen) : new Date(0);
}
