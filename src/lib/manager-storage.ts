import { getReports, setReports, getUsers } from './storage';
import { Report } from './types';
import { TechnicianWorkload } from './manager-types';

/**
 * Get all reports filtered by district.
 */
export function getDistrictReports(district: string): Report[] {
  const reports = getReports();
  return reports.filter(r => r.district === district);
}

/**
 * Get all technicians in a specific district with their current workload.
 */
export function getDistrictTechnicians(district: string): TechnicianWorkload[] {
  const users = getUsers();
  const reports = getReports();

  return users
    .filter(u => u.role === 'technician' && u.district === district)
    .map(u => ({
      id: u.id,
      name: u.name,
      district: u.district!,
      activeTasks: reports.filter(r => r.assignedTo === u.id && r.status === 'In Progress').length
    }));
}

/**
 * Assign a report to a technician.
 */
export function assignTechnician(reportId: string, technicianId: string): void {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index !== -1) {
    reports[index] = {
      ...reports[index],
      assignedTo: technicianId,
      status: 'In Progress',
    };
    setReports(reports);
  }
}

/**
 * Reject a report with a reason.
 */
export function rejectReport(reportId: string, reason: string): void {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index !== -1) {
    reports[index] = {
      ...reports[index],
      status: 'Rejected',
      rejectionReason: reason,
    };
    setReports(reports);
  }
}

/**
 * Check for SLA breaches in a district.
 * Breach = Unassigned High/Critical priority report older than 4 hours.
 */
export function getSLABreaches(district: string): Report[] {
  const reports = getDistrictReports(district);
  const now = new Date();
  
  return reports.filter(r => {
    if (r.status !== 'Pending') return false;
    if (r.assignedTo) return false;
    if (r.urgency !== 'High') return false;
    
    const created = new Date(r.createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours > 4;
  });
}
