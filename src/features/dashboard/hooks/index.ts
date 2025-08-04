/**
 * Dashboard Hooks
 * 
 * Custom hooks for dashboard state management and business logic
 */

// New feature-specific hooks
export { useDashboardMetrics as useDashboardMetricsNew } from './useDashboardMetrics';
export { useActivityFeed as useActivityFeedNew } from './useActivityFeed';
export { useQuickActions as useQuickActionsNew } from './useQuickActions';

// Legacy exports for backward compatibility
export * from '@/hooks/useDashboardMetrics';