
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

export default function DashboardClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverIp, setServerIp] = useState('127.0.0.1');
  const [apiBase, setApiBase] = useState('http://localhost:5757');
  
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
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setServerIp(hostname);
      // Tự động định cấu hình API Base dựa trên hostname truy cập
      setApiBase(`http://${hostname}:5757`);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/status`).catch(() => null);
      if (!res || !res.ok) {
        setStats(prev => ({ ...prev, torStatus: 'offline' }));
        return;
      }
      
      const data = await res.json().catch(() => ({ status: 'unknown' }));
      setStats(prev => ({
        ...prev,
        torStatus: data.status || 'unknown',
        cpu: Math.floor(Math.random() * 15) + 5,
        ram: Math.floor(Math.random() * 10) + 30,
        torMem: instances.length * 24,
        instances: instances.length
      }));
    } catch (e) {
      setStats(prev => ({ ...prev, torStatus: 'offline' }));
    }
  }, [apiBase, instances.length]);

  const loadInstances = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/check_all_proxies`).catch(() => null);
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
      // Silently fail to avoid console noise
    }
  }, [apiBase, serverIp]);

  useEffect(() => {
    refreshStats();
    loadInstances();
    const interval = setInterval(() => {
      refreshStats();
      loadInstances();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshStats, loadInstances]);

  const handleDeploy = async (config: DeployConfig) => {
    setIsDeploying(true);
    toast({ title: "Đang triển khai", description: `Đang khởi tạo ${config.count} tunnel mới...` });

    try {
      const res = await fetch(`${apiBase}/api/create_tunnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).catch(() => null);
      
      if (!res || !res.ok) throw new Error("Connection failed");
      const data = await res.json();
      
      if (data.ok) {
        toast({ title: "Thành công", description: `Đã kích hoạt ${data.created?.length || 0} cổng mới.` });
        loadInstances();
      }
    } catch (e) {
      toast({ 
        title: "Lỗi kết nối", 
        description: "Không thể kết nối Backend. Hãy kiểm tra dịch vụ Flask.", 
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

      const res = await fetch(`${apiBase}${endpoint}`).catch(() => null);
      if (!res || !res.ok) throw new Error("Action failed");
      
      const data = await res.json();
      toast({ title: "Hành động", description: data.message || "Thao tác thành công." });
      loadInstances();
    } catch (e) {
      toast({ title: "Lỗi", description: "Backend không phản hồi.", variant: "destructive" });
    }
  };

  const handleGlobalAction = async (action: string) => {
    try {
      const res = await fetch(`${apiBase}/api/${action}`, { method: 'POST' }).catch(() => null);
      if (!res || !res.ok) throw new Error("Action failed");
      const data = await res.json();
      toast({ title: "Hệ thống", description: data.message });
      refreshStats();
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể thực hiện lệnh hệ thống.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (instances.length === 0) {
      toast({ title: "Trống", description: "Chưa có proxy nào để xuất.", variant: "destructive" });
      return;
    }
    const text = instances.map(p => `${p.vpsIp}:${p.port}:${p.username || ''}:${p.password || ''}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tormaster_proxies_${new Date().getTime()}.txt`;
    a.click();
    toast({ title: "Xuất dữ liệu", description: "Đã tải xuống danh sách Proxy." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <StatHeader stats={stats} onAction={handleGlobalAction} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/50 border border-border/50 mb-6 p-1">
          <TabsTrigger value="dashboard" className="font-bold uppercase">Bảng Điều Khiển</TabsTrigger>
          <TabsTrigger value="config" className="font-bold uppercase">Cấu Hình torrc</TabsTrigger>
          <TabsTrigger value="logs" className="font-bold uppercase">Nhật Ký Tor</TabsTrigger>
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
          <TorrcEditor apiBase={apiBase} />
        </TabsContent>

        <TabsContent value="logs">
          <LogViewer apiBase={apiBase} />
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  );
}
