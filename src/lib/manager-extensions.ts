/**
 * Manager Extensions Library
 * 
 * Additional manager functionality without modifying existing files.
 * Handles task reassignment and related operations.
 */

import { getReports, setReports, getUsers } from './storage';
import { Report } from './types';
import { TechnicianWorkload } from './manager-types';
import { getDistrictTechnicians } from './manager-storage';

// --- Types ---

export interface ReassignmentRecord {
  reportId: string;
  fromTechnicianId: string | null;
  toTechnicianId: string;
  fromTechnicianName: string;
  toTechnicianName: string;
  reassignedAt: string;
  reason?: string;
}

export interface ReassignmentResult {
  success: boolean;
  report?: Report;
  error?: string;
  reassignmentRecord?: ReassignmentRecord;
}

// --- Storage Keys ---

const REASSIGNMENT_HISTORY_KEY = 'uf_reassignment_history';

// --- Core Functions ---

/**
 * Reassign a report from one technician to another
 * This is different from initial assignment - it preserves history
 */
export function reassignReport(
  reportId: string,
  newTechnicianId: string,
  reason?: string
): ReassignmentResult {
  const reports = getReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex === -1) {
    return { success: false, error: 'Report not found' };
  }
  
  const report = reports[reportIndex];
  
  // Get technician names for the record
  const users = getUsers();
  const fromTech = report.assignedTo ? users.find(u => u.id === report.assignedTo) : null;
  const toTech = users.find(u => u.id === newTechnicianId);
  
  if (!toTech) {
    return { success: false, error: 'New technician not found' };
  }
  
  if (toTech.role !== 'technician') {
    return { success: false, error: 'Target user is not a technician' };
  }
  
  // Cannot reassign to the same technician
  if (report.assignedTo === newTechnicianId) {
    return { success: false, error: 'Cannot reassign to the same technician' };
  }
  
  // Create reassignment record
  const reassignmentRecord: ReassignmentRecord = {
    reportId,
    fromTechnicianId: report.assignedTo,
    toTechnicianId: newTechnicianId,
    fromTechnicianName: fromTech?.name || 'Unassigned',
    toTechnicianName: toTech.name,
    reassignedAt: new Date().toISOString(),
    reason,
  };
  
  // Update report
  const updatedReport: Report = {
    ...report,
    assignedTo: newTechnicianId,
    status: 'In Progress', // Ensure it stays in progress
  };
  
  // Save report
  reports[reportIndex] = updatedReport;
  setReports(reports);
  
  // Save reassignment history
  saveReassignmentRecord(reassignmentRecord);
  
  return {
    success: true,
    report: updatedReport,
    reassignmentRecord,
  };
}

/**
 * Get reassignment history for a specific report
 */
export function getReportReassignmentHistory(reportId: string): ReassignmentRecord[] {
  const allHistory = getReassignmentHistory();
  return allHistory.filter(r => r.reportId === reportId);
}

/**
 * Get all reassignment history
 */
export function getReassignmentHistory(): ReassignmentRecord[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(REASSIGNMENT_HISTORY_KEY) || '[]');
}

/**
 * Save a reassignment record
 */
function saveReassignmentRecord(record: ReassignmentRecord): void {
  const history = getReassignmentHistory();
  history.unshift(record);
  
  // Keep only last 100 reassignments
  const trimmed = history.slice(0, 100);
  localStorage.setItem(REASSIGNMENT_HISTORY_KEY, JSON.stringify(trimmed));
}

/**
 * Get available technicians for reassignment
 * Excludes the current assigned technician
 */
export function getAvailableTechniciansForReassignment(
  district: string,
  currentTechnicianId: string | null
): TechnicianWorkload[] {
  const allTechnicians = getDistrictTechnicians(district);
  
  // Filter out the current technician
  return allTechnicians.filter(t => t.id !== currentTechnicianId);
}

/**
 * Check if a technician can be reassigned tasks
 * Returns count of active tasks
 */
export function getTechnicianActiveTaskCount(technicianId: string): number {
  const reports = getReports();
  return reports.filter(r => 
    r.assignedTo === technicianId && 
    r.status === 'In Progress'
  ).length;
}

/**
 * Mass reassign all tasks from one technician to another
 * Used when technician is on leave/unavailable
 */
export function massReassignTasks(
  fromTechnicianId: string,
  toTechnicianId: string,
  reason: string
): { success: boolean; reassignedCount: number; error?: string } {
  const reports = getReports();
  const users = getUsers();
  
  const toTech = users.find(u => u.id === toTechnicianId);
  if (!toTech || toTech.role !== 'technician') {
    return { success: false, reassignedCount: 0, error: 'Invalid target technician' };
  }
  
  let reassignedCount = 0;
  const updatedReports = reports.map(report => {
    if (report.assignedTo === fromTechnicianId && report.status === 'In Progress') {
      reassignedCount++;
      
      // Save individual record for each
      saveReassignmentRecord({
        reportId: report.id,
        fromTechnicianId,
        toTechnicianId,
        fromTechnicianName: users.find(u => u.id === fromTechnicianId)?.name || 'Unknown',
        toTechnicianName: toTech.name,
        reassignedAt: new Date().toISOString(),
        reason: `Mass reassignment: ${reason}`,
      });
      
      return { ...report, assignedTo: toTechnicianId };
    }
    return report;
  });
  
  if (reassignedCount > 0) {
    setReports(updatedReports);
  }
  
  return { success: true, reassignedCount };
}

/**
 * Get reassignment statistics for a district
 */
export function getDistrictReassignmentStats(district: string): {
  totalReassignments: number;
  todayReassignments: number;
  averageReassignmentsPerDay: number;
} {
  const history = getReassignmentHistory();
  
  // Get reports in this district to filter history
  const reports = getReports();
  const districtReportIds = new Set(
    reports.filter(r => r.district === district).map(r => r.id)
  );
  
  const districtHistory = history.filter(h => districtReportIds.has(h.reportId));
  
  const today = new Date().toISOString().split('T')[0];
  const todayReassignments = districtHistory.filter(h => 
    h.reassignedAt.startsWith(today)
  ).length;
  
  // Calculate average per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentHistory = districtHistory.filter(h => 
    new Date(h.reassignedAt) >= thirtyDaysAgo
  );
  
  const averageReassignmentsPerDay = recentHistory.length / 30;
  
  return {
    totalReassignments: districtHistory.length,
    todayReassignments,
    averageReassignmentsPerDay: Math.round(averageReassignmentsPerDay * 10) / 10,
  };
}

/**
 * Validate reassignment request
 * Returns validation errors or null if valid
 */
export function validateReassignment(
  reportId: string,
  newTechnicianId: string
): string | null {
  const reports = getReports();
  const report = reports.find(r => r.id === reportId);
  
  if (!report) {
    return 'Report not found';
  }
  
  if (report.status === 'Resolved') {
    return 'Cannot reassign a resolved report';
  }
  
  if (report.status === 'Rejected') {
    return 'Cannot reassign a rejected report';
  }
  
  const users = getUsers();
  const tech = users.find(u => u.id === newTechnicianId);
  
  if (!tech) {
    return 'Technician not found';
  }
  
  if (tech.role !== 'technician') {
    return 'Target user is not a technician';
  }
  
  if (tech.district !== report.district) {
    return 'Technician must be in the same district';
  }
  
  if (report.assignedTo === newTechnicianId) {
    return 'Cannot reassign to the same technician';
  }
  
  return null; // Valid
}
