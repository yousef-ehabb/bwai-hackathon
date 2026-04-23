'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell,
  CheckCheck,
  Trash2,
  Circle,
  Info,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Notification } from '@/lib/notifications';

export function NotificationBell() {
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications(currentUser?.id);
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <Info className="h-4 w-4 text-blue-500" />;
      case 'task_assigned': return <Bell className="h-4 w-4 text-indigo-500" />;
      case 'task_reassigned': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'sla_breach': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-surface transition-colors h-10 w-10">
          <Bell className="h-5 w-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 bg-white border-border shadow-2xl rounded-[24px] overflow-hidden" align="end" sideOffset={8}>
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/30">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-primary">Notifications</h3>
            {unreadCount > 0 && <Badge className="bg-brand-blue text-white">{unreadCount} New</Badge>}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[11px] font-bold uppercase tracking-wider text-brand-blue hover:text-brand-blue/80 hover:bg-brand-blue/5 h-8 px-3"
            >
              <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-4 border-b border-border/50 transition-colors relative group",
                    !n.read ? "bg-brand-blue/5 hover:bg-brand-blue/10" : "hover:bg-surface"
                  )}
                  onClick={() => !n.read && markAsRead(n.id)}
                >
                  <div className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={cn("text-sm leading-tight truncate", !n.read ? "font-bold text-primary" : "text-muted-foreground")}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  {/* Delete button (visible on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-danger transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h4 className="font-bold text-primary mb-1">No notifications yet</h4>
              <p className="text-sm text-muted-foreground">We'll notify you when your reports are updated.</p>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-border text-center bg-surface/10">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Your city is watching out for you
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
