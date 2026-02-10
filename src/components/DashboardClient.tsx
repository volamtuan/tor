
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
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const defaultApi = `http://${currentHost}:5757`;
    setApiUrl(savedIp || defaultApi);
    
    // Initial fetch from backend
    fetchInstances(savedIp || defaultApi);

    const statsInterval = setInterval(refreshStats, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  const fetchInstances = async (url: string) => {
    try {
      const res = await fetch(`${url}/instances`);
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend model
        const mapped = data.map((item: any) => ({
          port: item.port,
          status: item.status,
          externalStatus: 'READY',
          vpsIp: url.split('://')[1]?.split(':')[0] || 'localhost',
          exitIp: 'Checking...',
          ping: 100,
          country: item.country,
          speed: 50,
          ipv6: '::1',
          authMode: item.authMode
        }));
        setInstances(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch instances", e);
    }
  };

  const refreshStats = () => {
    setStats(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 10) + 2,
      ram: Math.floor(Math.random() * 15) + 25,
      instances: instances.length,
      torMem: instances.length * 12.5
    }));
  };

  const handleDeploy = async (config: DeployConfig) => {
    setIsDeploying(true);
    toast({ title: "Đang triển khai", description: `Khởi tạo ${config.count} tunnel Tor mới...` });

    try {
      const res = await fetch(`${apiUrl}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        await fetchInstances(apiUrl);
        toast({ title: "Triển khai hoàn tất", description: `Đã kích hoạt thành công.` });
      } else {
        throw new Error("Deploy failed");
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể kết nối tới backend.", variant: "destructive" });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAction = async (act: string, port: number) => {
    try {
      const res = await fetch(`${apiUrl}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, port })
      });
      
      if (res.ok) {
        if (act === 'delete') {
          setInstances(prev => prev.filter(i => i.port !== port));
          toast({ title: "Đã xóa", description: `Cổng :${port} đã được giải phóng.` });
        } else if (act === 'rotate') {
          toast({ title: "Thành công", description: `Đã đổi IP mới cho cổng :${port}.` });
        }
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Hành động thất bại.", variant: "destructive" });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-full mx-auto pb-10 px-1">
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

        <TabsContent value="dashboard" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={() => setInstances([])} 
                onExport={() => {}} 
                onRotateAll={() => {}} 
                onCheckAll={() => fetchInstances(apiUrl)}
              />
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <ProxyTable 
                instances={instances} 
                onAction={handleAction} 
                onRefresh={() => fetchInstances(apiUrl)} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in duration-300">
          <LogViewer onBlockIp={(ip) => setBlockedIps([...blockedIps, ip])} />
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in duration-300">
          <SystemSettings 
            apiUrl={apiUrl} 
            onUpdateApiUrl={(url) => {
              setApiUrl(url);
              localStorage.setItem('tor_api_url', url);
              fetchInstances(url);
              toast({ title: "Cập nhật thành công", description: "Địa chỉ Backend đã được lưu." });
            }} 
            blockedIps={blockedIps}
            onUnblockIp={(ip) => setBlockedIps(blockedIps.filter(i => i !== ip))}
          />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
