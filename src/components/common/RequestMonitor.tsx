import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Activity } from 'lucide-react';
import { requestManager } from '@/services/requestManager';

interface RequestMonitorProps {
  className?: string;
}

export const RequestMonitor = ({ className = '' }: RequestMonitorProps) => {
  const [stats, setStats] = useState({
    queueLength: 0,
    activeRequests: 0,
    cacheSize: 0,
    rateLimitHits: 0,
    currentDelay: 0,
    maxConcurrent: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(requestManager.getStats());
    };

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    requestManager.clearCache();
    setStats(requestManager.getStats());
  };

  const getStatusColor = () => {
    if (stats.rateLimitHits > 5) return 'destructive';
    if (stats.rateLimitHits > 2) return 'secondary';
    return 'default';
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Request Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{stats.queueLength}</div>
            <div className="text-xs text-muted-foreground">Queue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{stats.activeRequests}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{stats.cacheSize}</div>
            <div className="text-xs text-muted-foreground">Cache</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{stats.maxConcurrent}</div>
            <div className="text-xs text-muted-foreground">Concurrent</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Rate Limits:</span>
            <Badge variant={getStatusColor()}>
              {stats.rateLimitHits}
            </Badge>
          </div>
          
          {stats.currentDelay > 200 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Delay:</span>
              <Badge variant="outline">
                {stats.currentDelay}ms
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCache}
          className="w-full"
          disabled={stats.cacheSize === 0}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear Cache
        </Button>
      </CardContent>
    </Card>
  );
};