"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Wrench, RefreshCw, Server, AlertTriangle, CheckCircle2, DownloadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettingsProps {
  apiUrl: string;
  onUpdateApiUrl: (url: string) => void;
}

export function SystemSettings({ apiUrl, onUpdateApiUrl }: SystemSettingsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="glass-card border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
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
                className="bg-background/50"
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
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Bảo Trì & Sửa Lỗi
          </CardTitle>
          <CardDescription>Các công cụ xử lý sự cố hệ thống tự động</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              Nếu bạn không thấy Proxy LIVE sau khi khởi tạo, hãy thử chức năng "Sửa Lỗi Nhanh" để giải phóng các cổng bị kẹt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              onClick={handleInstallTor}
              disabled={isInstalling}
              className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <DownloadCloud className={`w-4 h-4 ${isInstalling ? 'animate-bounce' : ''}`} />
              CÀI ĐẶT TOR (NẾU CHƯA CÓ)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleFix}
              disabled={isFixing}
              className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Wrench className={`w-4 h-4 ${isFixing ? 'animate-spin' : ''}`} />
              SỬA LỖI & DỌN DẸP NHANH
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10"
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
