/**
 * Centralized shared types export
 * 
 * All common types and interfaces used across multiple features
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

// Specific feature types
export * from './reconversion';
export * from './table';
export * from './polling';

// Re-export commonly used types with clear aliases
export type {
  ReconversionData,
  ReconversionKanbanItem,
  ReconversionFilters,
  ReconversionStats
} from './reconversion';

export type {
  TableSortConfig,
  TableFilterConfig,
  TableColumnDef,
  TableProps,
  TableRowProps,
  TableHeaderProps,
  TableActionsProps
} from './table';

export type {
  PollingOptions,
  PollingResult,
  PollingState,
  PollingConfig,
  PollingMetrics
} from './polling';