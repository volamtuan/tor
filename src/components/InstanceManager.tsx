"use client"

import React, { useState } from 'react';
import { Plus, Loader2, Globe, Shield, User, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface DeployConfig {
  count: number;
  country: string;
  authEnabled: boolean;
  username?: string;
  password?: string;
}

interface InstanceManagerProps {
  onDeploy: (config: DeployConfig) => void;
  isDeploying: boolean;
}

const COUNTRIES = [
  'Random',
  'Vietnam',
  'United States',
  'Germany',
  'Japan',
  'France',
  'Singapore',
  'Canada',
  'United Kingdom',
  'Netherlands'
];

export function InstanceManager({ onDeploy, isDeploying }: InstanceManagerProps) {
  const [count, setCount] = useState(1);
  const [country, setCountry] = useState('Random');
  const [authEnabled, setAuthEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Card className="glass-card shadow-2xl border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Quản Lý Triển Khai
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Số Lượng Cổng</Label>
          <Input 
            type="number" 
            min={1} 
            max={100}
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="bg-background/50 border-border text-center text-xl font-mono text-white focus:ring-primary h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3" /> Quốc Gia
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="bg-background/50 border-border text-white">
              <SelectValue placeholder="Chọn quốc gia" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c} value={c}>{c === 'Random' ? 'Ngẫu Nhiên' : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <Label className="text-sm font-bold text-white cursor-pointer" htmlFor="auth-mode">Xác Thực (Auth)</Label>
          </div>
          <Switch id="auth-mode" checked={authEnabled} onCheckedChange={setAuthEnabled} />
        </div>

        {authEnabled && (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tên đăng nhập (để trống để tự tạo)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-background/50 border-border text-xs"
              />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Mật khẩu (để trống để tự tạo)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background/50 border-border text-xs"
              />
            </div>
          </div>
        )}

        <Button 
          onClick={() => onDeploy({ count, country, authEnabled, username, password })} 
          disabled={isDeploying}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ĐANG KHỞI TẠO...
            </>
          ) : (
            'TRIỂN KHAI NGAY'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
