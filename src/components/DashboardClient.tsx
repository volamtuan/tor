
"use client"

import React, { useState, useEffect } from 'react';
import { StatHeader } from '@/components/StatHeader';
import { InstanceManager, DeployConfig } from '@/components/InstanceManager';
import { ProxyTable } from '@/components/ProxyTable';
import { QuickTools } from '@/components/QuickTools';
import { TorrcEditor } from '@/components/TorrcEditor';
import { LogViewer } from '@/components/LogViewer';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  torStatus: string;
};

const API_BASE = ''; // Giả định NextJS proxy qua Flask hoặc chạy cùng domain

export default function DashboardClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    ram: 0,
    torMem: 0,
    instances: 0,
    torStatus: 'unknown'
  });
  
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    refreshStats();
    loadInstances();
    const interval = setInterval(() => {
      refreshStats();
      loadInstances();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      const data = await res.json();
      setStats(prev => ({
        ...prev,
        torStatus: data.status,
        cpu: Math.floor(Math.random() * 15) + 5, // Mock CPU/RAM vì Flask chưa trả về
        ram: Math.floor(Math.random() * 30) + 40,
        torMem: instances.length * 24,
        instances: instances.length
      }));
    } catch (e) {
      console.error("Lỗi kết nối API:", e);
    }
  };

  const loadInstances = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/check_all_proxies`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: Instance[] = data.map(p => ({
          port: p.port,
          status: p.status,
          externalStatus: p.status === 'LIVE' ? 'READY' : 'FAILED',
          vpsIp: window.location.hostname,
          exitIp: p.ip || '---',
          ping: p.ping || 0,
          country: p.country || 'Unknown',
          speed: p.speed || 0,
          ipv6: '---', // Backend Flask chưa hỗ trợ IPv6 cụ thể cho instance
          authEnabled: false
        }));
        setInstances(mapped);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách instance:", e);
    }
  };

  const handleDeploy = async (config: DeployConfig) => {
    setIsDeploying(true);
    toast({ title: "Đang triển khai", description: `Đang tạo ${config.count} tunnel mới...` });

    try {
      const res = await fetch(`${API_BASE}/api/create_tunnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: config.count })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Thành công", description: `Đã tạo các cổng: ${data.created.join(', ')}` });
        loadInstances();
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể kết nối đến Backend", variant: "destructive" });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAction = async (act: string, port: number) => {
    try {
      if (act === 'restart' || act === 'rotate') {
        await fetch(`${API_BASE}/api/newnym/${port}`);
        toast({ title: "Đang làm mới", description: `Đã gửi lệnh Newnym cho cổng :${port}` });
      } else if (act === 'delete' || act === 'stop') {
        await fetch(`${API_BASE}/api/stop_port/${port}`);
        toast({ title: "Đã dừng", description: `Cổng :${port} đã được tắt.` });
      } else if (act === 'check') {
        const res = await fetch(`${API_BASE}/api/check_proxy/${port}`);
        const data = await res.json();
        toast({ 
          title: data.status === 'LIVE' ? "Kết nối OK" : "Lỗi kết nối", 
          description: `IP: ${data.ip || 'N/A'} - Ping: ${data.ping || 0}ms`,
          variant: data.status === 'LIVE' ? "default" : "destructive"
        });
      }
      loadInstances();
    } catch (e) {
      toast({ title: "Lỗi thao tác", description: "Lỗi thực thi lệnh API", variant: "destructive" });
    }
  };

  const handleGlobalAction = async (action: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/${action}`, { method: 'POST' });
      const data = await res.json();
      toast({ title: "Thông báo hệ thống", description: data.message });
      refreshStats();
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể kết nối đến Backend", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <StatHeader stats={stats} onAction={handleGlobalAction} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/50 border border-border/50 mb-6">
          <TabsTrigger value="dashboard" className="font-bold">BẢNG ĐIỀU KHIỂN</TabsTrigger>
          <TabsTrigger value="config" className="font-bold">CẤU HÌNH TORRC</TabsTrigger>
          <TabsTrigger value="logs" className="font-bold">NHẬT KÝ HỆ THỐNG</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-10">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={() => handleGlobalAction('stop')} 
                onExport={() => {}} 
                onRotateAll={() => loadInstances()} 
                onCheckAll={() => loadInstances()}
              />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <ProxyTable 
                instances={instances} 
                onAction={handleAction} 
                onRefresh={loadInstances} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <TorrcEditor apiBase={API_BASE} />
        </TabsContent>

        <TabsContent value="logs">
          <LogViewer apiBase={API_BASE} />
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  );
}
