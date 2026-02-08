
"use client"

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TorrcEditorProps {
  apiBase: string;
}

export function TorrcEditor({ apiBase }: TorrcEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTorrc = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/torrc`);
      const data = await res.json();
      setContent(data.content || '');
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể tải torrc", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveTorrc = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/torrc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Thành công", description: "Đã lưu cấu hình torrc" });
      } else {
        toast({ title: "Lỗi", description: data.message, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể lưu cấu hình", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDefault = async () => {
    if (!confirm("Tải torrc mặc định sẽ ghi đè cấu hình hiện tại. Tiếp tục?")) return;
    try {
      const res = await fetch(`${apiBase}/api/fetch_default_torrc`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setContent(data.content);
        toast({ title: "Thành công", description: "Đã tải cấu hình mặc định" });
      }
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể tải mặc định", variant: "destructive" });
    }
  };

  useEffect(() => { loadTorrc(); }, []);

  return (
    <Card className="glass-card shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Save className="w-5 h-5 text-primary" />
          Biên Tập torrc
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDefault} className="text-xs bg-white/5 border-white/10">
            <Download className="w-4 h-4 mr-1" /> MẶC ĐỊNH
          </Button>
          <Button variant="outline" size="sm" onClick={loadTorrc} disabled={loading} className="text-xs bg-white/5 border-white/10">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> TẢI LẠI
          </Button>
          <Button size="sm" onClick={saveTorrc} disabled={loading} className="text-xs bg-primary font-bold">
            <Save className="w-4 h-4 mr-1" /> LƯU THAY ĐỔI
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[500px] font-mono text-sm bg-black/40 text-emerald-400 border-border/50 focus:ring-primary"
          placeholder="# Nhập cấu hình Tor tại đây..."
        />
      </CardContent>
    </Card>
  );
}
