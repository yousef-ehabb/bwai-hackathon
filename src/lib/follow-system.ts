/**
 * Report Following System
 * 
 * Allows citizens to follow reports without creating duplicates.
 * Extends existing report model without modifying types.ts.
 */

import { getReports, setReports, getUsers } from './storage';
import { Report } from './types';

// --- Types ---

export interface ReportFollower {
  userId: string;
  userName: string;
  followedAt: string;
}

export interface FollowedReportData {
  reportId: string;
  followers: ReportFollower[];
}

export interface FollowResult {
  success: boolean;
  error?: string;
  isNowFollowing?: boolean;
}

// --- Storage Keys ---

const FOLLOWERS_KEY = 'uf_report_followers';

// --- Storage Helpers ---

function getAllFollowers(): Record<string, ReportFollower[]> {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '{}');
}

function saveFollowers(data: Record<string, ReportFollower[]>): void {
  localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(data));
}

function getReportFollowers(reportId: string): ReportFollower[] {
  const all = getAllFollowers();
  return all[reportId] || [];
}

function saveReportFollowers(reportId: string, followers: ReportFollower[]): void {
  const all = getAllFollowers();
  if (followers.length === 0) {
    delete all[reportId];
  } else {
    all[reportId] = followers;
  }
  saveFollowers(all);
}

// --- Core Functions ---

/**
 * Follow a report
 */
export function followReport(reportId: string, userId: string): FollowResult {
  const report = getReports().find(r => r.id === reportId);
  if (!report) {
    return { success: false, error: 'Report not found' };
  }

  // Cannot follow your own report
  if (report.citizenId === userId) {
    return { success: false, error: 'Cannot follow your own report' };
  }

  const followers = getReportFollowers(reportId);

  // Check if already following
  if (followers.some(f => f.userId === userId)) {
    return { success: false, error: 'Already following this report' };
  }

  // Get user name
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  const newFollower: ReportFollower = {
    userId,
    userName: user?.name || 'Anonymous',
    followedAt: new Date().toISOString(),
  };

  followers.push(newFollower);
  saveReportFollowers(reportId, followers);

  return { success: true, isNowFollowing: true };
}

/**
 * Unfollow a report
 */
export function unfollowReport(reportId: string, userId: string): FollowResult {
  const followers = getReportFollowers(reportId);
  const filtered = followers.filter(f => f.userId !== userId);

  if (filtered.length === followers.length) {
    return { success: false, error: 'Not following this report' };
  }

  saveReportFollowers(reportId, filtered);

  return { success: true, isNowFollowing: false };
}

/**
 * Toggle follow status
 */
export function toggleFollowReport(reportId: string, userId: string): FollowResult {
  const isFollowing = isUserFollowingReport(reportId, userId);

  if (isFollowing) {
    return unfollowReport(reportId, userId);
  } else {
    return followReport(reportId, userId);
  }
}

/**
 * Check if user is following a report
 */
export function isUserFollowingReport(reportId: string, userId: string): boolean {
  const followers = getReportFollowers(reportId);
  return followers.some(f => f.userId === userId);
}

/**
 * Get follower count for a report
 */
export function getReportFollowerCount(reportId: string): number {
  return getReportFollowers(reportId).length;
}

/**
 * Get all reports a user is following
 */
export function getUserFollowedReports(userId: string): Array<{ report: Report; followedAt: string }> {
  const allReports = getReports();
  const allFollowers = getAllFollowers();
  const followed: Array<{ report: Report; followedAt: string }> = [];

  Object.entries(allFollowers).forEach(([reportId, followers]) => {
    const follower = followers.find(f => f.userId === userId);
    if (follower) {
      const report = allReports.find(r => r.id === reportId);
      if (report) {
        followed.push({ report, followedAt: follower.followedAt });
      }
    }
  });

  // Sort by followed date, most recent first
  return followed.sort((a, b) =>
    new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime()
  );
}

/**
 * Get followers for a report (for notifications)
 */
export function getFollowersForNotification(reportId: string): ReportFollower[] {
  return getReportFollowers(reportId);
}

/**
 * Get follow stats for a report
 */
export function getReportFollowStats(reportId: string): {
  count: number;
  recentFollowers: ReportFollower[];
} {
  const followers = getReportFollowers(reportId);

  // Get followers from last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentFollowers = followers
    .filter(f => new Date(f.followedAt) >= weekAgo)
    .sort((a, b) => new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime())
    .slice(0, 5);

  return {
    count: followers.length,
    recentFollowers,
  };
}

/**
 * Get potential duplicate reports (for "follow instead" feature)
 * Returns reports within radius that the user is not already following
 */
export function getFollowSuggestions(
  category: string,
  lat: number,
  lng: number,
  radiusMeters: number = 50,
  excludeUserId: string
): Array<{ report: Report; distance: number; followerCount: number }> {
  const allReports = getReports();
  const suggestions: Array<{ report: Report; distance: number; followerCount: number }> = [];

  allReports.forEach(report => {
    // Skip user's own reports
    if (report.citizenId === excludeUserId) return;

    // Skip resolved or rejected
    if (report.status === 'Resolved' || report.status === 'Rejected') return;

    // Category must match
    if (report.category !== category) return;

    // Skip if already following
    if (isUserFollowingReport(report.id, excludeUserId)) return;

    // Calculate distance
    const distance = haversineDistance(lat, lng, report.gps.lat, report.gps.lng);

    if (distance <= radiusMeters) {
      suggestions.push({
        report,
        distance,
        followerCount: getReportFollowerCount(report.id),
      });
    }
  });

  // Sort by distance (closest first)
  return suggestions.sort((a, b) => a.distance - b.distance);
}

// --- Distance Calculation ---

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// --- Follow Button Component Data ---

export interface FollowButtonState {
  isFollowing: boolean;
  followerCount: number;
  canFollow: boolean;
  reason?: string;
}

export function getFollowButtonState(reportId: string, userId: string): FollowButtonState {
  const report = getReports().find(r => r.id === reportId);

  if (!report) {
    return { isFollowing: false, followerCount: 0, canFollow: false, reason: 'Report not found' };
  }

  // Cannot follow own report
  if (report.citizenId === userId) {
    return { isFollowing: false, followerCount: 0, canFollow: false, reason: 'Your report' };
  }

  // Cannot follow resolved/rejected
  if (report.status === 'Resolved' || report.status === 'Rejected') {
    return { isFollowing: false, followerCount: 0, canFollow: false, reason: 'Report closed' };
  }

  const isFollowing = isUserFollowingReport(reportId, userId);
  const followerCount = getReportFollowerCount(reportId);

  return {
    isFollowing,
    followerCount,
    canFollow: true,
  };
}
