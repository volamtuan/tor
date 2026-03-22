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
    
    // Ưu tiên dùng LocalStorage để lưu trạng thái giữa các lần thoát
    const savedInstances = localStorage.getItem('tor_instances');
    const savedBlockedIps = localStorage.getItem('tor_blocked_ips');
    const savedApiUrl = localStorage.getItem('tor_api_url');
    
    if (savedInstances) setInstances(JSON.parse(savedInstances));
    if (savedBlockedIps) setBlockedIps(JSON.parse(savedBlockedIps));
    
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    // Backend chạy trên cổng 2000
    const defaultApi = `http://${currentHost}:2000`;
    const finalApi = savedApiUrl || defaultApi;
    setApiUrl(finalApi);
    
    fetchInstances(finalApi);

    const statsInterval = setInterval(refreshStats, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  // Tự động lưu khi có thay đổi
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tor_instances', JSON.stringify(instances));
      localStorage.setItem('tor_blocked_ips', JSON.stringify(blockedIps));
    }
  }, [instances, blockedIps, isMounted]);

  const fetchInstances = async (url: string) => {
    try {
      const res = await fetch(`${url}/instances`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          port: item.port,
          status: item.status,
          externalStatus: 'READY',
          vpsIp: url.split('://')[1]?.split(':')[0] || 'localhost',
          exitIp: 'Đang quét...',
          ping: 100,
          country: item.country,
          speed: 50,
          ipv6: '::1',
          authMode: item.authMode
        }));
        // Sắp xếp theo cổng
        setInstances(mapped.sort((a: Instance, b: Instance) => a.port - b.port));
      }
    } catch (e) {
      console.error("Lỗi kết nối Backend", e);
    }
  };

  const refreshStats = () => {
    setStats(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 15) + 5,
      ram: Math.floor(Math.random() * 20) + 30,
      instances: instances.length,
      torMem: instances.length * 15.2
    }));
  };

  const handleDeploy = async (config: DeployConfig) => {
    setIsDeploying(true);
    toast({ title: "Đang triển khai", description: `Đang khởi tạo ${config.count} tunnel Tor mới...` });

    try {
      const res = await fetch(`${apiUrl}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        await fetchInstances(apiUrl);
        toast({ title: "Thành công", description: `Đã triển khai thành công.` });
      } else {
        throw new Error("Triển khai thất bại");
      }
    } catch (e) {
      toast({ title: "Lỗi kết nối", description: "Không thể kết nối tới Backend (Cổng 2000).", variant: "destructive" });
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
      toast({ title: "Lỗi", description: "Thao tác thất bại.", variant: "destructive" });
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
                onCleanup={() => {
                  setInstances([]);
                  localStorage.removeItem('tor_instances');
                  toast({ title: "Dọn dẹp", description: "Đã xóa sạch danh sách tunnel." });
                }} 
                onExport={() => {
                  const blob = new Blob([JSON.stringify(instances, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'proxy_list.json';
                  a.click();
                }} 
                onRotateAll={() => toast({ title: "Xoay IP", description: "Đang gửi tín hiệu xoay IP hàng loạt..." })} 
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
          <LogViewer onBlockIp={(ip) => {
            setBlockedIps(prev => [...new Set([...prev, ip])]);
            toast({ title: "Đã chặn", description: `IP ${ip} đã được đưa vào danh sách đen.` });
          }} />
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
            onUnblockIp={(ip) => setBlockedIps(prev => prev.filter(i => i !== ip))}
          />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}
