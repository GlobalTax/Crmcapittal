/**
 * Shared Hooks
 * 
 * Generic hooks that can be used across multiple features
 */

// Generic utility hooks
export { useDebounce } from '@/hooks/useDebounce';

// Performance hooks
export { useBatchedQueries } from '@/hooks/performance/useBatchedQueries';
export { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
export { useVirtualization } from '@/hooks/useVirtualization';

// Layout hooks
export { useIsMobile } from '@/hooks/use-mobile';

// Legacy exports for backward compatibility
export * from '@/hooks/useDebounce';