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
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter text-white">
            TOR<span className="text-primary">MASTER</span>
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Core System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Main Control">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-bold">DASHBOARD</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Proxy List">
                  <Globe className="w-4 h-4" />
                  <span className="font-bold">PROXIES</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Global Settings">
                  <Settings className="w-4 h-4" />
                  <span className="font-bold">SETTINGS</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Advanced</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Auth Manager">
                  <Lock className="w-4 h-4" />
                  <span className="font-bold">AUTH KEYS</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logs">
                  <History className="w-4 h-4" />
                  <span className="font-bold">ACTIVITY LOGS</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Terminal">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold">CLI ACCESS</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-border/20">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase">Engine Status</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            v2.4.0 <span className="text-accent ml-1 font-bold">Stable</span>
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
