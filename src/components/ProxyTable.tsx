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
  ListFilter,
  Eye,
  EyeOff,
  Skull,
  Search,
  Activity
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProxyTableProps {
  instances: Instance[];
  onAction: (act: string, port: number) => void;
  onRefresh: () => void;
}

export function ProxyTable({ instances, onAction, onRefresh }: ProxyTableProps) {
  const [showPasswords, setShowPasswords] = React.useState<Record<number, boolean>>({});

  const togglePassword = (port: number) => {
    setShowPasswords(prev => ({ ...prev, [port]: !prev[port] }));
  };

  return (
    <Card className="glass-card shadow-2xl overflow-hidden border-border/40 rounded-xl">
      <div className="p-4 bg-secondary/30 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg shadow-inner">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-lg tracking-tight uppercase">Danh sách Tunnel</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-mono text-[9px]">
                {instances.length} ĐANG CHẠY
              </Badge>
              <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 uppercase">
                <Activity className="w-3 h-3" /> Giám sát
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-lg px-3 font-bold text-[10px]"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          LÀM MỚI TẤT CẢ
        </Button>
      </div>
      
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/60">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[180px] text-muted-foreground font-bold uppercase text-[9px] tracking-widest pl-6 py-3">VPS & Cổng</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-3">Bảo mật</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-3">Định danh</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-center py-3">Trạng thái</TableHead>
                <TableHead className="text-right pr-6 text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-3">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {instances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <div className="p-4 bg-muted rounded-full">
                        <Zap className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-[0.1em] text-md">Hệ thống trống</p>
                        <p className="text-[10px] font-medium uppercase tracking-widest">Triển khai tunnel để bắt đầu</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((p) => (
                  <TableRow 
                    key={p.port} 
                    className={`transition-all duration-300 border-l-2 group hover:bg-white/5 ${
                      p.externalStatus === 'READY' ? 'border-accent' : p.externalStatus === 'TESTING' ? 'border-primary' : p.externalStatus === 'FAILED' ? 'border-destructive' : 'border-muted'
                    }`}
                  >
                    <TableCell className="pl-6 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-primary text-xs tracking-tight">{p.vpsIp}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="font-mono text-[9px] font-bold h-4 px-1 rounded bg-background/50 border-border">
                            :{p.port}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {p.authMode === 'USER_PASS' ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="font-mono text-[10px] text-white font-bold">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5" />
                            <span className="font-mono text-[9px] text-muted-foreground tracking-widest">
                              {showPasswords[p.port] ? p.password : '••••••'}
                            </span>
                            <button 
                              onClick={() => togglePassword(p.port)} 
                              className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                            >
                              {showPasswords[p.port] ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>
                      ) : p.authMode === 'IP_WHITELIST' ? (
                        <div className="flex items-center gap-1.5">
                          <ListFilter className="w-3 h-3 text-accent" />
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-[9px] font-black text-accent hover:text-accent/80 underline decoration-dotted uppercase tracking-wider">DS TRUY CẬP</button>
                            </PopoverTrigger>
                            <PopoverContent className="glass-card w-64 p-3 shadow-2xl border-accent/30 rounded-xl backdrop-blur-xl">
                              <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">IP Cho phép</span>
                              </div>
                              <ScrollArea className="max-h-32">
                                <pre className="text-[10px] font-mono text-accent leading-relaxed bg-black/40 p-1.5 rounded-lg border border-accent/10">
                                  {p.allowedIps || 'Không có IP'}
                                </pre>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
                          <Unlock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[9px] uppercase font-bold text-muted-foreground italic tracking-widest">Ẩn danh</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-mono text-[9px] bg-white/5 border-white/10 text-white px-1.5 py-0">
                            V4: {p.exitIp}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{p.country}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <div className="flex flex-col items-center">
                        {p.externalStatus === 'TESTING' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : p.externalStatus === 'READY' ? (
                          <div className="flex flex-col items-center">
                            <Wifi className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[7px] font-black text-accent uppercase tracking-widest mt-0.5">SẴN SÀNG</span>
                          </div>
                        ) : p.externalStatus === 'FAILED' ? (
                          <div className="flex flex-col items-center">
                            <WifiOff className="w-3.5 h-3.5 text-destructive" />
                            <span className="text-[7px] font-black text-destructive uppercase tracking-widest mt-0.5">LỖI</span>
                          </div>
                        ) : (
                          <Wifi className="w-3.5 h-3.5 text-muted-foreground opacity-20" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-2">
                      <div className="flex justify-end gap-0.5 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('check', p.port)} className="h-7 w-7 text-primary hover:bg-primary/10">
                                <Search className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">Kiểm tra IP</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('kill', p.port)} className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                <Skull className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">Ngắt kết nối</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('rotate', p.port)} className="h-7 w-7 text-accent hover:bg-accent/10">
                                <Repeat className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">Đổi IP mới</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onAction('delete', p.port)} className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">Gỡ bỏ</TooltipContent>
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