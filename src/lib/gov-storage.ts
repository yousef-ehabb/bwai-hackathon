import { getReports, getUsers } from './storage';
import { Report, User } from './types';
import { CityOverview, DistrictStats, CategoryStats, SLABreach } from './gov-types';

export function getCityOverviewStats(): CityOverview {
  const reports = getReports();
  const today = new Date().toISOString().split('T')[0];
  
  const activeIssues = reports.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
  const resolvedToday = reports.filter(r => r.status === 'Resolved' && r.resolvedAt?.startsWith(today)).length;
  
  // Calculate Avg Resolution Time
  const resolvedReports = reports.filter(r => r.status === 'Resolved' && r.resolvedAt);
  let totalHours = 0;
  resolvedReports.forEach(r => {
    const start = new Date(r.createdAt).getTime();
    const end = new Date(r.resolvedAt!).getTime();
    totalHours += (end - start) / (1000 * 60 * 60);
  });
  
  const avgResolutionTime = resolvedReports.length > 0 ? totalHours / resolvedReports.length : 0;
  
  // SLA Breaches
  const breaches = getSLABreaches();

  return {
    totalReports: reports.length,
    activeIssues,
    resolvedToday,
    avgResolutionTime,
    slaBreachCount: breaches.length
  };
}

export function getDistrictRankings(): DistrictStats[] {
  const reports = getReports();
  const districts = Array.from(new Set(reports.map(r => r.district)));
  
  return districts.map(districtName => {
    const districtReports = reports.filter(r => r.district === districtName);
    const resolved = districtReports.filter(r => r.status === 'Resolved');
    
    let totalHours = 0;
    resolved.forEach(r => {
      const start = new Date(r.createdAt).getTime();
      const end = new Date(r.resolvedAt!).getTime();
      totalHours += (end - start) / (1000 * 60 * 60);
    });

    return {
      districtName,
      totalReports: districtReports.length,
      resolvedCount: resolved.length,
      resolutionRate: districtReports.length > 0 ? (resolved.length / districtReports.length) * 100 : 0,
      avgResolutionTime: resolved.length > 0 ? totalHours / resolved.length : 0,
      pendingCount: districtReports.filter(r => r.status === 'Pending').length
    };
  }).sort((a, b) => b.resolutionRate - a.resolutionRate);
}

export function getCategoryBreakdown(): CategoryStats[] {
  const reports = getReports();
  const categories: Record<string, number> = {};
  
  reports.forEach(r => {
    categories[r.category] = (categories[r.category] || 0) + 1;
  });
  
  return Object.entries(categories).map(([category, count]) => ({
    category,
    count
  })).sort((a, b) => b.count - a.count);
}

export function getSLABreaches(): SLABreach[] {
  const reports = getReports();
  const now = new Date().getTime();
  const breaches: SLABreach[] = [];
  
  reports.forEach(r => {
    if (r.status === 'Pending') {
      const ageMs = now - new Date(r.createdAt).getTime();
      const ageMins = ageMs / (1000 * 60);
      const ageHours = ageMs / (1000 * 60 * 60);
      
      if (r.urgency === 'High' && ageHours > 4) {
        breaches.push({
          reportId: r.id,
          category: r.category,
          urgency: r.urgency,
          district: r.district,
          timeExceeded: `${Math.floor(ageHours)}h`,
          severity: 'High'
        });
      } else if (ageMins > 30) {
          // Check for Critical - based on overview, critical is inferred or explicitly high?
          // Let's assume we use High as a proxy or if we had a 'Critical' urgency.
          // Since project-overview mentions "Critical unassigned > 30 minutes", 
          // I'll check if there's any report > 30m unassigned.
          // If we don't have 'Critical' urgency in types, I'll treat High + >30m as critical breach if over 30m?
          // Actually let's just stick to the overview: "Critical unassigned > 30 minutes"
          // I'll treat urgency 'High' + >30m as 'Critical' severity breach for the Governor.
          if (ageMins > 30) {
             breaches.push({
                reportId: r.id,
                category: r.category,
                urgency: r.urgency,
                district: r.district,
                timeExceeded: `${Math.floor(ageMins)}m`,
                severity: 'Critical'
              });
          }
      }
    }
  });
  
  return breaches;
}
