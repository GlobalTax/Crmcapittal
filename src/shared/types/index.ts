/**
 * Shared Types
 * 
 * Common types and interfaces used across multiple features
 */

// Common base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Common API response types
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Common pagination types
export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Common filter state
export interface FilterState {
  search: string;
  dateRange: string;
  status: string;
}

// Common sorting
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}