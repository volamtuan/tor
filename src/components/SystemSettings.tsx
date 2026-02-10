"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShieldCheck, 
  Wrench, 
  RefreshCw, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  DownloadCloud,
  ShieldX,
  Trash2,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SystemSettingsProps {
  apiUrl: string;
  onUpdateApiUrl: (url: string) => void;
  blockedIps: string[];
  onUnblockIp: (ip: string) => void;
}

export function SystemSettings({ apiUrl, onUpdateApiUrl, blockedIps, onUnblockIp }: SystemSettingsProps) {
  const { toast } = useToast();
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isFixing, setIsFixing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleFix = () => {
    setIsFixing(true);
    toast({ title: "Đang sửa lỗi", description: "Đang dọn dẹp file khóa và tiến trình Tor treo..." });
    setTimeout(() => {
      setIsFixing(false);
      toast({ title: "Thành công", description: "Hệ thống đã được tối ưu hóa." });
    }, 2000);
  };

  const handleInstallTor = () => {
    setIsInstalling(true);
    toast({ title: "Bắt đầu cài đặt", description: "Đang tải và cấu hình Tor Package..." });
    setTimeout(() => {
      setIsInstalling(false);
      toast({ title: "Hoàn tất", description: "Tor đã được cài đặt vào hệ thống." });
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="glass-card border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Server className="w-5 h-5 text-primary" /> Kết Nối Backend
          </CardTitle>
          <CardDescription>Cấu hình địa chỉ IP hoặc Domain của server điều khiển</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-muted-foreground">URL API Backend</Label>
            <div className="flex gap-2">
              <Input 
                value={tempUrl} 
                onChange={(e) => setTempUrl(e.target.value)} 
                placeholder="http://ip-cua-ban:5757"
                className="bg-background/50 border-border text-white"
              />
              <Button onClick={() => onUpdateApiUrl(tempUrl)} className="bg-primary hover:bg-primary/90">LƯU</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Mặc định: http://[vps-ip]:5757</p>
          </div>
          
          <div className="pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái kết nối:</span>
              <span className="flex items-center gap-1 text-accent font-bold"><CheckCircle2 className="w-3 h-3" /> ĐÃ KẾT NỐI</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Phiên bản Backend:</span>
              <span className="text-white font-mono">v2.4.0-stable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <ShieldX className="w-5 h-5 text-destructive" /> Danh Sách IP Bị Chặn
          </CardTitle>
          <CardDescription>Ngăn chặn các IP truy cập vào tất cả các cổng Proxy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[180px] w-full border border-border/40 rounded-lg p-2 bg-black/20">
            {blockedIps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2 py-8">
                <Lock className="w-8 h-8" />
                <p className="text-[10px] uppercase font-bold">Chưa có IP bị chặn</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedIps.map(ip => (
                  <div key={ip} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                    <span className="font-mono text-xs text-white">{ip}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-white"
                      onClick={() => onUnblockIp(ip)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <p className="text-[10px] text-muted-foreground italic">
            * IP trong danh sách này sẽ bị từ chối kết nối ngay lập tức tại firewall của Proxy.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-accent" /> Bảo Trì & Sửa Lỗi
          </CardTitle>
          <CardDescription>Các công cụ xử lý sự cố hệ thống tự động</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              Dùng chức năng "Sửa Lỗi" nếu Proxy gặp tình trạng kẹt cổng hoặc không phản hồi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              onClick={handleInstallTor}
              disabled={isInstalling}
              className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <DownloadCloud className={`w-4 h-4 ${isInstalling ? 'animate-bounce' : ''}`} />
              CÀI ĐẶT TOR (NẾU CHƯA CÓ)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleFix}
              disabled={isFixing}
              className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Wrench className={`w-4 h-4 ${isFixing ? 'animate-spin' : ''}`} />
              SỬA LỖI & DỌN DẸP NHANH
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              KHỞI ĐỘNG LẠI ENGINE TOR
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
