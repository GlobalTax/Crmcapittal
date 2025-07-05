import { useCallback, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';

interface UseThrottledAnalyticsOptions {
  enableInteractionTracking?: boolean;
  enableScrollTracking?: boolean;
  enableHoverTracking?: boolean;
}

export const useThrottledAnalytics = (options: UseThrottledAnalyticsOptions = {}) => {
  const {
    enableInteractionTracking = true,
    enableScrollTracking = false,
    enableHoverTracking = false
  } = options;

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Throttled tracking methods
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analyticsService.track(event, properties);
  }, []);

  const trackClick = useCallback((element?: string, properties?: Record<string, any>) => {
    if (!enableInteractionTracking) return;
    analyticsService.trackInteraction('click', element, properties);
  }, [enableInteractionTracking]);

  const trackHover = useCallback((element?: string, properties?: Record<string, any>) => {
    if (!enableHoverTracking) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      analyticsService.trackInteraction('hover', element, properties);
    }, 100);
  }, [enableHoverTracking]);

  const trackScroll = useCallback((properties?: Record<string, any>) => {
    if (!enableScrollTracking) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      analyticsService.trackInteraction('scroll', undefined, {
        scroll_percent: scrollPercent,
        ...properties
      });
    }, 200);
  }, [enableScrollTracking]);

  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    analyticsService.trackPageView(page, properties);
  }, []);

  const trackSearch = useCallback((query: string, results?: number, properties?: Record<string, any>) => {
    analyticsService.trackSearch(query, results, properties);
  }, []);

  const trackFilter = useCallback((filterType: string, value: string, properties?: Record<string, any>) => {
    analyticsService.trackFilter(filterType, value, properties);
  }, []);

  const trackFormSubmit = useCallback((formName: string, properties?: Record<string, any>) => {
    analyticsService.track('form_submit', {
      form_name: formName,
      ...properties
    });
  }, []);

  const trackError = useCallback((error: string, context?: string, properties?: Record<string, any>) => {
    analyticsService.track('error', {
      error_message: error,
      context,
      ...properties
    });
  }, []);

  // Batch tracking for multiple events
  const trackBatch = useCallback((events: Array<{ event: string; properties?: Record<string, any> }>) => {
    events.forEach(({ event, properties }) => {
      analyticsService.track(event, properties);
    });
  }, []);

  // Get analytics stats for monitoring
  const getAnalyticsStats = useCallback(() => {
    return analyticsService.getStats();
  }, []);

  // Force flush pending events
  const flushAnalytics = useCallback(() => {
    analyticsService.flush();
  }, []);

  return {
    // Core tracking methods
    track,
    trackClick,
    trackHover,
    trackScroll,
    trackPageView,
    trackSearch,
    trackFilter,
    trackFormSubmit,
    trackError,
    trackBatch,
    
    // Utility methods
    getAnalyticsStats,
    flushAnalytics
  };
};

export default useThrottledAnalytics;