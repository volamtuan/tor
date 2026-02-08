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
  externalStatus: 'READY' | 'FAILED' | 'TESTING' | 'WAITING';
  vpsIp: string;
  exitIp: string;
  ping: number;
  country: string;
  speed: number;
  ipv6: string;
  username: string;
  password: string;
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

  const generateAuth = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const user = "tor_" + Array.from({ length: 4 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const pass = Array.from({ length: 8 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    return { user, pass };
  };

  const handleDeploy = (count: number) => {
    setIsDeploying(true);
    toast({
      title: "Deploying Instances",
      description: `Starting ${count} new Tor proxy tunnel(s) with custom auth...`,
    });

    setTimeout(() => {
      const vpsIpBase = "103.153.64.";
      const newInstances: Instance[] = Array.from({ length: count }).map((_, i) => {
        const port = 8000 + instances.length + i;
        const { user, pass } = generateAuth();
        return {
          port,
          status: 'LIVE',
          externalStatus: 'WAITING',
          vpsIp: vpsIpBase + (Math.floor(Math.random() * 254) + 1),
          exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          ping: Math.floor(Math.random() * 300) + 50,
          country: ['United States', 'Germany', 'Japan', 'France', 'Singapore', 'Canada'][Math.floor(Math.random() * 6)],
          speed: parseFloat((Math.random() * 200 + 20).toFixed(2)),
          ipv6: `2403:6200:8837:92ae:${Math.random().toString(16).slice(2, 6)}:${Math.random().toString(16).slice(2, 6)}:1`,
          username: user,
          password: pass
        };
      });
      setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
      setIsDeploying(false);
      toast({
        title: "Deployment Complete",
        description: `Successfully initialized ${count} instance(s) with secure credentials.`,
      });
    }, 2000);
  };

  const checkConnectivity = (port: number) => {
    setInstances(prev => prev.map(i => i.port === port ? { ...i, externalStatus: 'TESTING' } : i));
    
    // Simulate external probe to google.com via proxy
    setTimeout(() => {
      const isSuccess = Math.random() > 0.15;
      setInstances(prev => prev.map(i => i.port === port ? { 
        ...i, 
        externalStatus: isSuccess ? 'READY' : 'FAILED',
        status: isSuccess ? 'LIVE' : 'DIE'
      } : i));
      
      if (isSuccess) {
        toast({ title: "External Access OK", description: `Port :${port} is reachable from outside.` });
      } else {
        toast({ title: "Probe Failed", description: `Port :${port} failed external connectivity check.`, variant: "destructive" });
      }
    }, 2000);
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Instance Removed", description: `Port :${port} deleted.` });
    } else if (act === 'restart') {
      setInstances(prev => prev.map(i => i.port === port ? { ...i, status: 'LIVE', externalStatus: 'WAITING', ping: Math.floor(Math.random() * 100) + 50 } : i));
      toast({ title: "Instance Restarted", description: `Rebooting port :${port}...` });
    } else if (act === 'check') {
      checkConnectivity(port);
    } else if (act === 'rotate') {
      const { user, pass } = generateAuth();
      setInstances(prev => prev.map(i => i.port === port ? { 
        ...i, 
        exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        ipv6: `2403:6200:8837:92ae:${Math.random().toString(16).slice(2, 6)}:${Math.random().toString(16).slice(2, 6)}:1`,
        username: user,
        password: pass
      } : i));
      toast({ title: "Credentials Rotated", description: `New IP and Auth assigned to :${port}` });
    }
  };

  const handleGlobalRotate = () => {
    setInstances(prev => prev.map(i => {
      const { user, pass } = generateAuth();
      return { 
        ...i, 
        exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        ipv6: `2403:6200:8837:92ae:${Math.random().toString(16).slice(2, 6)}:${Math.random().toString(16).slice(2, 6)}:1`,
        username: user,
        password: pass
      };
    }));
    toast({ title: "Full System Rotation", description: "All instances rotated IPs & Auth keys." });
  };

  const handleGlobalCheck = () => {
    toast({ title: "Global Probe Started", description: "Testing all active tunnels..." });
    instances.forEach(i => checkConnectivity(i.port));
  };

  const handleCleanup = () => {
    setInstances([]);
    toast({ title: "System Wipe", description: "All instances stopped.", variant: "destructive" });
  };

  const handleExport = () => {
    const data = instances.map(i => `${i.vpsIp}:${i.port}:${i.username}:${i.password}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tor_proxies_auth.txt';
    a.click();
    toast({ title: "Export Success", description: "VPS List with credentials downloaded." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <StatHeader stats={stats} />
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
          <QuickTools 
            onCleanup={handleCleanup} 
            onExport={handleExport} 
            onRotateAll={handleGlobalRotate} 
            onCheckAll={handleGlobalCheck}
          />
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
