import { ReportStatus, Urgency } from './types';

export interface DistrictStats {
  districtName: string;
  totalReports: number;
  resolvedCount: number;
  resolutionRate: number; // percentage
  avgResolutionTime: number; // in hours
  pendingCount: number;
}

export interface CategoryStats {
  category: string;
  count: number;
}

export interface SLABreach {
  reportId: string;
  category: string;
  urgency: Urgency;
  district: string;
  timeExceeded: string;
  severity: 'Critical' | 'High';
}

export interface CityOverview {
  totalReports: number;
  activeIssues: number;
  resolvedToday: number;
  avgResolutionTime: number;
  slaBreachCount: number;
}

export interface DailySummary {
  totalNewReports: number;
  resolvedIssues: number;
  highestDelayDistricts: { district: string; avgDelay: number }[];
}
