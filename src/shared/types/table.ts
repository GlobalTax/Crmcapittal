/**
 * Table Types
 * 
 * Generic types for table components to replace 'any' usage
 */

import { ReactNode } from 'react';

export interface TableSortConfig<T = Record<string, unknown>> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

export interface TableFilterConfig {
  search: string;
  status: string;
  dateRange?: { from: Date; to: Date };
  [key: string]: unknown;
}

export interface TableColumnDef<T = Record<string, unknown>> {
  id: keyof T;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  className?: string;
}

export interface TablePaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumnDef<T>[];
  loading?: boolean;
  sortConfig?: TableSortConfig<T>;
  onSort?: (config: TableSortConfig<T>) => void;
  pagination?: TablePaginationConfig;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export interface TableRowProps<T = Record<string, unknown>> {
  row: T;
  columns: TableColumnDef<T>[];
  onClick?: (row: T) => void;
  className?: string;
}

export interface TableHeaderProps<T = Record<string, unknown>> {
  columns: TableColumnDef<T>[];
  sortConfig?: TableSortConfig<T>;
  onSort?: (config: TableSortConfig<T>) => void;
}

export interface TableActionsProps<T = Record<string, unknown>> {
  row: T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  customActions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive';
  }>;
}