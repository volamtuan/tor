
"use client"

import React, { useState, useEffect, useCallback } from 'react';
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
  ipMode: 'v4v6' | 'v6only';
};

export type SystemStats = {
  cpu: number;
  ram: number;
  torMem: number;
  instances: number;
  torStatus: string;
};

// API_BASE should point to your Flask backend. 
// In Docker, you might use localhost:5757 or a specific container name.
const API_BASE = 'http://localhost:5757';

export default function DashboardClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverIp, setServerIp] = useState('127.0.0.1');
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    ram: 0,
    torMem: 0,
    instances: 0,
    torStatus: 'unknown'
  });
  
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // Initialize data on mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setServerIp(window.location.hostname);
    }
    
    setStats(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 15) + 5,
      ram: Math.floor(Math.random() * 10) + 30,
    }));
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`).catch(() => null);
      if (!res || !res.ok) {
        setStats(prev => ({ ...prev, torStatus: 'offline' }));
        return;
      }
      
      const data = await res.json().catch(() => ({ status: 'unknown' }));
      setStats(prev => ({
        ...prev,
        torStatus: data.status || 'unknown',
        // Simulate dynamic stats
        cpu: Math.floor(Math.random() * 20) + 10,
        ram: Math.floor(Math.random() * 10) + 40,
        torMem: instances.length * 28, // Approx RAM per instance
        instances: instances.length
      }));
    } catch (e) {
      setStats(prev => ({ ...prev, torStatus: 'offline' }));
    }
  }, [instances.length]);

  const loadInstances = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/check_all_proxies`).catch(() => null);
      if (!res || !res.ok) return;
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;

      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) {
        const mapped: Instance[] = data.map(p => ({
          port: p.port,
          status: p.status,
          externalStatus: p.status === 'LIVE' ? 'READY' : 'FAILED',
          vpsIp: serverIp,
          exitIp: p.ip || '---',
          ping: p.ping || 0,
          country: p.country || 'Unknown',
          speed: p.speed || 0,
          ipv6: p.ipv6 || '---',
          authEnabled: !!(p.username || p.password),
          username: p.username || 'user' + p.port,
          password: p.password || 'pass' + p.port,
          ipMode: p.ipMode || 'v4v6'
        }));
        setInstances(mapped);
      }
    } catch (e) {
      // Ignore silent errors for periodic polling
    }
  }, [serverIp]);

  useEffect(() => {
    refreshStats();
    loadInstances();
    
    const interval = setInterval(() => {
      refreshStats();
      loadInstances();
    }, 6000);
    return () => clearInterval(interval);
  }, [refreshStats, loadInstances]);

  const handleDeploy = async (config: DeployConfig) => {
    setIsDeploying(true);
    toast({ title: "Đang triển khai", description: `Đang khởi tạo ${config.count} tunnel (${config.ipMode === 'v6only' ? 'Chỉ IPv6' : 'Đa giao thức'})...` });

    try {
      const res = await fetch(`${API_BASE}/api/create_tunnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).catch(() => null);
      
      if (!res || !res.ok) throw new Error("Connection failed");
      const data = await res.json();
      
      if (data.ok) {
        toast({ title: "Thành công", description: `Đã kích hoạt các cổng: ${(data.created || []).join(', ')}` });
        loadInstances();
      }
    } catch (e) {
      toast({ 
        title: "Lỗi kết nối", 
        description: "Không thể gửi lệnh đến Backend. Hãy đảm bảo Backend Flask đang chạy.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAction = async (act: string, port: number) => {
    try {
      let endpoint = '';
      if (act === 'rotate') endpoint = `/api/newnym/${port}`;
      else if (act === 'delete' || act === 'stop') endpoint = `/api/stop_port/${port}`;
      else if (act === 'check') endpoint = `/api/check_proxy/${port}`;
      else if (act === 'start') endpoint = `/api/start_port/${port}`;

      const res = await fetch(`${API_BASE}${endpoint}`).catch(() => null);
      if (!res || !res.ok) throw new Error("Action failed");
      
      const data = await res.json();
      
      if (act === 'check') {
        toast({ 
          title: data.status === 'LIVE' ? "Kết nối OK" : "Lỗi kết nối", 
          description: `IP: ${data.ip || '---'} | Ping: ${data.ping || 0}ms`,
          variant: data.status === 'LIVE' ? "default" : "destructive"
        });
      } else {
        toast({ title: "Thành công", description: `Lệnh ${act} cho cổng ${port} đã được gửi.` });
      }
      loadInstances();
    } catch (e) {
      toast({ title: "Lỗi thao tác", description: "Backend không phản hồi.", variant: "destructive" });
    }
  };

  const handleGlobalAction = async (action: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/${action}`, { method: 'POST' }).catch(() => null);
      if (!res || !res.ok) throw new Error("Global action failed");
      const data = await res.json();
      toast({ title: "Hệ thống", description: data.message });
      refreshStats();
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể kết nối đến Backend Flask.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (instances.length === 0) {
      toast({ title: "Thông báo", description: "Danh sách trống!", variant: "destructive" });
      return;
    }
    const text = instances.map(p => `${p.vpsIp}:${p.port}:${p.username || ''}:${p.password || ''}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tor_proxies_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    toast({ title: "Thành công", description: "Đã xuất danh sách Proxy" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <StatHeader stats={stats} onAction={handleGlobalAction} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/50 border border-border/50 mb-6 p-1">
          <TabsTrigger value="dashboard" className="font-bold uppercase tracking-tight">Bảng Điều Khiển</TabsTrigger>
          <TabsTrigger value="config" className="font-bold uppercase tracking-tight">Cấu Hình Torrc</TabsTrigger>
          <TabsTrigger value="logs" className="font-bold uppercase tracking-tight">Nhật Ký Tor</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-10">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
              <QuickTools 
                onCleanup={() => handleGlobalAction('stop')} 
                onExport={handleExport} 
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
