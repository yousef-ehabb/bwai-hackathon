'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDistrictTechnicians } from '@/lib/manager-storage';
import { TechnicianWorkload } from '@/lib/manager-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Zap, MoreVertical } from 'lucide-react';

export default function ManagerTechniciansPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [techs, setTechs] = useState<TechnicianWorkload[]>([]);

  useEffect(() => {
    if (currentUser?.district) {
      const data = getDistrictTechnicians(currentUser.district);
      setTechs(data);
    }
  }, [currentUser]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/manager/dashboard')}>
               <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
               <h1 className="text-4xl font-display font-semibold tracking-tight text-primary">Field Team</h1>
               <p className="text-sm text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1">Workload & Personnel Management</p>
            </div>
         </div>
         <Badge className="bg-brand-blue/10 text-brand-blue border-none rounded-full px-4 py-1.5 font-display font-bold">
            {currentUser?.district} Division
         </Badge>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <Card className="bg-surface border-none rounded-[32px] p-8">
            <CardContent className="p-0">
               <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-2">Total Staff</p>
               <p className="text-5xl font-display font-medium text-primary">{techs.length}</p>
            </CardContent>
         </Card>
         <Card className="bg-surface border-none rounded-[32px] p-8">
            <CardContent className="p-0">
               <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-2">Active Tasks</p>
               <p className="text-5xl font-display font-medium text-[#494fdf]">
                  {techs.reduce((acc, current) => acc + current.activeTasks, 0)}
               </p>
            </CardContent>
         </Card>
         <Card className="bg-primary border-none rounded-[32px] p-8 text-white relative overflow-hidden">
            <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-white/5 rotate-12" />
            <CardContent className="p-0 relative z-10">
               <p className="text-xs uppercase font-bold text-white/50 tracking-widest mb-2">Health Score</p>
               <p className="text-5xl font-display font-medium">98.2%</p>
            </CardContent>
         </Card>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techs.length > 0 ? techs.map(tech => (
          <Card key={tech.id} className="rounded-[40px] border border-border/50 hover:border-brand-blue/30 transition-all group overflow-hidden bg-white">
            <CardContent className="p-8">
               <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center font-display font-bold text-2xl text-primary border-2 border-white shadow-lg">
                      {tech.name[0]}
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <MoreVertical className="h-5 w-5" />
                  </Button>
               </div>
               
               <div className="mb-8">
                  <h3 className="text-2xl font-display font-medium text-primary mb-1">{tech.name}</h3>
                  <p className="text-[12px] uppercase font-bold text-muted-foreground tracking-widest">{tech.id}</p>
               </div>

               <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-display font-bold text-primary">{tech.activeTasks}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Tasks</p>
                  </div>
                  <div className="text-right">
                     <Badge className={tech.activeTasks > 3 ? "bg-amber-100 text-amber-700" : "bg-[#00a87e]/10 text-[#00a87e]"}>
                        {tech.activeTasks > 3 ? "High Load" : "Optimal"}
                     </Badge>
                  </div>
               </div>
               
               <div className="mt-8 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-full border-border text-xs h-10">View Profile</Button>
                  <Button className="rounded-full bg-primary text-white text-xs h-10">Assign Task</Button>
               </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center">
             <p className="text-muted-foreground italic">No technicians found in District {currentUser?.district}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
