"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Terminal, Trash2, Download, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LogViewer() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const events = [
        `[${timestamp}] Tor connection established on port 800${Math.floor(Math.random() * 9)}`,
        `[${timestamp}] New circuit established via United States`,
        `[${timestamp}] Signaling NEWNYM for instance at :8002`,
        `[${timestamp}] Health check: Port 8005 is responsive`,
      ];
      setLogs(prev => [...prev, events[Math.floor(Math.random() * events.length)]].slice(-100));
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  return (
    <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden h-[600px] flex flex-col">
      <CardHeader className="bg-secondary/30 border-b border-border flex flex-row justify-between items-center py-4">
        <CardTitle className="text-white flex items-center gap-2 text-md">
          <Terminal className="w-5 h-5 text-primary" />
          Console Theo Dõi Tor
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsPaused(!isPaused)} className="text-xs h-8">
            {isPaused ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
            {isPaused ? "TIẾP TỤC" : "TẠM DỪNG"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="text-destructive h-8">
            <Trash2 className="w-3 h-3 mr-1" /> XÓA LOG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 bg-black/40 font-mono text-xs">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground italic opacity-50">Đang chờ tín hiệu từ hệ thống...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-3 hover:bg-white/5 py-0.5 px-2 rounded transition-colors">
                  <span className="text-primary/50 select-none">{(idx + 1).toString().padStart(3, '0')}</span>
                  <span className={log.includes('established') ? 'text-accent' : 'text-white/80'}>{log}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
