"use client"

import React from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  Settings, 
  Terminal, 
  Globe, 
  History,
  Lock,
  Cpu
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/40 bg-card/30 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-black italic tracking-tighter text-white">
            Tor<span className="text-primary">Proxy</span>
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Hệ Thống Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Bảng điều khiển">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Bảng điều khiển</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Danh sách Proxy">
                  <Globe className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Danh sách Proxy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cấu hình hệ thống">
                  <Settings className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Cài đặt</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Nâng Cao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Quản lý khóa">
                  <Lock className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Khóa xác thực</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Nhật ký">
                  <History className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Lịch sử</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Cửa sổ lệnh">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">CLI</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/20">
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-bold text-primary uppercase">Engine Status</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            v2.4.0 <span className="text-accent ml-1 font-bold">Stable</span>
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
