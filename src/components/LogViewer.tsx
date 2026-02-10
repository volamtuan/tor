"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Terminal, Trash2, Pause, Play, Activity, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LogViewer() {
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [accessLogs, setAccessLogs] = useState<{ id: number, time: string, ip: string, port: number, status: string }[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRefSystem = useRef<HTMLDivElement>(null);
  const scrollRefAccess = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      
      // Simulate System Logs
      const sysEvents = [
        `[${timestamp}] Tor connection established on port 800${Math.floor(Math.random() * 9)}`,
        `[${timestamp}] New circuit established via United States`,
        `[${timestamp}] Signaling NEWNYM for instance at :8002`,
        `[${timestamp}] Health check: Port 8005 is responsive`,
      ];
      setSystemLogs(prev => [...prev, sysEvents[Math.floor(Math.random() * sysEvents.length)]].slice(-50));

      // Simulate Access Logs
      const accessEvent = {
        id: Date.now(),
        time: timestamp,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: 8000 + Math.floor(Math.random() * 10),
        status: Math.random() > 0.1 ? 'ACCEPTED' : 'DENIED'
      };
      setAccessLogs(prev => [...prev, accessEvent].slice(-50));
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden h-[600px] flex flex-col">
      <CardHeader className="bg-secondary/30 border-b border-border flex flex-row justify-between items-center py-4">
        <CardTitle className="text-white flex items-center gap-2 text-md">
          <Terminal className="w-5 h-5 text-primary" />
          Hệ Thống Nhật Ký Truy Cập
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)} className="text-xs h-8">
            {isPaused ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
            {isPaused ? "TIẾP TỤC" : "TẠM DỪNG"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setSystemLogs([]); setAccessLogs([]); }} className="text-destructive h-8">
            <Trash2 className="w-3 h-3 mr-1" /> XÓA LOG
          </Button>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="access" className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b border-border bg-black/20">
          <TabsList className="bg-background/40 h-8">
            <TabsTrigger value="access" className="text-[10px] font-bold uppercase">Nhật ký Truy Cập (Ports)</TabsTrigger>
            <TabsTrigger value="system" className="text-[10px] font-bold uppercase">Nhật ký Hệ Thống (Engine)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="access" className="flex-1 m-0">
          <ScrollArea className="h-[480px] p-4 bg-black/40 font-mono text-[11px]" ref={scrollRefAccess}>
            <div className="space-y-1">
              {accessLogs.length === 0 ? (
                <p className="text-muted-foreground italic opacity-50">Đang chờ tín hiệu truy cập...</p>
              ) : (
                accessLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 hover:bg-white/5 py-1 px-2 rounded transition-colors items-center">
                    <span className="text-primary/50 shrink-0">{log.time}</span>
                    <Badge variant="outline" className="text-[9px] font-mono bg-primary/5 text-primary border-primary/20">PORT :{log.port}</Badge>
                    <span className="text-white/80 font-bold shrink-0">{log.ip}</span>
                    <Activity className="w-3 h-3 text-muted-foreground/30" />
                    <span className={log.status === 'ACCEPTED' ? 'text-accent' : 'text-destructive'}>
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="system" className="flex-1 m-0">
          <ScrollArea className="h-[480px] p-4 bg-black/40 font-mono text-[11px]" ref={scrollRefSystem}>
            <div className="space-y-1">
              {systemLogs.length === 0 ? (
                <p className="text-muted-foreground italic opacity-50">Đang chờ tín hiệu hệ thống...</p>
              ) : (
                systemLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-3 hover:bg-white/5 py-0.5 px-2 rounded transition-colors">
                    <span className="text-primary/50 select-none">{(idx + 1).toString().padStart(3, '0')}</span>
                    <span className={log.includes('established') ? 'text-accent' : 'text-white/80'}>{log}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
