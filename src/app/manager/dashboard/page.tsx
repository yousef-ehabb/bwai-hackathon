'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDistrictReports, getDistrictTechnicians, getSLABreaches } from '@/lib/manager-storage';
import { Report } from '@/lib/types';
import { TechnicianWorkload } from '@/lib/manager-types';
import { MgrStatCard } from '@/components/shared/MgrStatCard';
import { MgrSLAAlert } from '@/components/shared/MgrSLAAlert';
import UrbanFixMap from '@/components/shared/UrbanFixMap';
import { 
  FileText, 
  Clock, 
  Wrench, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ManagerDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [techs, setTechs] = useState<TechnicianWorkload[]>([]);
  const [slaBreaches, setSlaBreaches] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function loadData() {
    if (currentUser?.district) {
      const districtReports = getDistrictReports(currentUser.district);
      const districtTechs = getDistrictTechnicians(currentUser.district);
      const breaches = getSLABreaches(currentUser.district);
      
      setReports(districtReports);
      setTechs(districtTechs);
      setSlaBreaches(breaches);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'Pending').length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center">Loading city data...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
           <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 sm:mb-3">District Operations</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-display-hero text-primary font-display font-medium tracking-tight leading-tight sm:leading-none mb-2">
              Situation Room<br className="hidden sm:block" />
              <span className="text-brand-blue uppercase text-2xl sm:text-3xl font-bold tracking-widest sm:ml-0"> {currentUser?.district}</span>
            </h1>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="border-primary text-primary font-bold border-2 rounded-full hover:bg-surface" onClick={() => router.push('/manager/technicians')}>
              <Users className="mr-2 h-4 w-4" /> Manage Team
           </Button>
           <Button className="bg-[#191c1f] border-[#191c1f] text-white font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => router.push('/manager/reports')}>
              Full Triage <ArrowUpRight className="ml-2 h-5 w-5" />
           </Button>
        </div>
      </div>

      {/* SLA Alerts */}
      <MgrSLAAlert count={slaBreaches.length} />

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div onClick={() => router.push('/manager/reports')} className="cursor-pointer group hover:scale-[1.02] transition-all duration-300">
          <MgrStatCard 
            label="Total Reports" 
            value={stats.total} 
            icon={<FileText className="h-6 w-6 text-primary" />}
            trend="+5.2%"
          />
        </div>
        <div onClick={() => router.push('/manager/reports?filter=Pending')} className="cursor-pointer group hover:scale-[1.02] transition-all duration-300">
          <MgrStatCard 
            label="Awaiting Triage" 
            value={stats.pending} 
            icon={<Clock className="h-6 w-6 text-[#ec7e00]" />}
            color="yellow"
            trend="Critical"
          />
        </div>
        <div onClick={() => router.push('/manager/reports?filter=In Progress')} className="cursor-pointer group hover:scale-[1.02] transition-all duration-300">
          <MgrStatCard 
            label="In Progress" 
            value={stats.inProgress} 
            icon={<Wrench className="h-6 w-6 text-[#494fdf]" />}
            color="blue"
          />
        </div>
        <div onClick={() => router.push('/manager/reports?filter=Resolved')} className="cursor-pointer group hover:scale-[1.02] transition-all duration-300">
          <MgrStatCard 
            label="Repairs Resolved" 
            value={stats.resolved} 
            icon={<CheckCircle className="h-6 w-6 text-[#00a87e]" />}
            color="green"
            trend="92%"
          />
        </div>
      </div>

      {/* District Heatmap */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-medium text-primary flex items-center gap-3">
            <MapPin className="h-6 w-6 text-brand-blue" /> District Heatmap
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Live incidents by location</p>
        </div>
        <UrbanFixMap reports={reports} />
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Technicians */}
        <div className="lg:col-span-2 bg-surface rounded-[40px] p-8">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-medium text-primary flex items-center gap-3">
                 <Users className="h-6 w-6 text-brand-blue" /> Field Technicians
              </h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{techs.length} Active</p>
           </div>
           
           <div className="space-y-4">
              {techs.length > 0 ? techs.map(tech => (
                <div key={tech.id} className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-border/50 group hover:border-brand-blue/30 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-primary">
                         {tech.name[0]}
                      </div>
                      <div>
                         <p className="font-bold text-primary">{tech.name}</p>
                         <p className="text-xs text-muted-foreground tracking-wide">{tech.id}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-display font-bold text-primary">{tech.activeTasks}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Tasks Assigned</p>
                   </div>
                </div>
              )) : (
                <p className="text-center py-10 text-muted-foreground italic">No technicians registered in this district.</p>
              )}
           </div>
        </div>

        {/* Categories Analysis */}
        <div className="bg-primary rounded-[40px] p-8 text-white relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-display font-medium mb-8 flex items-center gap-3">
                 <TrendingUp className="h-6 w-6 text-blue-400" /> District Insight
              </h2>
              
              <div className="space-y-6">
                 <div className="p-6 bg-white/5 rounded-[24px] border border-white/20 backdrop-blur-sm">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Primary Concern</p>
                    <p className="text-3xl font-display font-medium text-white">Road Damage</p>
                    <p className="text-sm text-white/50 mt-1">42% of total reports</p>
                 </div>

                 <div className="p-6 bg-white/5 rounded-[24px] border border-white/20 backdrop-blur-sm">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Resolution Rate</p>
                    <p className="text-3xl font-display font-medium text-white">18.4 Hours</p>
                    <p className="text-sm text-white/50 mt-1">Faster than city avg (24h)</p>
                 </div>
              </div>

              <div className="mt-12">
                 <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white rounded-full hover:bg-white/10" onClick={() => router.push('/manager/reports')}>
                    Detailed Analysis
                 </Button>
              </div>
           </div>
           
           {/* Decorative blur */}
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-blue/30 rounded-full blur-[80px]" />
        </div>
      </div>
    </div>
  );
}
