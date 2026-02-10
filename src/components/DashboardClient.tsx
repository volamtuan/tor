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
  username?: string;
  password?: string;
  authEnabled: boolean;
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
  const [isDeploying, setIsDeploying] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const savedIp = localStorage.getItem('tor_api_url');
    const defaultIp = savedIp || `http://${window.location.hostname}:5757`;
    setApiUrl(defaultIp);
    
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

  const generateRandomAuth = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const user = "tor_" + Array.from({ length: 4 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const pass = Array.from({ length: 8 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    return { user, pass };
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
        const randomAuth = generateRandomAuth();
        const country = config.country === 'Random' 
          ? ['Vietnam', 'United States', 'Germany', 'Japan'][Math.floor(Math.random() * 4)] 
          : config.country;

        return {
          port,
          status: 'LIVE',
          externalStatus: 'WAITING',
          vpsIp: vpsIpBase,
          exitIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x`,
          ping: Math.floor(Math.random() * 300) + 50,
          country,
          speed: parseFloat((Math.random() * 100 + 10).toFixed(2)),
          ipv6: `2403:6200:${Math.random().toString(16).slice(2, 6)}::1`,
          username: config.authEnabled ? (config.username || randomAuth.user) : undefined,
          password: config.authEnabled ? (config.password || randomAuth.pass) : undefined,
          authEnabled: config.authEnabled
        };
      });
      setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
      setIsDeploying(false);
      toast({ title: "Triển khai hoàn tất", description: `Đã kích hoạt ${config.count} instance.` });
    }, 1500);
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Đã xóa", description: `Cổng :${port} đã dừng.` });
    } else if (act === 'restart') {
      setInstances(prev => prev.map(i => i.port === port ? { ...i, externalStatus: 'WAITING' } : i));
      toast({ title: "Đang khởi động lại", description: `Đang làm mới tiến trình tại cổng :${port}...` });
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
            <Terminal className="w-4 h-4" /> NHẬT KÝ HỆ THỐNG
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary gap-2 px-6">
            <SettingsIcon className="w-4 h-4" /> CÀI ĐẶT & HỆ THỐNG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={() => setInstances([])} 
                onExport={() => toast({ title: "Xuất dữ liệu", description: "Đã tải danh sách proxy." })} 
                onRotateAll={() => toast({ title: "Xoay IP", description: "Đang yêu cầu IP mới cho tất cả..." })} 
                onCheckAll={() => toast({ title: "Kiểm tra", description: "Bắt đầu quét kết nối..." })}
              />
            </div>
            <div className="col-span-12 lg:col-span-9">
              <ProxyTable instances={instances} onAction={handleAction} onRefresh={() => {}} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-2">
          <LogViewer />
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-2">
          <SystemSettings apiUrl={apiUrl} onUpdateApiUrl={(url) => {
            setApiUrl(url);
            localStorage.setItem('tor_api_url', url);
            toast({ title: "Đã cập nhật", description: "Địa chỉ API mới đã được lưu." });
          }} />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
