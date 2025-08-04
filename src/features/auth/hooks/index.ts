/**
 * Auth Hooks
 */

// New feature-specific hooks
export { useUserRole as useUserRoleNew, useHasRole } from './useUserRole';
export * from './useUserProfile';

// Legacy exports for backward compatibility
export * from '@/hooks/useUserRole';