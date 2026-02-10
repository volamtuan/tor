"use client"

import React from 'react';
import { Cpu, Server, Play, RotateCw, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatHeaderProps {
  stats: {
    cpu: number;
    ram: number;
    torMem: number;
    instances: number;
    torStatus: string;
  };
  onAction: (action: string) => void;
}

export function StatHeader({ stats, onAction }: StatHeaderProps) {
  const isActive = stats.torStatus === 'active' || stats.torStatus === 'LIVE';

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white italic">
          TOR<span className="text-primary">MASTER</span> PRO
        </h1>
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full animate-pulse ${isActive ? 'bg-accent' : 'bg-destructive'}`} />
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            Hệ Thống: 
            <Badge variant={isActive ? "default" : "destructive"} className="text-[10px] py-0 px-2 h-5">
              {stats.torStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-1 ml-4">
            <Button size="icon" variant="ghost" title="Start System" className="h-7 w-7 text-emerald-400 hover:bg-emerald-400/10" onClick={() => onAction('start')}>
              <Play className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" title="Restart System" className="h-7 w-7 text-amber-400 hover:bg-amber-400/10" onClick={() => onAction('restart')}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" title="Stop System" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => onAction('stop')}>
              <Power className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full md:w-auto">
        <StatCard 
          label="CPU / RAM" 
          value={`${stats.cpu}% / ${stats.ram}%`} 
          icon={<Cpu className="w-4 h-4 text-primary" />}
          className="status-glow-emerald"
        />
        <StatCard 
          label="Proxy Đang Chạy" 
          value={`${stats.instances} Tunnel`} 
          subValue={`(${stats.torMem}MB RAM)`}
          icon={<Server className="w-4 h-4 text-accent" />}
          className="border-l-4 border-accent"
        />
      </div>
    </header>
  );
}

function StatCard({ label, value, subValue, icon, className }: { label: string; value: string; subValue?: string; icon: React.ReactNode; className?: string }) {
  return (
    <Card className={`glass-card px-6 py-4 min-w-[180px] flex flex-col items-center justify-center transition-all hover:scale-105 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{label}</div>
      </div>
      <div className="text-2xl font-mono font-bold text-white leading-none">{value}</div>
      {subValue && <div className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">{subValue}</div>}
    </Card>
  );
}