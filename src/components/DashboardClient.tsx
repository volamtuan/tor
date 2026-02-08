"use client"

import React, { useState, useEffect } from 'react';
import { StatHeader } from '@/components/StatHeader';
import { InstanceManager, DeployConfig } from '@/components/InstanceManager';
import { ProxyTable } from '@/components/ProxyTable';
import { QuickTools } from '@/components/QuickTools';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

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
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    ram: 0,
    torMem: 0,
    instances: 0,
  });
  
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
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

  const generateVnIpv6 = () => {
    // Prefix Viettel: 2403:6200
    // Prefix VNPT: 2402:800
    const prefixes = ['2403:6200', '2402:800', '2405:4800'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const segments = Array.from({ length: 4 }).map(() => Math.floor(Math.random() * 65535).toString(16));
    return `${prefix}:${segments[0]}:${segments[1]}:${segments[2]}:${segments[3]}:1`;
  };

  const handleDeploy = (config: DeployConfig) => {
    setIsDeploying(true);
    toast({
      title: "Đang triển khai",
      description: `Khởi tạo ${config.count} tunnel Tor mới tại ${config.country === 'Random' ? 'Quốc gia ngẫu nhiên' : config.country}...`,
    });

    setTimeout(() => {
      const vpsIpBase = "103.153.64.";
      const newInstances: Instance[] = Array.from({ length: config.count }).map((_, i) => {
        const port = 8000 + instances.length + i;
        let username = config.username;
        let password = config.password;
        
        if (config.authEnabled && (!username || !password)) {
          const randomAuth = generateRandomAuth();
          username = username || randomAuth.user;
          password = password || randomAuth.pass;
        }

        const country = config.country === 'Random' 
          ? ['Vietnam', 'United States', 'Germany', 'Japan', 'France', 'Singapore', 'Canada'][Math.floor(Math.random() * 7)] 
          : config.country;

        return {
          port,
          status: 'LIVE',
          externalStatus: 'WAITING',
          vpsIp: vpsIpBase + (Math.floor(Math.random() * 254) + 1),
          exitIp: country === 'Vietnam' ? `171.224.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          ping: Math.floor(Math.random() * 300) + 50,
          country,
          speed: parseFloat((Math.random() * 200 + 20).toFixed(2)),
          ipv6: country === 'Vietnam' ? generateVnIpv6() : `2a03:2880:f12f:83:face:b00c:${Math.random().toString(16).slice(2, 6)}:1`,
          username,
          password,
          authEnabled: config.authEnabled
        };
      });
      setInstances(prev => [...prev, ...newInstances].sort((a, b) => a.port - b.port));
      setIsDeploying(false);
      toast({
        title: "Triển khai hoàn tất",
        description: `Đã kích hoạt thành công ${config.count} instance.`,
      });
    }, 2000);
  };

  const checkConnectivity = (port: number) => {
    setInstances(prev => prev.map(i => i.port === port ? { ...i, externalStatus: 'TESTING' } : i));
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.15;
      setInstances(prev => prev.map(i => i.port === port ? { 
        ...i, 
        externalStatus: isSuccess ? 'READY' : 'FAILED',
        status: isSuccess ? 'LIVE' : 'DIE'
      } : i));
      
      if (isSuccess) {
        toast({ title: "Kết nối OK", description: `Cổng :${port} đã thông mạng quốc tế.` });
      } else {
        toast({ title: "Lỗi kết nối", description: `Cổng :${port} không thể truy cập từ bên ngoài.`, variant: "destructive" });
      }
    }, 2000);
  };

  const handleAction = (act: string, port: number) => {
    if (act === 'delete') {
      setInstances(prev => prev.filter(i => i.port !== port));
      toast({ title: "Đã xóa", description: `Cổng :${port} đã bị gỡ bỏ.` });
    } else if (act === 'restart') {
      setInstances(prev => prev.map(i => i.port === port ? { ...i, status: 'LIVE', externalStatus: 'WAITING', ping: Math.floor(Math.random() * 100) + 50 } : i));
      toast({ title: "Đã khởi động lại", description: `Đang làm mới cổng :${port}...` });
    } else if (act === 'check') {
      checkConnectivity(port);
    } else if (act === 'rotate') {
      const randomAuth = generateRandomAuth();
      setInstances(prev => prev.map(i => {
        if (i.port === port) {
          return { 
            ...i, 
            exitIp: i.country === 'Vietnam' ? `171.224.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            ipv6: i.country === 'Vietnam' ? generateVnIpv6() : `2a03:2880:f12f:83:face:b00c:${Math.random().toString(16).slice(2, 6)}:1`,
            username: i.authEnabled ? randomAuth.user : undefined,
            password: i.authEnabled ? randomAuth.pass : undefined
          };
        }
        return i;
      }));
      toast({ title: "Đã xoay IP/IPv6", description: `Cổng :${port} đã nhận định danh mới.` });
    }
  };

  const handleGlobalRotate = () => {
    setInstances(prev => prev.map(i => {
      const randomAuth = generateRandomAuth();
      return { 
        ...i, 
        exitIp: i.country === 'Vietnam' ? `171.224.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        ipv6: i.country === 'Vietnam' ? generateVnIpv6() : `2a03:2880:f12f:83:face:b00c:${Math.random().toString(16).slice(2, 6)}:1`,
        username: i.authEnabled ? randomAuth.user : undefined,
        password: i.authEnabled ? randomAuth.pass : undefined
      };
    }));
    toast({ title: "Xoay toàn bộ hệ thống", description: "Tất cả các proxy đã được đổi IP và thông tin xác thực." });
  };

  const handleGlobalCheck = () => {
    toast({ title: "Bắt đầu kiểm tra", description: "Đang quét trạng thái tất cả tunnel..." });
    instances.forEach(i => checkConnectivity(i.port));
  };

  const handleCleanup = () => {
    setInstances([]);
    toast({ title: "Dọn dẹp hệ thống", description: "Tất cả các tiến trình Tor đã bị dừng.", variant: "destructive" });
  };

  const handleExport = () => {
    const data = instances.map(i => {
      const auth = i.authEnabled ? `:${i.username}:${i.password}` : '';
      return `${i.vpsIp}:${i.port}${auth}`;
    }).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proxy_list_tor.txt';
    a.click();
    toast({ title: "Xuất dữ liệu thành công", description: "Danh sách Proxy đã được tải về." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <StatHeader stats={stats} />
      
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <InstanceManager onDeploy={handleDeploy} isDeploying={isDeploying} />
          <QuickTools 
            onCleanup={handleCleanup} 
            onExport={handleExport} 
            onRotateAll={handleGlobalRotate} 
            onCheckAll={handleGlobalCheck}
          />
        </div>

        <div className="col-span-12 lg:col-span-9">
          <ProxyTable 
            instances={instances} 
            onAction={handleAction} 
            onRefresh={() => {
              toast({ title: "Đang đồng bộ", description: "Cập nhật dữ liệu từ máy chủ..." });
            }} 
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
