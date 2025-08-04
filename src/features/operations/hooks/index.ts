/**
 * Operations Hooks
 * 
 * Custom hooks for operations state management and business logic
 */

// New feature-specific hooks
export { useOperations as useOperationsNew } from './useOperations';
export { useOperationsQuery as useOperationsQueryNew } from './useOperationsQuery';
export { useOperationsPagination as useOperationsPaginationNew } from './useOperationsPagination';
export { useOperationsFilter as useOperationsFilterNew } from './useOperationsFilter';
export { useOperationsOptimized as useOperationsOptimizedNew } from './useOperationsOptimized';

// Legacy exports for backward compatibility
export * from '@/hooks/useOperations';
export * from '@/hooks/useOperationsFilter';
export * from '@/hooks/operations/useOperationsQuery';
export * from '@/hooks/operations/useOperationsPagination';
export * from '@/hooks/operations/useOperationsOptimized';