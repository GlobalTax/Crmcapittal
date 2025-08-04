/**
 * Shared Services
 * 
 * Common services and utilities for API calls, data processing, etc.
 */

// Supabase client
export { supabase } from '@/integrations/supabase/client';

// API configuration
export const API_CONFIG = {
  supabaseUrl: 'https://nbvvdaprcecaqvvkqcto.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo'
};

// Common API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Generic service error handler
export const handleServiceError = (error: any): string => {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Ha ocurrido un error inesperado';
};

// Generic success response
export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  error: null,
  success: true
});

// Generic error response
export const createErrorResponse = (error: string): ApiResponse<null> => ({
  data: null,
  error,
  success: false
});

// Legacy exports for backward compatibility
export * from '@/integrations/supabase/client';