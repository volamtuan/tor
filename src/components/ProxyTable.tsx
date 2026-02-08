"use client"

import React from 'react';
import { RefreshCw, RotateCcw, Trash2, Globe, Zap, Network } from 'lucide-react';
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

interface ProxyTableProps {
  instances: Instance[];
  onAction: (act: string, port: number) => void;
  onRefresh: () => void;
}

export function ProxyTable({ instances, onAction, onRefresh }: ProxyTableProps) {
  return (
    <Card className="glass-card shadow-2xl overflow-hidden border-border/40">
      <div className="p-5 bg-secondary/30 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Active Proxy Tunnels</span>
          <Badge variant="secondary" className="bg-background/50 font-mono text-xs text-muted-foreground">
            {instances.length} Total
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          REFRESH
        </Button>
      </div>
      
      <div className="relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/40">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[100px] text-muted-foreground font-bold uppercase text-[10px] tracking-widest pl-8">Port</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Endpoint</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest text-center">Latency</TableHead>
                <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest text-center">Throughput</TableHead>
                <TableHead className="text-right pr-8 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/30">
              {instances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Zap className="w-12 h-12" />
                      <p className="font-mono uppercase tracking-widest text-sm">No active tunnels found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                instances.map((p) => (
                  <TableRow 
                    key={p.port} 
                    className={`transition-colors border-l-4 group hover:bg-white/5 ${
                      p.status === 'LIVE' ? 'border-accent' : 'border-destructive'
                    }`}
                  >
                    <TableCell className="pl-8">
                      <span className="font-mono font-bold text-primary text-md">:{p.port}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-white font-mono text-sm tracking-tighter">{p.ip}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{p.country}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-mono font-bold ${p.ping < 150 ? 'text-accent' : 'text-orange-400'}`}>
                        {p.ping}ms
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-mono text-accent font-bold bg-accent/10 px-2 py-1 rounded border border-accent/20">
                        {p.speed} KB/s
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onAction('restart', p.port)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                          title="Restart Instance"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onAction('delete', p.port)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          title="Kill Instance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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