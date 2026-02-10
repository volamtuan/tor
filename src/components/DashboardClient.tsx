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
  const [isDeploying, setIsDeploying] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const savedIp = localStorage.getItem('tor_api_url');
    // Fallback to current host if no saved IP
    const defaultIp = savedIp || `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5757`;
    setApiUrl(defaultIp);
    
    // Initial stats after hydration to avoid mismatch
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

  const generateRandomAuth = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const user = "tor_" + Array.from({ length: 4 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const pass = Array.from({ length: 10 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    return { user, pass };
  };

  const handleDeploy = (config: DeployConfig) => {
    setIsDeploying(true);
    toast({
      title: "Đang triển khai",
      description: `Khởi tạo ${config.count} tunnel Tor mới với chế độ ${config.authMode}...`,
    });

    setTimeout(() => {
      const vpsIpBase = apiUrl.replace('http://', '').split(':')[0] || "127.0.0.1";
      const newInstances: Instance[] = Array.from({ length: config.count }).map((_, i) => {
        const port = 8000 + instances.length + i;
        const randomAuth = generateRandomAuth();
        const country = config.country === 'Random' 
          ? ['Vietnam', 'United States', 'Germany', 'Japan', 'France'][Math.floor(Math.random() * 5)] 
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
          username: config.authMode === 'USER_PASS' ? (config.username || randomAuth.user) : undefined,
          password: config.authMode === 'USER_PASS' ? (config.password || randomAuth.pass) : undefined,
          allowedIps: config.authMode === 'IP_WHITELIST' ? config.allowedIps : undefined,
        };
      });
      setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
      setIsDeploying(false);
      toast({ title: "Triển khai hoàn tất", description: `Đã kích hoạt ${config.count} instance thành công.` });
    }, 1500);
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Đã dừng", description: `Cổng :${port} đã được gỡ bỏ.` });
    } else if (act === 'restart') {
      setInstances(prev => prev.map(i => i.port === port ? { ...i, externalStatus: 'WAITING' } : i));
      toast({ title: "Đang khởi động lại", description: `Đang làm mới tiến trình Tor tại cổng :${port}...` });
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
                onExport={() => toast({ title: "Xuất dữ liệu", description: "Đã tải danh sách proxy (TXT/JSON)." })} 
                onRotateAll={() => toast({ title: "Xoay IP", description: "Đang yêu cầu IP mới cho tất cả các cổng..." })} 
                onCheckAll={() => toast({ title: "Kiểm tra", description: "Bắt đầu quét kết nối toàn hệ thống..." })}
              />
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
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
            toast({ title: "Đã cập nhật", description: "Địa chỉ API mới đã được lưu vào bộ nhớ." });
          }} />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
