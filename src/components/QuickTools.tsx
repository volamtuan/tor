"use client"

import React from 'react';
import { Trash2, Download, ShieldAlert, Wrench, Repeat, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface QuickToolsProps {
  onCleanup: () => void;
  onExport: () => void;
  onRotateAll: () => void;
  onCheckAll: () => void;
}

export function QuickTools({ onCleanup, onExport, onRotateAll, onCheckAll }: QuickToolsProps) {
  return (
    <Card className="glass-card border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="text-md font-bold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          Công Cụ Nhanh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          onClick={onCheckAll}
          className="w-full bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white transition-all text-xs font-bold py-5"
        >
          <Zap className="w-4 h-4 mr-2" />
          CHECK IP (V4/V6) TẤT CẢ
        </Button>

        <Button 
          variant="outline" 
          onClick={onCheckAll}
          className="w-full bg-white/5 text-muted-foreground border-border hover:bg-secondary hover:text-white transition-all text-[10px] font-bold py-4"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-2" />
          KIỂM TRA TRẠNG THÁI ENGINE
        </Button>

        <Button 
          variant="outline" 
          onClick={onRotateAll}
          className="w-full bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all text-xs font-bold py-5"
        >
          <Repeat className="w-4 h-4 mr-2" />
          XOAY TOÀN BỘ IP/AUTH
        </Button>

        <Button 
          variant="outline" 
          onClick={onExport}
          className="w-full bg-white/5 text-white border-white/10 hover:bg-white hover:text-black transition-all text-xs font-bold py-5"
        >
          <Download className="w-4 h-4 mr-2" />
          XUẤT DANH SÁCH PROXY
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all text-xs font-bold py-5">
              <ShieldAlert className="w-4 h-4 mr-2" />
              DỌN DẸP HỆ THỐNG
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card border-destructive/50 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa toàn bộ?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Hành động này sẽ dừng tất cả tiến trình Tor đang chạy và xóa sạch dữ liệu tạm thời. Không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-background border-border">Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction onClick={onCleanup} className="bg-destructive text-white hover:bg-destructive/90">
                Xác nhận xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
