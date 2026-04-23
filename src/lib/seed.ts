import { User } from './types';

export function seedData(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('uf_seeded')) return;

  const users: User[] = [
    { id: 'GOV001', password: 'pass123', role: 'governor', name: 'Gov. Hassan Mostafa', phone: '01000000001', district: null },
    { id: 'MGR001', password: 'pass123', role: 'manager', name: 'Manager Sara Khaled', phone: '01000000002', district: 'District A' },
    { id: 'MGR002', password: 'pass123', role: 'manager', name: 'Manager Omar Fathy', phone: '01000000003', district: 'District B' },
    { id: 'TECH001', password: 'pass123', role: 'technician', name: 'Tech Ahmed Nabil', phone: '01000000004', district: 'District A' },
    { id: 'TECH002', password: 'pass123', role: 'technician', name: 'Tech Mona Ibrahim', phone: '01000000005', district: 'District A' },
    { id: 'TECH003', password: 'pass123', role: 'technician', name: 'Tech Youssef Ali', phone: '01000000006', district: 'District B' },
  ];

  const categories = ['Pothole', 'Streetlight', 'Water Leak', 'Trash', 'Sewage', 'Electrical', 'Road Damage'];

  localStorage.setItem('uf_users', JSON.stringify(users));
  localStorage.setItem('uf_reports', JSON.stringify([]));
  localStorage.setItem('uf_categories', JSON.stringify(categories));
  localStorage.setItem('uf_seeded', 'true');
}
