/**
 * FollowButton Component
 * 
 * Allows citizens to follow/unfollow reports.
 * Shows follower count and current status.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  toggleFollowReport, 
  getFollowButtonState,
  getFollowersForNotification 
} from '@/lib/follow-system';
import { Report } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Users,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FollowButtonProps {
  report: Report;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  report,
  size = 'md',
  variant = 'outline',
  showCount = true,
  className,
  onFollowChange,
}: FollowButtonProps) {
  const { currentUser } = useAuth();
  const { notifyReportFollowed } = useNotifications(currentUser?.id);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [canFollow, setCanFollow] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial state
  useEffect(() => {
    if (!currentUser) return;
    
    const state = getFollowButtonState(report.id, currentUser.id);
    setIsFollowing(state.isFollowing);
    setFollowerCount(state.followerCount);
    setCanFollow(state.canFollow);
    setDisabledReason(state.reason || '');
  }, [report.id, currentUser]);

  // Refresh state periodically
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(() => {
      const state = getFollowButtonState(report.id, currentUser.id);
      setFollowerCount(state.followerCount);
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [report.id, currentUser]);

  const handleToggleFollow = useCallback(async () => {
    if (!currentUser || !canFollow || isLoading) return;
    
    setIsLoading(true);
    
    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = toggleFollowReport(report.id, currentUser.id);
    
    if (result.success) {
      const newFollowingState = result.isNowFollowing || false;
      setIsFollowing(newFollowingState);
      
      // Update count
      const newState = getFollowButtonState(report.id, currentUser.id);
      setFollowerCount(newState.followerCount);
      
      // Notify the report owner (only when following, not unfollowing)
      if (newFollowingState) {
        notifyReportFollowed(report, currentUser.id, currentUser.name || 'Someone');
      }
      
      // Show toast
      toast.success(newFollowingState ? 'Following this report' : 'Unfollowed report', {
        description: newFollowingState 
          ? "You'll receive updates about this issue" 
          : "You won't receive updates anymore",
      });
      
      // Callback
      onFollowChange?.(newFollowingState);
    } else {
      toast.error(result.error || 'Failed to update follow status');
    }
    
    setIsLoading(false);
  }, [currentUser, report, canFollow, isLoading, onFollowChange, notifyReportFollowed]);

  // Size classes (mapped to valid Button sizes)
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm', // 'md' will map to 'default' in Button
    lg: 'h-12 px-6 text-base',
  };

  // If no user or can't follow, show disabled state
  if (!currentUser) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn('opacity-50 cursor-not-allowed', className)}
      >
        <Bell className="h-4 w-4 mr-2" />
        Sign in to follow
      </Button>
    );
  }

  if (!canFollow && disabledReason) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={cn('opacity-50 cursor-not-allowed text-muted-foreground', className)}
      >
        {showCount && followerCount > 0 && (
          <Users className="h-4 w-4 mr-2" />
        )}
        {disabledReason}
        {showCount && followerCount > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {followerCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size === 'md' ? 'default' : size}
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200',
        sizeClasses[size],
        isFollowing && 'bg-blue-500 hover:bg-blue-600 border-blue-500',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn('h-4 w-4 animate-spin', size !== 'sm' && 'mr-2')} />
      ) : isFollowing ? (
        <>
          <Check className={cn('h-4 w-4', size !== 'sm' && 'mr-2')} />
          {size !== 'sm' && 'Following'}
        </>
      ) : (
        <>
          <Bell className={cn('h-4 w-4', size !== 'sm' && 'mr-2')} />
          {size !== 'sm' && 'Follow'}
        </>
      )}
      
      {showCount && followerCount > 0 && (
        <Badge 
          variant={isFollowing ? 'secondary' : 'outline'} 
          className={cn(
            'ml-2 text-xs',
            isFollowing && 'bg-blue-400/20 text-white border-blue-400/30'
          )}
        >
          {followerCount}
        </Badge>
      )}
    </Button>
  );
}

// Compact version for list views
export function FollowButtonCompact({ 
  report, 
  className 
}: { 
  report: Report; 
  className?: string;
}) {
  const { currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [canFollow, setCanFollow] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const state = getFollowButtonState(report.id, currentUser.id);
    setIsFollowing(state.isFollowing);
    setCanFollow(state.canFollow);
  }, [report.id, currentUser]);

  if (!currentUser || !canFollow) return null;

  return (
    <button
      onClick={() => {
        const result = toggleFollowReport(report.id, currentUser.id);
        if (result.success) {
          setIsFollowing(result.isNowFollowing || false);
        }
      }}
      className={cn(
        'p-1.5 rounded-full transition-colors',
        isFollowing 
          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700',
        className
      )}
      title={isFollowing ? 'Unfollow' : 'Follow for updates'}
    >
      {isFollowing ? (
        <Check className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
    </button>
  );
}
