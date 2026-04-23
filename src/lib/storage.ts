import { User, Report, Session } from './types';

const isBrowser = typeof window !== 'undefined';

export function getUsers(): User[] {
  if (!isBrowser) return [];
  const raw = localStorage.getItem('uf_users');
  return raw ? JSON.parse(raw) : [];
}

export function setUsers(users: User[]): void {
  if (!isBrowser) return;
  localStorage.setItem('uf_users', JSON.stringify(users));
}

export function getReports(): Report[] {
  if (!isBrowser) return [];
  const raw = localStorage.getItem('uf_reports');
  return raw ? JSON.parse(raw) : [];
}

export function setReports(reports: Report[]): void {
  if (!isBrowser) return;
  localStorage.setItem('uf_reports', JSON.stringify(reports));
}

export function addReport(report: Report): void {
  if (!isBrowser) return;
  const reports = getReports();
  setReports([...reports, report]);
}

export function getSession(): Session | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem('uf_session');
  return raw ? JSON.parse(raw) : null;
}

export function setSession(user: Session): void {
  if (!isBrowser) return;
  localStorage.setItem('uf_session', JSON.stringify(user));
}

export function clearSession(): void {
  if (!isBrowser) return;
  localStorage.removeItem('uf_session');
}

export function getCategories(): string[] {
  if (!isBrowser) return [];
  const raw = localStorage.getItem('uf_categories');
  return raw ? JSON.parse(raw) : [];
}

export function archiveOldReports(): void {
  if (!isBrowser) return;
  const reports = getReports();
  const now = new Date().getTime();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  const updatedReports = reports.map(r => {
    if (r.status === 'Resolved' && r.resolvedAt) {
      const resolvedTime = new Date(r.resolvedAt).getTime();
      if (now - resolvedTime > fortyEightHoursMs) {
        return { ...r, status: 'Archived' as ReportStatus };
      }
    }
    return r;
  });

  setReports(updatedReports);
}

export function seedHotspotReports() {
  if (!isBrowser) return;
  const reports = getReports();
  // Only seed if we don't have many reports already to avoid cluttering every time
  if (reports.length > 50) return;

  const hotspotCenter = { lat: 30.0444, lng: 31.2357 }; // Downtown Cairo
  const categories = ['Road Damage', 'Water Leak', 'Electricity Outage', 'Street Lighting'];
  const districts = ['Cairo Central', 'Giza North', 'Nasr City'];

  const newMockReports: Report[] = [];

  for (let i = 0; i < 40; i++) {
    // Create a dense cluster around the center (within ~1km)
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;

    newMockReports.push({
      id: `seed-${Date.now()}-${i}`,
      citizenId: 'seed-user',
      citizenName: 'Heatmap Bot',
      category: categories[Math.floor(Math.random() * categories.length)],
      description: 'System generated report for heatmap testing.',
      address: 'Hotspot Test Area, Cairo',
      district: districts[Math.floor(Math.random() * districts.length)],
      gps: {
        lat: hotspotCenter.lat + latOffset,
        lng: hotspotCenter.lng + lngOffset
      },
      status: 'Pending',
      urgency: Math.random() > 0.7 ? 'High' : 'Medium',
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Within last 24h
      assignedTo: null,
      resolvedAt: null,
      afterPhoto: null,
      rejectionReason: null,
      isPublic: true,
      beforePhoto: null
    });
  }

  setReports([...reports, ...newMockReports]);
}
