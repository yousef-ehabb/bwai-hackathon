export type Role = 'citizen' | 'technician' | 'manager' | 'governor';

export type User = {
  id: string;
  password: string;
  role: Role;
  name: string;
  phone: string;
  district: string | null;
};

export type ReportStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected' | 'Archived';

export type Urgency = 'Low' | 'Medium' | 'High';

export type Report = {
  id: string;
  citizenId: string;
  citizenName: string;
  category: string;
  urgency: Urgency;
  description: string;
  gps: { lat: number; lng: number };
  address: string;
  district: string;
  beforePhoto: string | null;
  status: ReportStatus;
  createdAt: string;
  assignedTo: string | null;
  resolvedAt: string | null;
  afterPhoto: string | null;
  rejectionReason: string | null;
  isPublic: boolean;
};

export type Session = User;
