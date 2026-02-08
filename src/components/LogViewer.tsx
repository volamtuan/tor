
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LogViewerProps {
  apiBase: string;
}

export function LogViewer({ apiBase }: LogViewerProps) {
  const [logs, setLogs] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const scrollRef = useRef<HTMLPreElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${apiBase}/api/logs?lines=200`);
      const data = await res.json();
      setLogs(data.logs || '');
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } catch (e) {
      console.error("Lỗi tải logs:", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <Card className="glass-card shadow-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 border-b border-border/40">
        <CardTitle className="text-white flex items-center gap-2 text-md">
          <Terminal className="w-4 h-4 text-primary" />
          Nhật Ký Tor (System Logs)
        </CardTitle>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch id="auto-log" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-log" className="text-xs font-bold text-muted-foreground uppercase">Tự động làm mới</Label>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLogs('')} className="text-xs text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-1" /> XÓA MÀN HÌNH
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <pre 
          ref={scrollRef}
          className="bg-black/90 p-6 h-[600px] overflow-auto text-emerald-500 font-mono text-xs leading-relaxed selection:bg-emerald-500/20"
        >
          {logs || '--- Đang chờ dữ liệu nhật ký ---'}
        </pre>
      </CardContent>
    </Card>
  );
}
