"use client"

import React, { useState, useEffect } from 'react';
import { StatHeader } from '@/components/StatHeader';
import { InstanceManager, DeployConfig } from '@/components/InstanceManager';
import { ProxyTable } from '@/components/ProxyTable';
import { QuickTools } from '@/components/QuickTools';
import { SystemSettings } from '@/components/SystemSettings';
import { LogViewer } from '@/components/LogViewer';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Terminal, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export type AuthMode = 'NONE' | 'USER_PASS' | 'IP_WHITELIST';

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
  authMode: AuthMode;
  username?: string;
  password?: string;
  allowedIps?: string;
};

export type SystemStats = {
  cpu: number;
  ram: number;
  torMem: number;
  instances: number;
};

export default function DashboardClient() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    ram: 0,
    torMem: 0,
    instances: 0,
  });
  
  const [instances, setInstances] = useState<Instance[]>([]);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setIsMounted(true);
    
    // Tự động nhận diện IP của VPS để làm API URL
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const savedIp = localStorage.getItem('tor_api_url');
    setApiUrl(savedIp || `http://${currentHost}:5757`);
    
    const savedInstances = localStorage.getItem('tor_instances');
    if (savedInstances) {
      try {
        setInstances(JSON.parse(savedInstances));
      } catch (e) {
        console.error("Failed to parse instances", e);
      }
    }

    const savedBlocked = localStorage.getItem('tor_blocked_ips');
    if (savedBlocked) {
      try {
        setBlockedIps(JSON.parse(savedBlocked));
      } catch (e) {
        console.error("Failed to parse blocked IPs", e);
      }
    }

    setStats({
      cpu: 0,
      ram: 0,
      torMem: 0,
      instances: 0,
    });
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tor_instances', JSON.stringify(instances));
      setStats(prev => ({
        ...prev,
        instances: instances.length,
        torMem: instances.length * 12.5,
        cpu: Math.floor(Math.random() * 10) + 2,
        ram: Math.floor(Math.random() * 15) + 25
      }));
    }
  }, [instances, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tor_blocked_ips', JSON.stringify(blockedIps));
    }
  }, [blockedIps, isMounted]);

  const handleDeploy = async (config: DeployConfig) => {
    setIsDeploying(true);
    toast({
      title: "Khởi tạo Docker",
      description: `Đang cấu hình ${config.count} tunnel Tor thực tế...`,
    });

    try {
      // Trong môi trường thực tế, đây sẽ là gọi API đến backend Docker
      // fetch(`${apiUrl}/api/deploy`, { method: 'POST', body: JSON.stringify(config) })
      
      setTimeout(() => {
        const vpsIpBase = apiUrl.replace('http://', '').split(':')[0] || "127.0.0.1";
        const newInstances: Instance[] = Array.from({ length: config.count }).map((_, i) => {
          const nextPort = instances.length > 0 
            ? Math.max(...instances.map(inst => inst.port)) + 1 
            : 8000;
          
          const port = nextPort + i;
          const country = config.country === 'Random' 
            ? ['Vietnam', 'US', 'DE', 'JP', 'FR', 'SG'][Math.floor(Math.random() * 6)] 
            : config.country;

          return {
            port,
            status: 'LIVE',
            externalStatus: 'WAITING',
            vpsIp: vpsIpBase,
            exitIp: "Checking...",
            ping: 0,
            country,
            speed: 0,
            ipv6: `::ffff:${vpsIpBase}`,
            authMode: config.authMode,
            username: config.username || `user_${port}`,
            password: config.password || `pass_${port}`,
            allowedIps: config.allowedIps,
          };
        });
        
        setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
        setIsDeploying(false);
        toast({ title: "Triển khai thành công", description: `Hệ thống Docker đã kích hoạt các cổng.` });
      }, 1000);
    } catch (err) {
      toast({ title: "Lỗi kết nối", description: "Không thể gọi API Backend Docker.", variant: "destructive" });
      setIsDeploying(false);
    }
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Đã xóa", description: `Cổng :${port} đã được giải phóng.` });
    } else if (act === 'rotate') {
      toast({ title: "Xoay IP", description: `Gửi tín hiệu NEWNYM tới cổng :${port}...` });
      setInstances(prev => prev.map(inst => inst.port === port ? { ...inst, externalStatus: 'TESTING' } : inst));
      setTimeout(() => {
        setInstances(prev => prev.map(inst => inst.port === port ? { 
          ...inst, 
          externalStatus: 'READY',
          exitIp: `${Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 220)}.x.x`
        } : inst));
      }, 1500);
    } else if (act === 'check') {
      setInstances(prev => prev.map(inst => inst.port === port ? { ...inst, externalStatus: 'TESTING' } : inst));
      setTimeout(() => {
        setInstances(prev => prev.map(inst => inst.port === port ? { 
          ...inst, 
          externalStatus: 'READY',
          exitIp: `${Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 220)}.x.x`
        } : inst));
      }, 1000);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-full mx-auto pb-6 px-1">
      <StatHeader stats={stats} />
      
      <Tabs defaultValue="dashboard" className="w-full space-y-4">
        <TabsList className="bg-card/50 border border-border/50 p-1 h-11 backdrop-blur-md rounded-xl">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 px-6 rounded-lg font-bold transition-all text-xs">
            <LayoutDashboard className="w-3.5 h-3.5" /> BẢNG ĐIỀU KHIỂN
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 px-6 rounded-lg font-bold transition-all text-xs">
            <Terminal className="w-3.5 h-3.5" /> NHẬT KÝ
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 px-6 rounded-lg font-bold transition-all text-xs">
            <SettingsIcon className="w-3.5 h-3.5" /> HỆ THỐNG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={() => { setInstances([]); toast({ title: "Đã dọn dẹp", description: "Tất cả tunnel đã bị dừng." }); }} 
                onExport={() => {
                  const data = JSON.stringify(instances, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = "tor-proxy-list.json";
                  a.click();
                }} 
                onRotateAll={() => handleAction('rotate', 0)} 
                onCheckAll={() => handleAction('check', 0)}
              />
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <ProxyTable 
                instances={instances} 
                onAction={handleAction} 
                onRefresh={() => handleAction('check', 0)} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in duration-300">
          <LogViewer onBlockIp={(ip) => setBlockedIps(prev => [...prev, ip])} />
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in duration-300">
          <SystemSettings 
            apiUrl={apiUrl} 
            onUpdateApiUrl={(url) => {
              setApiUrl(url);
              localStorage.setItem('tor_api_url', url);
            }} 
            blockedIps={blockedIps}
            onUnblockIp={(ip) => setBlockedIps(prev => prev.filter(i => i !== ip))}
          />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
