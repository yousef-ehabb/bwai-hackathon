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
