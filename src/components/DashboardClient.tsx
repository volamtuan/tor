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
    
    const savedIp = localStorage.getItem('tor_api_url');
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
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
      cpu: Math.floor(Math.random() * 10) + 2,
      ram: Math.floor(Math.random() * 15) + 25,
      torMem: 0,
      instances: 0,
    });

    const statsInterval = setInterval(refreshStats, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tor_instances', JSON.stringify(instances));
      setStats(prev => ({
        ...prev,
        instances: instances.length,
        torMem: instances.length * 12.5
      }));
    }
  }, [instances, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tor_blocked_ips', JSON.stringify(blockedIps));
    }
  }, [blockedIps, isMounted]);

  const refreshStats = () => {
    setStats(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 15) + 2,
      ram: Math.floor(Math.random() * 20) + 25,
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
        const nextPort = instances.length > 0 
          ? Math.max(...instances.map(inst => inst.port)) + 1 
          : 8000;
        
        const port = nextPort + i;
        const country = config.country === 'Random' 
          ? ['Vietnam', 'United States', 'Germany', 'Japan', 'France', 'Singapore'][Math.floor(Math.random() * 6)] 
          : config.country;

        return {
          port,
          status: 'LIVE',
          externalStatus: 'WAITING',
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
    } else if (act === 'check') {
      setInstances(prev => prev.map(inst => inst.port === port ? { ...inst, externalStatus: 'TESTING' } : inst));
      toast({ title: "Đang kiểm tra", description: `Đang quét IP thoát (Exit IP) cho cổng :${port}...` });
      
      setTimeout(() => {
        setInstances(prev => prev.map(inst => inst.port === port ? { 
          ...inst, 
          externalStatus: Math.random() > 0.1 ? 'READY' : 'FAILED',
          exitIp: `${Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 220)}.x.x`
        } : inst));
        toast({ title: "Kiểm tra xong", description: `Cổng :${port} đã cập nhật trạng thái.` });
      }, 2000);
    }
  };

  const handleCheckAll = () => {
    if (instances.length === 0) return;
    
    toast({ title: "Kiểm tra tổng quát", description: "Đang quét toàn bộ danh sách Proxy..." });
    setInstances(prev => prev.map(inst => ({ ...inst, externalStatus: 'TESTING' })));
    
    setTimeout(() => {
      setInstances(prev => prev.map(inst => ({ 
        ...inst, 
        externalStatus: Math.random() > 0.05 ? 'READY' : 'FAILED',
        exitIp: `${Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 220)}.x.x`
      })));
      toast({ title: "Hoàn tất", description: "Đã cập nhật IP và trạng thái kết nối cho toàn bộ cổng." });
    }, 3000);
  };

  const handleCleanup = () => {
    setInstances([]);
    toast({ title: "Đã dọn dẹp", description: "Xóa toàn bộ Proxy và làm sạch dữ liệu tạm." });
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
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data={state=active]:text-white gap-2 px-6 rounded-lg font-bold transition-all text-xs">
            <SettingsIcon className="w-3.5 h-3.5" /> HỆ THỐNG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={handleCleanup} 
                onExport={() => {
                  const data = JSON.stringify(instances, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tor-proxies-${new Date().toISOString().slice(0,10)}.json`;
                  a.click();
                }} 
                onRotateAll={handleCheckAll} 
                onCheckAll={handleCheckAll}
              />
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <ProxyTable 
                instances={instances} 
                onAction={handleAction} 
                onRefresh={() => handleCheckAll()} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in duration-300">
          <LogViewer onBlockIp={handleBlockIp} />
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in duration-300">
          <SystemSettings 
            apiUrl={apiUrl} 
            onUpdateApiUrl={(url) => {
              setApiUrl(url);
              localStorage.setItem('tor_api_url', url);
              toast({ title: "Cập nhật thành công", description: "Địa chỉ Backend đã được lưu." });
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
