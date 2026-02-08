"use client"

import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InstanceManagerProps {
  onDeploy: (count: number) => void;
  isDeploying: boolean;
}

export function InstanceManager({ onDeploy, isDeploying }: InstanceManagerProps) {
  const [count, setCount] = useState(1);

  return (
    <Card className="glass-card shadow-2xl border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Instance Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Deploy Count</p>
          <Input 
            type="number" 
            min={1} 
            max={50}
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="bg-background/50 border-border text-center text-xl font-mono text-white focus:ring-primary h-12"
          />
        </div>
        <Button 
          onClick={() => onDeploy(count)} 
          disabled={isDeploying}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold tracking-tight shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              INITIALIZING...
            </>
          ) : (
            'DEPLOY NOW'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}