
"use client"

import React from 'react';
import { Trash2, Download, ShieldAlert, Wrench, Repeat } from 'lucide-react';
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
}

export function QuickTools({ onCleanup, onExport, onRotateAll }: QuickToolsProps) {
  return (
    <Card className="glass-card border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="text-md font-bold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          Quick Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          onClick={onRotateAll}
          className="w-full bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all text-xs font-bold py-5"
        >
          <Repeat className="w-4 h-4 mr-2" />
          ROTATE ALL IPv6
        </Button>

        <Button 
          variant="outline" 
          onClick={onExport}
          className="w-full bg-accent/5 text-accent border-accent/20 hover:bg-accent hover:text-white transition-all text-xs font-bold py-5"
        >
          <Download className="w-4 h-4 mr-2" />
          EXPORT VPS:PORT
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all text-xs font-bold py-5">
              <ShieldAlert className="w-4 h-4 mr-2" />
              FORCE CLEANUP
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card border-destructive/50 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Full System Wipe?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will kill all active Tor processes and delete all temporary instance data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-background border-border">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onCleanup} className="bg-destructive text-white hover:bg-destructive/90">
                Wipe All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
