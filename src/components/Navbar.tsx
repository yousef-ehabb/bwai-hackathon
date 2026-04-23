'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-[80px] bg-white transition-all z-50 px-6 sm:px-12">
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-primary tracking-tight">
            UrbanFix
          </span>
        </Link>

        {/* Auth Links */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Link
                href={`/${currentUser.role}/dashboard`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "font-display")}
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "font-display")}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "font-display hidden sm:inline-flex")}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: 'default', size: 'sm' }), "font-display bg-brand-blue border-brand-blue text-white")}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
