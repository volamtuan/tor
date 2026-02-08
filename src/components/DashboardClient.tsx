
"use client"

import React, { useState, useEffect } from 'react';
import { StatHeader } from '@/components/StatHeader';
import { InstanceManager } from '@/components/InstanceManager';
import { ProxyTable } from '@/components/ProxyTable';
import { QuickTools } from '@/components/QuickTools';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

export type Instance = {
  port: number;
  status: 'LIVE' | 'DIE' | 'CHECKING';
  vpsIp: string;
  exitIp: string;
  ping: number;
  country: string;
  speed: number;
  ipv6: string;
};

export type SystemStats = {
  cpu: number;
  ram: number;
  torMem: number;
  instances: number;
};

export default function DashboardClient() {
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    ram: 0,
    torMem: 0,
    instances: 0,
  });
  
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    refreshStats();
    const statsInterval = setInterval(refreshStats, 3000);
    return () => clearInterval(statsInterval);
  }, [instances.length]);

  const refreshStats = () => {
    setStats({
      cpu: Math.floor(Math.random() * 25) + 5,
      ram: Math.floor(Math.random() * 40) + 30,
      torMem: Math.floor(Math.random() * 500) + 120,
      instances: instances.length,
    });
  };

  const handleDeploy = (count: number) => {
    setIsDeploying(true);
    toast({
      title: "Deploying Instances",
      description: `Starting ${count} new Tor proxy tunnel(s)...`,
    });

    setTimeout(() => {
      const vpsIpBase = "103.153.64.";
      const newInstances: Instance[] = Array.from({ length: count }).map((_, i) => {
        const port = 8000 + instances.length + i;
        return {
          port,
          status: 'LIVE',
          vpsIp: vpsIpBase + (Math.floor(Math.random() * 254) + 1),
          exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          ping: Math.floor(Math.random() * 300) + 50,
          country: ['United States', 'Germany', 'Japan', 'France', 'Singapore', 'Canada'][Math.floor(Math.random() * 6)],
          speed: parseFloat((Math.random() * 200 + 20).toFixed(2)),
          ipv6: `2403:6200:8837:92ae:${Math.random().toString(16).slice(2, 6)}:${Math.random().toString(16).slice(2, 6)}:1`
        };
      });
      setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
      setIsDeploying(false);
      toast({
        title: "Deployment Complete",
        description: `Successfully initialized ${count} instance(s).`,
      });
    }, 2000);
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Instance Removed", description: `Port :${port} deleted.` });
    } else if (act === 'restart') {
      setInstances(prev => prev.map(i => i.port === port ? { ...i, status: 'LIVE', ping: Math.floor(Math.random() * 100) + 50 } : i));
      toast({ title: "Instance Restarted", description: `Rebooting port :${port}...` });
    } else if (act === 'check') {
      setInstances(prev => prev.map(i => i.port === port ? { ...i, status: 'CHECKING' } : i));
      setTimeout(() => {
        setInstances(prev => prev.map(i => i.port === port ? { ...i, status: Math.random() > 0.1 ? 'LIVE' : 'DIE', ping: Math.floor(Math.random() * 200) + 40 } : i));
        toast({ title: "Check Complete", description: `Instance :${port} is verified.` });
      }, 1500);
    } else if (act === 'rotate') {
      setInstances(prev => prev.map(i => i.port === port ? { 
        ...i, 
        exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        ipv6: `2403:6200:8837:92ae:${Math.random().toString(16).slice(2, 6)}:${Math.random().toString(16).slice(2, 6)}:1`
      } : i));
      toast({ title: "IPv6 Rotated", description: `New identity assigned to :${port}` });
    }
  };

  const handleGlobalRotate = () => {
    setInstances(prev => prev.map(i => ({ 
      ...i, 
      exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      ipv6: `2403:6200:8837:92ae:${Math.random().toString(16).slice(2, 6)}:${Math.random().toString(16).slice(2, 6)}:1`
    })));
    toast({ title: "System-wide Rotation", description: "All instances have rotated IPv6 & Exit IPs." });
  };

  const handleCleanup = () => {
    setInstances([]);
    toast({ title: "System Wipe", description: "All instances stopped.", variant: "destructive" });
  };

  const handleExport = () => {
    const data = instances.map(i => `${i.vpsIp}:${i.port}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vps_proxies.txt';
    a.click();
    toast({ title: "Export Success", description: "VPS IP:Port list downloaded." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <StatHeader stats={stats} />
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
          <QuickTools onCleanup={handleCleanup} onExport={handleExport} onRotateAll={handleGlobalRotate} />
        </div>

        <div className="col-span-12 lg:col-span-9">
          <ProxyTable 
            instances={instances} 
            onAction={handleAction} 
            onRefresh={() => {
              toast({ title: "Refreshing Table", description: "Syncing status..." });
            }} 
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
