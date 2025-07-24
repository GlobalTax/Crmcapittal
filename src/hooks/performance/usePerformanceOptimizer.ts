import { useEffect, useRef, useCallback } from 'react';
import { throttle, debounce } from '@/utils/performance';

interface UsePerformanceOptimizerOptions {
  enableVirtualization?: boolean;
  enableDebouncing?: boolean;
  enableThrottling?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
}

export const usePerformanceOptimizer = (options: UsePerformanceOptimizerOptions = {}) => {
  const {
    enableVirtualization = true,
    enableDebouncing = true,
    enableThrottling = true,
    debounceDelay = 300,
    throttleDelay = 100
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  // Track component renders
  useEffect(() => {
    renderCountRef.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component rendered ${renderCountRef.current} times`);
    }
  });

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback((handler: (event: Event) => void) => {
    if (!enableThrottling) return handler;
    return throttle(handler, throttleDelay);
  }, [enableThrottling, throttleDelay]);

  // Optimized search handler
  const createOptimizedSearchHandler = useCallback((handler: (value: string) => void) => {
    if (!enableDebouncing) return handler;
    return debounce(handler, debounceDelay);
  }, [enableDebouncing, debounceDelay]);

  // Performance monitoring
  const measureRenderTime = useCallback((componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${end - start}ms`);
      }
    };
  }, []);

  // Memory cleanup
  const cleanup = useCallback(() => {
    // Force garbage collection (development only)
    if (process.env.NODE_ENV === 'development' && window.gc) {
      window.gc();
    }
  }, []);

  return {
    scrollRef,
    renderCount: renderCountRef.current,
    createOptimizedScrollHandler,
    createOptimizedSearchHandler,
    measureRenderTime,
    cleanup
  };
};