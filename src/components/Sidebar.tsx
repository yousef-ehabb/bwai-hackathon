'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/lib/types';
import RoleBadge from '@/components/RoleBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NotificationBell } from '@/components/NotificationBell';
import {
  Zap,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Users,
  ClipboardList,
  BarChart3,
  Map,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const navMap: Record<Role, NavItem[]> = {
  citizen: [
    { label: 'Dashboard', href: '/citizen/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Report Issue', href: '/citizen/report', icon: <AlertTriangle className="h-4 w-4" /> },
    { label: 'My Reports', href: '/citizen/my-reports', icon: <FileText className="h-4 w-4" /> },
  ],
  manager: [
    { label: 'Dashboard', href: '/manager/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Reports', href: '/manager/reports', icon: <FileText className="h-4 w-4" /> },
    { label: 'Technicians', href: '/manager/technicians', icon: <Users className="h-4 w-4" /> },
  ],
  technician: [
    { label: 'Dashboard', href: '/technician/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'My Tasks', href: '/technician/tasks', icon: <ClipboardList className="h-4 w-4" /> },
  ],
  governor: [
    { label: 'Overview', href: '/governor/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Analytics', href: '/governor/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Districts', href: '/governor/districts', icon: <Map className="h-4 w-4" /> },
  ],
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Sidebar({ role, className }: { role: Role; className?: string }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const links = navMap[role];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-[24px]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-primary tracking-tight">UrbanFix</span>
        </Link>
        <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
            </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-5 py-[14px] rounded-full text-[15px] font-display font-semibold transition-all duration-200 tracking-tight",
                isActive
                  ? "bg-primary text-white scale-[1.02]"
                  : "text-muted-foreground hover:bg-surface hover:text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {currentUser && (
        <div className="p-4 mt-auto">
          <div className="bg-surface rounded-[20px] p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-xs font-bold shrink-0">
                {getInitials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-primary truncate leading-none mb-1 font-display">
                    {currentUser.name.split(' ')[0]}
                </p>
                <RoleBadge role={currentUser.role} />
              </div>
            </div>
            
            <Separator className="bg-border/50" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-danger hover:text-danger hover:bg-danger/5 px-2 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-primary tracking-tight">UrbanFix</span>
        </Link>
        <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                <Menu className="h-6 w-6" />
            </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden animate-in fade-in duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Sidebar (Mobile) */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] md:hidden transition-transform duration-300 ease-in-out shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {SidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col w-[260px] h-screen bg-white border-r border-border overflow-hidden sticky top-0",
        className
      )}>
        {SidebarContent}
      </aside>
    </>
  );
}
