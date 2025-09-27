import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemoryMonitor } from '@/hooks/performance/useMemoryMonitor';
import { useRenderTracker } from '@/hooks/performance/useRenderTracker';
import { Activity, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

interface PerformanceDebuggerProps {
  enabled?: boolean;
}

export const PerformanceDebugger: React.FC<PerformanceDebuggerProps> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { getMemoryMetrics, forceGarbageCollection } = useMemoryMonitor();
  const { getAllStats, getSlowComponents, clear } = useRenderTracker('PerformanceDebugger');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    if (enabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [enabled, isVisible]);

  if (!enabled || !isVisible) {
    return null;
  }

  const memoryMetrics = getMemoryMetrics();
  const renderStats = getAllStats();
  const slowComponents = getSlowComponents();

  return (
    <div className="app-fab-in-main bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-background border border-border rounded-lg shadow-lg">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Debugger
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={forceGarbageCollection}
                title="Force Garbage Collection"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clear}
                title="Clear Stats"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsVisible(false)}
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Memory Usage */}
          {memoryMetrics && (
            <div>
              <h4 className="font-semibold mb-2">Memoria</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Usado:</span>
                  <span>{Math.round(memoryMetrics.usedJSHeapSize / 1024 / 1024)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{Math.round(memoryMetrics.totalJSHeapSize / 1024 / 1024)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Límite:</span>
                  <span>{Math.round(memoryMetrics.jsHeapSizeLimit / 1024 / 1024)} MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Slow Components */}
          {slowComponents.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-warning" />
                Componentes Lentos
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {slowComponents.slice(0, 5).map((component) => (
                  <div key={component.componentName} className="flex justify-between items-center">
                    <span className="truncate">{component.componentName}</span>
                    <div className="flex gap-1">
                      <Badge variant="destructive" className="text-xs">
                        {component.slowRenders}
                      </Badge>
                      <span className="text-muted-foreground">
                        {component.averageRenderTime.toFixed(1)}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Component Render Stats */}
          <div>
            <h4 className="font-semibold mb-2">Renders por Componente</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {renderStats.slice(0, 8).map((component) => (
                <div key={component.componentName} className="flex justify-between items-center">
                  <span className="truncate">{component.componentName}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {component.renderCount}
                    </Badge>
                    <span className="text-muted-foreground">
                      {component.averageRenderTime.toFixed(1)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Presiona Ctrl+Shift+P para toggle
          </div>
        </CardContent>
      </Card>
    </div>
  );
};