import { useEffect, useState, useRef, useCallback } from 'react';
import { requestManager } from '@/services/requestManager';

interface UseOptimizedPollingOptions {
  queryKey: string;
  queryFn: () => Promise<any>;
  interval?: number;
  priority?: 'high' | 'medium' | 'low';
  enabled?: boolean;
  cacheTtl?: number;
  retryOnError?: boolean;
  maxRetries?: number;
}

export const useOptimizedPolling = ({
  queryKey,
  queryFn,
  interval = 180000, // 3 minutes default (much more conservative)
  priority = 'medium',
  enabled = true,
  cacheTtl = 120000, // 2 minutes cache
  retryOnError = true,
  maxRetries = 3
}: UseOptimizedPollingOptions) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Adaptive interval based on user activity and errors
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Adjust interval based on activity and visibility
  useEffect(() => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    
    let newInterval = interval;
    
    // Increase interval when tab is hidden
    if (!isTabVisible) {
      newInterval = interval * 3; // 3x slower when hidden
    }
    // Increase interval when user is inactive (>5 minutes)
    else if (inactiveTime > 300000) {
      newInterval = interval * 2; // 2x slower when inactive
    }
    
    setCurrentInterval(newInterval);
  }, [isTabVisible, lastActivity, interval]);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const result = await requestManager.request({
        key: queryKey,
        priority,
        cacheTtl,
        fn: queryFn
      });

      if (mountedRef.current) {
        setData(result);
        setLastFetch(Date.now());
        retryCountRef.current = 0; // Reset retry counter on success
      }
    } catch (err) {
      console.error(`Polling error for ${queryKey}:`, err);
      
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Implement retry logic for non-rate-limit errors
        if (retryOnError && retryCountRef.current < maxRetries) {
          const isRateLimit = err && (
            (err as any).status === 429 || 
            (err as any).message?.includes('429')
          );
          
          if (!isRateLimit) {
            retryCountRef.current++;
            const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
            
            console.log(`Retrying ${queryKey} in ${retryDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
            
            setTimeout(() => {
              if (mountedRef.current) {
                fetchData();
              }
            }, retryDelay);
            
            return; // Don't set loading to false yet
          }
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryKey, queryFn, priority, cacheTtl, enabled, retryOnError, maxRetries]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only poll if tab is visible or it's been a while since last fetch
    const shouldPoll = isTabVisible || (Date.now() - lastFetch > currentInterval);
    
    if (shouldPoll) {
      intervalRef.current = setInterval(() => {
        // Only fetch if tab is visible or data is stale
        const isStale = Date.now() - lastFetch > currentInterval;
        if (isTabVisible || isStale) {
          fetchData();
        }
      }, currentInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, currentInterval, isTabVisible, lastFetch, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const refetch = useCallback(() => {
    // Clear cache for this query
    requestManager.clearCache(queryKey);
    return fetchData();
  }, [queryKey, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastFetch: new Date(lastFetch),
    currentInterval,
    isStale: Date.now() - lastFetch > cacheTtl
  };
};