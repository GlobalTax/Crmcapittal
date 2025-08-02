import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  [key: string]: any;
}

export abstract class BaseService {
  protected static handleError(error: PostgrestError | Error | any): string {
    console.error('Service Error:', error);
    
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Ha ocurrido un error inesperado';
  }

  protected static createResponse<T>(
    data: T | null, 
    error: string | null = null
  ): ServiceResponse<T> {
    return {
      data,
      error,
      success: error === null
    };
  }

  protected static get supabase() {
    return supabase;
  }
}