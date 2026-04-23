/**
 * Governor Analytics Library
 * 
 * Daily executive summary and advanced analytics for Governor role.
 * Extends existing gov-storage.ts without modifying it.
 */

import { getReports } from './storage';
import { Report, ReportStatus } from './types';

// --- Types ---

export interface DailySummary {
  date: string;
  generatedAt: string;
  metrics: DailyMetrics;
  topDistricts: TopDistrictSummary[];
  criticalIssues: CriticalIssue[];
  trends: TrendSummary;
}

export interface DailyMetrics {
  reportsCreated: number;
  reportsResolved: number;
  reportsInProgress: number;
  avgResolutionTime: number; // in hours
  slaBreaches: number;
  criticalUnassigned: number;
  highPriorityUnassigned: number;
}

export interface TopDistrictSummary {
  districtName: string;
  reportCount: number;
  resolvedCount: number;
  resolutionRate: number;
  avgResolutionTime: number;
}

export interface CriticalIssue {
  reportId: string;
  category: string;
  district: string;
  urgency: string;
  hoursUnassigned: number;
  status: 'critical' | 'high';
}

export interface TrendSummary {
  vsYesterday: {
    reportsCreated: number; // percentage
    reportsResolved: number;
    avgResolutionTime: number;
  };
  categoryTrends: Array<{
    category: string;
    change: number; // percentage change from yesterday
  }>;
}

// --- Storage Keys ---

const LAST_SUMMARY_KEY = 'uf_last_daily_summary';
const SUMMARY_HISTORY_KEY = 'uf_summary_history';

// --- Time Helpers ---

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

function hoursBetween(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
}

function isWithinLast24h(timestamp: string): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
}

// --- Core Analytics Functions ---

export function calculateDailyMetrics(): DailyMetrics {
  const allReports = getReports();
  const today = new Date();
  const todayStart = getStartOfDay(today);
  const todayEnd = getEndOfDay(today);
  
  // Reports created today
  const reportsCreated = allReports.filter(r => {
    const created = new Date(r.createdAt);
    return created >= todayStart && created <= todayEnd;
  }).length;
  
  // Reports resolved today
  const reportsResolved = allReports.filter(r => {
    if (!r.resolvedAt) return false;
    const resolved = new Date(r.resolvedAt);
    return resolved >= todayStart && resolved <= todayEnd;
  }).length;
  
  // Reports in progress
  const reportsInProgress = allReports.filter(r => r.status === 'In Progress').length;
  
  // Calculate average resolution time (for reports resolved in last 7 days)
  const lastWeekResolved = allReports.filter(r => {
    if (!r.resolvedAt) return false;
    const resolved = new Date(r.resolvedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return resolved >= weekAgo;
  });
  
  let avgResolutionTime = 0;
  if (lastWeekResolved.length > 0) {
    const totalHours = lastWeekResolved.reduce((sum, r) => {
      return sum + hoursBetween(r.createdAt, r.resolvedAt!);
    }, 0);
    avgResolutionTime = totalHours / lastWeekResolved.length;
  }
  
  // SLA Breaches
  const now = new Date();
  let criticalUnassigned = 0;
  let highPriorityUnassigned = 0;
  
  allReports.forEach(r => {
    if (r.status === 'Pending' || !r.assignedTo) {
      const hoursUnassigned = hoursBetween(r.createdAt, now);
      
      if (r.urgency === 'High' && hoursUnassigned > 4) {
        highPriorityUnassigned++;
      }
      
      if (hoursUnassigned > 0.5) { // 30 minutes
        criticalUnassigned++;
      }
    }
  });
  
  return {
    reportsCreated,
    reportsResolved,
    reportsInProgress,
    avgResolutionTime,
    slaBreaches: criticalUnassigned + highPriorityUnassigned,
    criticalUnassigned,
    highPriorityUnassigned,
  };
}

export function getTopDistricts(limit: number = 5): TopDistrictSummary[] {
  const allReports = getReports();
  const districtsMap = new Map<string, Report[]>();
  
  // Group by district
  allReports.forEach(r => {
    const district = r.district || 'Unknown';
    if (!districtsMap.has(district)) {
      districtsMap.set(district, []);
    }
    districtsMap.get(district)!.push(r);
  });
  
  // Calculate metrics per district
  const summaries: TopDistrictSummary[] = [];
  
  districtsMap.forEach((reports, districtName) => {
    const resolved = reports.filter(r => r.status === 'Resolved');
    const totalResolutionTime = resolved.reduce((sum, r) => {
      if (!r.resolvedAt) return sum;
      return sum + hoursBetween(r.createdAt, r.resolvedAt);
    }, 0);
    
    summaries.push({
      districtName,
      reportCount: reports.length,
      resolvedCount: resolved.length,
      resolutionRate: reports.length > 0 ? (resolved.length / reports.length) * 100 : 0,
      avgResolutionTime: resolved.length > 0 ? totalResolutionTime / resolved.length : 0,
    });
  });
  
  // Sort by report count (busiest districts)
  return summaries
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, limit);
}

export function getCriticalIssues(): CriticalIssue[] {
  const allReports = getReports();
  const now = new Date();
  const issues: CriticalIssue[] = [];
  
  allReports.forEach(r => {
    if (r.status !== 'Pending' && r.assignedTo) return;
    
    const hoursUnassigned = hoursBetween(r.createdAt, now);
    
    // Critical: unassigned > 30 minutes
    if (hoursUnassigned > 0.5) {
      issues.push({
        reportId: r.id,
        category: r.category,
        district: r.district || 'Unknown',
        urgency: r.urgency,
        hoursUnassigned,
        status: hoursUnassigned > 4 && r.urgency === 'High' ? 'critical' : 'high',
      });
    }
  });
  
  // Sort by severity then by hours
  return issues.sort((a, b) => {
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (a.status !== 'critical' && b.status === 'critical') return 1;
    return b.hoursUnassigned - a.hoursUnassigned;
  });
}

export function calculateTrends(): TrendSummary {
  const allReports = getReports();
  const today = new Date();
  const yesterday = getYesterday();
  
  // Today's metrics
  const todayStart = getStartOfDay(today);
  const todayEnd = getEndOfDay(today);
  const yesterdayStart = getStartOfDay(yesterday);
  const yesterdayEnd = getEndOfDay(yesterday);
  
  const todayCreated = allReports.filter(r => {
    const created = new Date(r.createdAt);
    return created >= todayStart && created <= todayEnd;
  }).length;
  
  const yesterdayCreated = allReports.filter(r => {
    const created = new Date(r.createdAt);
    return created >= yesterdayStart && created <= yesterdayEnd;
  }).length;
  
  const todayResolved = allReports.filter(r => {
    if (!r.resolvedAt) return false;
    const resolved = new Date(r.resolvedAt);
    return resolved >= todayStart && resolved <= todayEnd;
  }).length;
  
  const yesterdayResolved = allReports.filter(r => {
    if (!r.resolvedAt) return false;
    const resolved = new Date(r.resolvedAt);
    return resolved >= yesterdayStart && resolved <= yesterdayEnd;
  }).length;
  
  // Calculate percentage changes
  const calcChange = (today: number, yesterday: number): number => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };
  
  // Category trends (last 24h vs previous 24h)
  const categories = [...new Set(allReports.map(r => r.category))];
  const categoryTrends = categories.map(cat => {
    const catReports = allReports.filter(r => r.category === cat);
    const recent = catReports.filter(r => isWithinLast24h(r.createdAt)).length;
    
    // Previous 24h (24-48h ago)
    const prev24h = catReports.filter(r => {
      const created = new Date(r.createdAt);
      const hoursAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60);
      return hoursAgo > 24 && hoursAgo <= 48;
    }).length;
    
    return {
      category: cat,
      change: calcChange(recent, prev24h),
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)); // Sort by magnitude of change
  
  return {
    vsYesterday: {
      reportsCreated: calcChange(todayCreated, yesterdayCreated),
      reportsResolved: calcChange(todayResolved, yesterdayResolved),
      avgResolutionTime: 0, // Would need historical data
    },
    categoryTrends: categoryTrends.slice(0, 5),
  };
}

// --- Daily Summary Generation ---

export function generateDailySummary(): DailySummary {
  const summary: DailySummary = {
    date: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toISOString(),
    metrics: calculateDailyMetrics(),
    topDistricts: getTopDistricts(5),
    criticalIssues: getCriticalIssues(),
    trends: calculateTrends(),
  };
  
  // Store for future reference
  localStorage.setItem(LAST_SUMMARY_KEY, JSON.stringify(summary));
  
  // Add to history
  const history = getSummaryHistory();
  history.unshift(summary);
  // Keep only last 30 days
  const trimmedHistory = history.slice(0, 30);
  localStorage.setItem(SUMMARY_HISTORY_KEY, JSON.stringify(trimmedHistory));
  
  return summary;
}

export function getLastSummary(): DailySummary | null {
  const stored = localStorage.getItem(LAST_SUMMARY_KEY);
  if (!stored) return null;
  
  const summary = JSON.parse(stored) as DailySummary;
  
  // Check if it's from today
  const today = new Date().toISOString().split('T')[0];
  if (summary.date !== today) {
    // Generate new summary if outdated
    return generateDailySummary();
  }
  
  return summary;
}

export function getSummaryHistory(): DailySummary[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(SUMMARY_HISTORY_KEY) || '[]');
}

// --- Scheduler Simulation ---

export function shouldGenerateSummary(): boolean {
  const lastSummary = localStorage.getItem(LAST_SUMMARY_KEY);
  if (!lastSummary) return true;
  
  const { date, generatedAt } = JSON.parse(lastSummary);
  const today = new Date().toISOString().split('T')[0];
  
  if (date !== today) return true;
  
  // Check if it's after 8 AM and summary was generated before 8 AM
  const now = new Date();
  const generated = new Date(generatedAt);
  const eightAM = new Date();
  eightAM.setHours(8, 0, 0, 0);
  
  return now >= eightAM && generated < eightAM;
}

export function getScheduledSummary(): DailySummary | null {
  if (shouldGenerateSummary()) {
    return generateDailySummary();
  }
  return getLastSummary();
}

// --- Export for Email Simulation ---

export function formatSummaryForEmail(summary: DailySummary): string {
  const { metrics, criticalIssues, topDistricts, trends } = summary;
  
  return `
UrbanFix Daily Executive Summary
Generated: ${new Date(summary.generatedAt).toLocaleString('en-GB')}

📊 TODAY'S METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Reports Created: ${metrics.reportsCreated} (${trends.vsYesterday.reportsCreated > 0 ? '+' : ''}${trends.vsYesterday.reportsCreated}% vs yesterday)
• Reports Resolved: ${metrics.reportsResolved} (${trends.vsYesterday.reportsResolved > 0 ? '+' : ''}${trends.vsYesterday.reportsResolved}% vs yesterday)
• In Progress: ${metrics.reportsInProgress}
• Avg Resolution Time: ${metrics.avgResolutionTime.toFixed(1)} hours

🚨 SLA BREACHES: ${metrics.slaBreaches}
   • Critical (unassigned >30min): ${metrics.criticalUnassigned}
   • High Priority (unassigned >4h): ${metrics.highPriorityUnassigned}

🏆 TOP DISTRICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${topDistricts.map((d, i) => `${i + 1}. ${d.districtName}: ${d.reportCount} reports (${d.resolutionRate.toFixed(0)}% resolved)`).join('\n')}

⚠️ CRITICAL ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${criticalIssues.length > 0 
  ? criticalIssues.map(i => `• [${i.status.toUpperCase()}] ${i.category} in ${i.district} - ${i.hoursUnassigned.toFixed(1)}h unassigned`).join('\n')
  : 'All clear - no critical issues'}

📈 TRENDING CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${trends.categoryTrends.map(t => `• ${t.category}: ${t.change > 0 ? '+' : ''}${t.change}%`).join('\n')}

---
View full dashboard: ${typeof window !== 'undefined' ? window.location.origin : ''}/governor/dashboard
  `.trim();
}
