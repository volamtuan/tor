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
import { LayoutDashboard, Terminal, Settings as SettingsIcon } from 'lucide-react';

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
    const savedIp = localStorage.getItem('tor_api_url');
    const defaultIp = savedIp || `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5757`;
    setApiUrl(defaultIp);
    
    setStats({
      cpu: Math.floor(Math.random() * 15) + 5,
      ram: Math.floor(Math.random() * 20) + 30,
      torMem: 0,
      instances: 0,
    });

    const statsInterval = setInterval(refreshStats, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  const refreshStats = () => {
    setStats(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 20) + 5,
      ram: Math.floor(Math.random() * 25) + 30,
      torMem: instances.length * 12,
      instances: instances.length,
    }));
  };

  const handleBlockIp = (ip: string) => {
    if (!blockedIps.includes(ip)) {
      setBlockedIps(prev => [...prev, ip]);
      toast({
        title: "Đã chặn IP",
        description: `Địa chỉ ${ip} đã được thêm vào danh sách đen.`,
        variant: "destructive"
      });
    }
  };

  const handleUnblockIp = (ip: string) => {
    setBlockedIps(prev => prev.filter(item => item !== ip));
    toast({
      title: "Đã bỏ chặn",
      description: `Địa chỉ ${ip} đã có thể truy cập lại.`,
    });
  };

  const handleDeploy = (config: DeployConfig) => {
    setIsDeploying(true);
    toast({
      title: "Đang triển khai",
      description: `Khởi tạo ${config.count} tunnel Tor mới...`,
    });

    setTimeout(() => {
      const vpsIpBase = apiUrl.replace('http://', '').split(':')[0] || "127.0.0.1";
      const newInstances: Instance[] = Array.from({ length: config.count }).map((_, i) => {
        const port = 8000 + instances.length + i;
        const country = config.country === 'Random' 
          ? ['Vietnam', 'United States', 'Germany', 'Japan', 'France'][Math.floor(Math.random() * 5)] 
          : config.country;

        return {
          port,
          status: 'LIVE',
          externalStatus: 'READY',
          vpsIp: vpsIpBase,
          exitIp: `${Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 220)}.x.x`,
          ping: Math.floor(Math.random() * 250) + 50,
          country,
          speed: parseFloat((Math.random() * 80 + 20).toFixed(2)),
          ipv6: `2403:6200:${Math.random().toString(16).slice(2, 6)}::${i+1}`,
          authMode: config.authMode,
          username: config.username || `user_${port}`,
          password: config.password || `pass_${port}`,
          allowedIps: config.allowedIps,
        };
      });
      setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
      setIsDeploying(false);
      toast({ title: "Triển khai hoàn tất", description: `Đã kích hoạt thành công.` });
    }, 1500);
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Đã xóa", description: `Cổng :${port} đã được giải phóng.` });
    } else if (act === 'kill') {
      toast({ 
        title: "Ngắt kết nối", 
        description: `Đã đóng toàn bộ phiên kết nối đang hoạt động tại cổng :${port}.`,
        variant: "destructive"
      });
    } else if (act === 'restart') {
      toast({ title: "Khởi động lại", description: `Đang làm mới tiến trình Tor tại cổng :${port}...` });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <StatHeader stats={stats} />
      
      <Tabs defaultValue="dashboard" className="w-full space-y-6">
        <TabsList className="bg-card/50 border border-border p-1 h-12">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary gap-2 px-6">
            <LayoutDashboard className="w-4 h-4" /> BẢNG ĐIỀU KHIỂN
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary gap-2 px-6">
            <Terminal className="w-4 h-4" /> NHẬT KÝ & TRUY CẬP
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary gap-2 px-6">
            <SettingsIcon className="w-4 h-4" /> CÀI ĐẶT HỆ THỐNG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={() => setInstances([])} 
                onExport={() => {}} 
                onRotateAll={() => {}} 
                onCheckAll={() => {}}
              />
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <ProxyTable instances={instances} onAction={handleAction} onRefresh={() => {}} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-2">
          <LogViewer onBlockIp={handleBlockIp} />
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-2">
          <SystemSettings 
            apiUrl={apiUrl} 
            onUpdateApiUrl={(url) => {
              setApiUrl(url);
              localStorage.setItem('tor_api_url', url);
            }} 
            blockedIps={blockedIps}
            onUnblockIp={handleUnblockIp}
          />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
