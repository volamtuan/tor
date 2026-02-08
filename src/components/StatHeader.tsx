
"use client"

import React from 'react';
import { Cpu, Server, Activity, Power, RotateCw, Play } from 'lucide-react';
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
  const isActive = stats.torStatus === 'active';

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white italic">
          TOR<span className="text-primary">MASTER</span> PRO
        </h1>
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full animate-pulse ${isActive ? 'bg-accent' : 'bg-destructive'}`} />
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Hệ Thống: <Badge variant={isActive ? "default" : "destructive"} className="text-[10px] py-0">{stats.torStatus.toUpperCase()}</Badge>
          </p>
          <div className="flex gap-1 ml-4">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400 hover:bg-emerald-400/10" onClick={() => onAction('start')}>
              <Play className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-amber-400 hover:bg-amber-400/10" onClick={() => onAction('restart')}>
              <RotateCw className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => onAction('stop')}>
              <Power className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 w-full md:w-auto">
        <StatCard 
          label="CPU / RAM" 
          value={`${stats.cpu}% / ${stats.ram}%`} 
          icon={<Cpu className="w-4 h-4 text-primary" />}
          className="status-glow-indigo"
        />
        <StatCard 
          label="Cổng Tor" 
          value={`${stats.instances} Đang chạy`} 
          subValue={`(${stats.torMem}MB Bộ nhớ)`}
          icon={<Server className="w-4 h-4 text-accent" />}
          className="border-l-4 border-accent"
        />
      </div>
    </header>
  );
}

function StatCard({ label, value, subValue, icon, className }: { label: string; value: string; subValue?: string; icon: React.ReactNode; className?: string }) {
  return (
    <Card className={`glass-card px-6 py-4 min-w-[160px] flex flex-col items-center justify-center transition-all hover:scale-105 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-mono font-bold text-white leading-none">{value}</p>
      {subValue && <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">{subValue}</p>}
    </Card>
  );
}
