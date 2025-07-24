import { useRef, useEffect } from 'react';

interface RenderInfo {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

interface UseRenderTrackerOptions {
  enabled?: boolean;
  slowRenderThreshold?: number; // In milliseconds
  maxRecords?: number;
}

class RenderTracker {
  private static instance: RenderTracker;
  private renderInfoMap = new Map<string, RenderInfo>();
  private enabled: boolean;
  private slowRenderThreshold: number;
  private maxRecords: number;

  constructor(options: UseRenderTrackerOptions = {}) {
    this.enabled = options.enabled ?? process.env.NODE_ENV === 'development';
    this.slowRenderThreshold = options.slowRenderThreshold ?? 16; // 60fps
    this.maxRecords = options.maxRecords ?? 100;
  }

  static getInstance(options?: UseRenderTrackerOptions): RenderTracker {
    if (!RenderTracker.instance) {
      RenderTracker.instance = new RenderTracker(options);
    }
    return RenderTracker.instance;
  }

  trackRender(componentName: string, renderTime: number) {
    if (!this.enabled) return;

    const existing = this.renderInfoMap.get(componentName);
    
    if (existing) {
      const newCount = existing.renderCount + 1;
      const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount;
      const newSlowRenders = renderTime > this.slowRenderThreshold 
        ? existing.slowRenders + 1 
        : existing.slowRenders;

      this.renderInfoMap.set(componentName, {
        componentName,
        renderCount: newCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverage,
        slowRenders: newSlowRenders
      });

      // Alert for slow renders
      if (renderTime > this.slowRenderThreshold) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (avg: ${newAverage.toFixed(2)}ms)`);
      }
    } else {
      this.renderInfoMap.set(componentName, {
        componentName,
        renderCount: 1,
        lastRenderTime: renderTime,
        averageRenderTime: renderTime,
        slowRenders: renderTime > this.slowRenderThreshold ? 1 : 0
      });
    }

    // Keep only the most recent records
    if (this.renderInfoMap.size > this.maxRecords) {
      const firstKey = this.renderInfoMap.keys().next().value;
      this.renderInfoMap.delete(firstKey);
    }
  }

  getComponentStats(componentName: string): RenderInfo | undefined {
    return this.renderInfoMap.get(componentName);
  }

  getAllStats(): RenderInfo[] {
    return Array.from(this.renderInfoMap.values())
      .sort((a, b) => b.renderCount - a.renderCount);
  }

  getSlowComponents(): RenderInfo[] {
    return Array.from(this.renderInfoMap.values())
      .filter(info => info.slowRenders > 0)
      .sort((a, b) => b.slowRenders - a.slowRenders);
  }

  clear() {
    this.renderInfoMap.clear();
  }
}

export const useRenderTracker = (
  componentName: string, 
  options?: UseRenderTrackerOptions
) => {
  const renderStartTime = useRef<number>(0);
  const tracker = useRef<RenderTracker>(RenderTracker.getInstance(options));

  // Track render start
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // Track render end
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    tracker.current.trackRender(componentName, renderTime);
  });

  const getStats = () => tracker.current.getComponentStats(componentName);
  const getAllStats = () => tracker.current.getAllStats();
  const getSlowComponents = () => tracker.current.getSlowComponents();
  const clear = () => tracker.current.clear();

  return {
    getStats,
    getAllStats,
    getSlowComponents,
    clear
  };
};
