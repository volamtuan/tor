
"use client"

import React from 'react';
import { 
  RefreshCw, 
  RotateCcw, 
  Trash2, 
  Globe, 
  Zap, 
  Network, 
  ShieldCheck, 
  Repeat,
  Lock,
  Wifi,
  WifiOff,
  Loader2,
  Unlock,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Instance } from './DashboardClient';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface ProxyTableProps {
  instances: Instance[];
  onAction: (act: string, port: number) => void;
  onRefresh: () => void;
}

export function ProxyTable({ instances, onAction, onRefresh }: ProxyTableProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast({ title: "Đã sao chép", description: `Đã copy ${type} vào bộ nhớ tạm.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="glass-card shadow-2xl overflow-hidden border-border/40">
      <div className="p-5 bg-secondary/30 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight uppercase italic">Đội Hình Proxy Tunnel</span>
          <Badge variant="secondary" className="bg-background/50 font-mono text-xs text-muted-foreground px-3">
            {instances.length} Tổng cộng
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const all = instances.map(p => `${p.vpsIp}:${p.port}`).join('\n');
              copyToClipboard(all, "toàn bộ IP:Port");
            }}
            className="bg-white/5 border-white/10 text-white hover:bg-white/20 text-xs font-bold"
          >
            COPY TẤT CẢ IP:PORT
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            LÀM MỚI
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/40">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[200px] text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-8">VPS IP & Port</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Xác Thực (Auth)</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Định Danh Quốc Tế</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest text-center">Trạng Thái</TableHead>
                <TableHead className="text-right pr-8 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
              {instances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Zap className="w-12 h-12" />
                      <p className="font-mono uppercase tracking-widest text-sm">Chưa có proxy nào được triển khai</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((p) => (
                  <TableRow 
                    key={p.port} 
                    className={`transition-colors border-l-4 group hover:bg-white/5 ${
                      p.externalStatus === 'READY' ? 'border-accent' : p.externalStatus === 'TESTING' ? 'border-primary' : 'border-destructive'
                    }`}
                  >
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-primary text-sm">{p.vpsIp}</span>
                          <span className="font-mono text-muted-foreground text-xs font-bold">:{p.port}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(`${p.vpsIp}:${p.port}`, "IP:Port")}
                        >
                          {copiedId === `${p.vpsIp}:${p.port}` ? <CheckCircle className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.authEnabled ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-muted-foreground" />
                              <span className="font-mono text-xs text-white">{p.username}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3" />
                              <span className="font-mono text-[10px] text-muted-foreground">{p.password}</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => copyToClipboard(`${p.username}:${p.password}`, "User:Pass")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 opacity-40">
                          <Unlock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] uppercase font-bold text-muted-foreground italic">No Auth</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-[11px] tracking-tighter bg-white/5 px-1.5 rounded">{p.exitIp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{p.country}</span>
                          <Badge className="text-[8px] h-4 py-0 px-1 bg-primary/20 text-primary border-primary/20">
                            {p.ipMode === 'v6only' ? 'IPv6 Only' : 'v4/v6'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        {p.externalStatus === 'TESTING' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : p.externalStatus === 'READY' ? (
                          <div className="flex flex-col items-center">
                            <Wifi className="w-4 h-4 text-accent" />
                            <span className="text-[8px] font-bold text-accent uppercase">Sẵn sàng</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center opacity-30">
                            <WifiOff className="w-4 h-4 text-destructive" />
                            <span className="text-[8px] font-bold text-destructive uppercase">Lỗi</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('check', p.port)} className="h-8 w-8 text-primary hover:bg-primary/10">
                                <ShieldCheck className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Kiểm tra</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('rotate', p.port)} className="h-8 w-8 text-accent hover:bg-accent/10">
                                <Repeat className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xoay IP</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('delete', p.port)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
