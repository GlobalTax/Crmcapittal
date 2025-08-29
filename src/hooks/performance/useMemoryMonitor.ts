import { useEffect, useRef, useCallback } from 'react';

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface UseMemoryMonitorOptions {
  alertThreshold?: number; // In MB
  logInterval?: number; // In milliseconds
  enabled?: boolean;
}

export const useMemoryMonitor = (options: UseMemoryMonitorOptions = {}) => {
  const {
    alertThreshold = 100, // 100MB
    logInterval = 30000, // 30 seconds
    enabled = process.env.NODE_ENV === 'development'
  } = options;

  const intervalRef = useRef<NodeJS.Timeout>();
  const lastMetrics = useRef<MemoryMetrics | null>(null);

  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  const formatBytes = useCallback((bytes: number) => {
    return Math.round(bytes / 1024 / 1024);
  }, []);

  const checkMemoryUsage = useCallback(() => {
    if (!enabled) return;

    const metrics = getMemoryMetrics();
    if (!metrics) return;

    const usedMB = formatBytes(metrics.usedJSHeapSize);
    const totalMB = formatBytes(metrics.totalJSHeapSize);
    const limitMB = formatBytes(metrics.jsHeapSizeLimit);

    // Check for memory leaks (significant increase)
    if (lastMetrics.current) {
      const previousUsedMB = formatBytes(lastMetrics.current.usedJSHeapSize);
      const increase = usedMB - previousUsedMB;
      
      if (increase > 20) { // More than 20MB increase
        logger.warn('Potential memory leak detected', {
          increase: `+${increase}MB`,
          previous: `${previousUsedMB}MB`,
          current: `${usedMB}MB`,
          total: `${totalMB}MB`
        }, 'useMemoryMonitor');
      }
    }

    // Alert if memory usage is too high
    if (usedMB > alertThreshold) {
      logger.warn('High memory usage detected', {
        used: `${usedMB}MB`,
        limit: `${limitMB}MB`,
        usage: `${((usedMB / limitMB) * 100).toFixed(1)}%`
      }, 'useMemoryMonitor');
    }

    lastMetrics.current = metrics;

    logger.debug('Memory usage stats', {
      used: `${usedMB}MB`,
      total: `${totalMB}MB`,
      limit: `${limitMB}MB`,
      usage: `${((usedMB / limitMB) * 100).toFixed(1)}%`
    }, 'useMemoryMonitor');
  }, [enabled, alertThreshold, formatBytes, getMemoryMetrics]);

  const forceGarbageCollection = useCallback(() => {
    if (enabled && window.gc) {
      window.gc();
      logger.info('Forced garbage collection executed', {}, 'useMemoryMonitor');
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(checkMemoryUsage, logInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, logInterval, checkMemoryUsage]);

  return {
    getMemoryMetrics,
    checkMemoryUsage,
    forceGarbageCollection,
    formatBytes
  };
};