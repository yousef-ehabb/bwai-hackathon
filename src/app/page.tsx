'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, Zap, Globe, ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const features = [
  {
    title: 'Stadium-scale speed.',
    description: 'Reports reached our system in milliseconds, dispatching help instantly.',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop',
    color: 'bg-brand-blue'
  },
  {
    title: 'Zero shadow results.',
    description: 'Transparent city management with real-time resolution tracking.',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop',
    color: 'bg-emerald-500'
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-blue selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-24 sm:pt-48 sm:pb-40 text-center flex flex-col items-center">
        <div className="max-w-[1240px] mx-auto">
          {/* Billboard Heading */}
          <h1 className="text-display-mega font-display text-primary leading-tight mb-12 tracking-[-0.04em] animate-in fade-in slide-in-from-bottom-8 duration-700 font-medium">
            Fix your city.<br className="hidden sm:block" />
            At stadium scale.
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-[800px] mx-auto mb-16 leading-relaxed font-body tracking-[0.24px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            UrbanFix is the city operations system for the modern age. 
            Real-time reporting, automated dispatching, and radical transparency.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: 'default', size: 'lg' }),
                'w-full sm:w-auto bg-primary text-white border-primary shadow-none md:min-w-[200px]'
              )}
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full sm:w-auto border-primary text-primary hover:bg-primary/5 md:min-w-[200px]'
              )}
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase Section - Alternating Sections */}
      <section className="bg-surface py-24 sm:py-40 px-6 overflow-hidden">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <Badge className="bg-brand-blue text-white rounded-full px-4 py-1.5 mb-8 border-none font-display">Fast Dispatch</Badge>
            <h2 className="text-display-hero text-primary mb-8 tracking-[-0.02em] font-medium leading-[1.1]">
              Reporting at the speed of thought.
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              We've redesigned the reporting workflow from the ground up. 
              No forms, no friction. Just instant city improvement powered by real-time data.
            </p>
            <Link href="/register" className="flex items-center gap-2 font-display text-lg font-bold text-brand-blue group">
              See how it works <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-[40px] overflow-hidden bg-white border border-border aspect-square sm:aspect-video lg:aspect-square group transition-all duration-700 hover:border-brand-blue/30">
               <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" 
                 alt="Dashboard" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-24 sm:py-40 px-6">
        <div className="max-w-[1240px] mx-auto text-center mb-24">
          <h2 className="text-display-hero text-primary tracking-tight font-medium">Built for everyone.</h2>
        </div>
        
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group relative rounded-[40px] overflow-hidden bg-surface p-12 h-[600px] flex flex-col justify-between transition-all hover:bg-[#ebebeb]">
                <div className="relative z-10">
                   <h3 className="text-4xl sm:text-5xl font-display font-medium text-primary mb-6 tracking-tight">
                     {feature.title}
                   </h3>
                   <p className="text-lg text-muted-foreground max-w-sm mb-8 leading-relaxed">
                     {feature.description}
                   </p>
                   <Link href="#" className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary text-primary transition-all group-hover:bg-primary group-hover:text-white">
                     <ArrowUpRight className="h-6 w-6" />
                   </Link>
                </div>
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                   <img src={feature.image} alt={feature.title} className="w-full h-full object-cover mix-blend-overlay grayscale opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
             </div>
             <span className="font-display font-bold text-xl">UrbanFix</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground font-body">
             <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
             <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            © 2026 IEEE Aswan. Billboard scale city ops.
          </p>
        </div>
      </footer>
    </div>
  );
}
