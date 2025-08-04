// Common types shared across the application

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    totalCount?: number;
    page?: number;
    limit?: number;
  };
}

export interface BaseStore {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}