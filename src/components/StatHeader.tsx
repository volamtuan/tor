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
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-1">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white italic uppercase">
            Tor<span className="text-primary">Proxy</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-1">
            HỆ THỐNG: <span className="text-accent">ONLINE & SECURE</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <StatCard 
          label="TÀI NGUYÊN SERVER" 
          value={mounted ? `${stats.cpu}% / ${stats.ram}%` : "--% / --%"} 
          subValue="CPU / RAM Usage"
          icon={<Cpu className="w-3.5 h-3.5 text-primary" />}
          className="border-l-4 border-primary"
        />
        <StatCard 
          label="QUẢN LÝ TUNNEL" 
          value={mounted ? `${stats.instances} CỔNG` : "-- CỔNG"} 
          subValue={`${stats.torMem.toFixed(1)} MB MEMORY`}
          icon={<Server className="w-3.5 h-3.5 text-accent" />}
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
    <Card className={`glass-card px-4 py-3 min-w-[160px] flex flex-col items-center justify-center transition-all hover:scale-105 hover:bg-white/5 border-border/40 rounded-xl ${className}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">{label}</p>
      </div>
      <div className="text-lg font-mono font-black text-white leading-none tracking-tight">{value}</div>
      {subValue && <p className="text-[8px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tighter">{subValue}</p>}
    </Card>
  );
}
