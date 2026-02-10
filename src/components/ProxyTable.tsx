
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
    <Card className="glass-card shadow-2xl overflow-hidden border-border/40 rounded-2xl">
      <div className="p-6 bg-secondary/30 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-xl shadow-inner">
            <Network className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-xl tracking-tight uppercase">Đội Hình Tunnel</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-mono text-[10px]">
                {instances.length} ACTIVE
              </Badge>
              <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 uppercase">
                <Activity className="w-3 h-3" /> Live Monitor
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-lg px-4 font-bold text-xs"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          LÀM MỚI TOÀN BỘ
        </Button>
      </div>
      
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/60">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[200px] text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-8 py-5">VPS IP & Port</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-5">Xác Thực (Security)</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-5">Định Danh IP (V4/V6)</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest text-center py-5">Kết Nối</TableHead>
                <TableHead className="text-right pr-8 text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-5">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {instances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="p-6 bg-muted rounded-full">
                        <Zap className="w-16 h-16" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-[0.2em] text-lg">Hệ thống trống</p>
                        <p className="text-xs font-medium uppercase tracking-widest">Triển khai tunnel mới để bắt đầu</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((p) => (
                  <TableRow 
                    key={p.port} 
                    className={`transition-all duration-300 border-l-4 group hover:bg-white/5 ${
                      p.externalStatus === 'READY' ? 'border-accent' : p.externalStatus === 'TESTING' ? 'border-primary' : p.externalStatus === 'FAILED' ? 'border-destructive' : 'border-muted'
                    }`}
                  >
                    <TableCell className="pl-8 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-black text-primary text-sm tracking-tight">{p.vpsIp}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-[10px] font-bold h-5 px-1.5 rounded bg-background/50 border-border">
                            PORT {p.port}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {p.authMode === 'USER_PASS' ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 group/auth">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <span className="font-mono text-xs text-white font-bold">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3" />
                            <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                              {showPasswords[p.port] ? p.password : '••••••••'}
                            </span>
                            <button 
                              onClick={() => togglePassword(p.port)} 
                              className="text-muted-foreground hover:text-primary transition-colors p-1"
                            >
                              {showPasswords[p.port] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      ) : p.authMode === 'IP_WHITELIST' ? (
                        <div className="flex items-center gap-2">
                          <ListFilter className="w-3.5 h-3.5 text-accent" />
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-[10px] font-black text-accent hover:text-accent/80 underline decoration-dotted uppercase tracking-wider">ACL WHITELIST</button>
                            </PopoverTrigger>
                            <PopoverContent className="glass-card w-72 p-4 shadow-2xl border-accent/30 rounded-xl backdrop-blur-xl">
                              <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                                <ShieldCheck className="w-4 h-4 text-accent" />
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">Authorized Source IPs</span>
                              </div>
                              <ScrollArea className="max-h-40">
                                <pre className="text-[11px] font-mono text-accent leading-relaxed bg-black/40 p-2 rounded-lg border border-accent/10">
                                  {p.allowedIps || 'No IPs defined'}
                                </pre>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                          <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[10px] uppercase font-bold text-muted-foreground italic tracking-widest">Anonymous Access</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px] bg-white/5 border-white/10 text-white px-2">
                            V4: {p.exitIp}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{p.country}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[9px] text-muted-foreground/50 font-mono truncate max-w-[140px] italic cursor-help border-b border-white/5">
                                IPv6: {p.ipv6}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black border-border">
                              <p className="font-mono text-[10px] text-accent">{p.ipv6}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex flex-col items-center gap-1">
                        {p.externalStatus === 'TESTING' ? (
                          <div className="relative">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                          </div>
                        ) : p.externalStatus === 'READY' ? (
                          <div className="flex flex-col items-center animate-in fade-in zoom-in">
                            <div className="p-2 bg-accent/10 rounded-full mb-1">
                              <Wifi className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-[8px] font-black text-accent uppercase tracking-widest">ONLINE</span>
                          </div>
                        ) : p.externalStatus === 'FAILED' ? (
                          <div className="flex flex-col items-center animate-in fade-in zoom-in">
                            <div className="p-2 bg-destructive/10 rounded-full mb-1">
                              <WifiOff className="w-4 h-4 text-destructive" />
                            </div>
                            <span className="text-[8px] font-black text-destructive uppercase tracking-widest">FAILED</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center opacity-20">
                            <Wifi className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">WAIT</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8 py-4">
                      <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onAction('check', p.port)} 
                                className="h-9 w-9 text-primary hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all"
                                disabled={p.externalStatus === 'TESTING'}
                              >
                                {p.externalStatus === 'TESTING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Kiểm tra IP & Kết nối</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onAction('kill', p.port)} 
                                className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:scale-110 active:scale-95 transition-all"
                              >
                                <Skull className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ngắt toàn bộ phiên kết nối</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onAction('rotate', p.port)} 
                                className="h-9 w-9 text-accent hover:bg-accent/10 hover:scale-110 active:scale-95 transition-all"
                              >
                                <Repeat className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Làm mới Identity (Newnym)</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onAction('restart', p.port)} 
                                className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-white/10 hover:scale-110"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Khởi động lại tiến trình</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onAction('delete', p.port)} 
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:scale-110"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa & Giải phóng cổng</TooltipContent>
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
