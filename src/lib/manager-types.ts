import { Report, Role } from './types';

export type ManagerStat = {
  label: string;
  value: number;
  color?: 'primary' | 'yellow' | 'blue' | 'green' | 'red';
  trend?: string;
};

export type TechnicianWorkload = {
  id: string;
  name: string;
  activeTasks: number;
  district: string;
};

export interface ManagerReport extends Report {
  assignedTechName?: string;
}
