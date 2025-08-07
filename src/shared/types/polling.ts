/**
 * Polling Types
 * 
 * Types for optimized polling hooks to replace 'any' usage
 */

export interface PollingOptions<T = unknown> {
  queryKey: string;
  queryFn: () => Promise<T>;
  interval?: number;
  priority?: 'high' | 'medium' | 'low';
  enabled?: boolean;
  cacheTtl?: number;
  retryOnError?: boolean;
  maxRetries?: number;
}

export interface PollingState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: Date;
  currentInterval: number;
  isStale: boolean;
}

export interface PollingResult<T = unknown> extends PollingState<T> {
  refetch: () => Promise<void>;
}

export interface PollingConfig {
  interval: number;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
  cacheTtl: number;
  retryOnError: boolean;
  maxRetries: number;
}

export interface PollingMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: Date | null;
  cacheHitRate: number;
}

export interface RequestManagerOptions<T = unknown> {
  key: string;
  priority: 'high' | 'medium' | 'low';
  cacheTtl: number;
  fn: () => Promise<T>;
}