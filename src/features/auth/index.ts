/**
 * Authentication Feature Module
 * 
 * This module handles all authentication-related functionality including:
 * - User authentication and authorization
 * - Role-based access control (RBAC)
 * - Session management
 * - User profile management
 */

// Re-export all auth types
export * as AuthTypes from './types';

// Re-export all auth hooks  
export * from './hooks';

// Re-export all auth services
export * from './services';

// Re-export all auth components
export * from './components';

// Re-export auth contexts
export * from './contexts';