
"use client"

import React, { useState, useEffect } from 'react';
import { Cpu, Server, Activity, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatHeaderProps {
  stats: {
    cpu: number;
    ram: number;
    torMem: number;
    instances: number;
  };
}

export function StatHeader({ stats }: StatHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-2">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic">
            TOR<span className="text-primary">MASTER</span> <span className="text-muted-foreground/50 not-italic font-light">PRO</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          <div className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            HỆ THỐNG: <span className="text-accent">ONLINE & SECURE</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full md:w-auto">
        <StatCard 
          label="TÀI NGUYÊN SERVER" 
          value={mounted ? `${stats.cpu}% / ${stats.ram}%` : "--% / --%"} 
          subValue="CPU / RAM Usage"
          icon={<Cpu className="w-4 h-4 text-primary" />}
          className="border-l-4 border-primary"
        />
        <StatCard 
          label="QUẢN LÝ TUNNEL" 
          value={mounted ? `${stats.instances} CỔNG` : "-- CỔNG"} 
          subValue={`${stats.torMem.toFixed(1)} MB MEMORY`}
          icon={<Server className="w-4 h-4 text-accent" />}
          className="border-l-4 border-accent"
        />
      </div>
    </header>
  );
}

function StatCard({ 
  label, 
  value, 
  subValue, 
  icon, 
  className 
}: { 
  label: string; 
  value: string; 
  subValue?: string; 
  icon: React.ReactNode; 
  className?: string 
}) {
  return (
    <Card className={`glass-card px-8 py-5 min-w-[200px] flex flex-col items-center justify-center transition-all hover:scale-105 hover:bg-white/5 border-border/40 rounded-2xl ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{label}</p>
      </div>
      <div className="text-2xl font-mono font-black text-white leading-none tracking-tight">{value}</div>
      {subValue && <p className="text-[9px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tighter">{subValue}</p>}
    </Card>
  );
}
