import { BaseService, ServiceResponse, PaginationParams, FilterParams } from '../base/BaseService';
import { Operation } from '@/types/Operation';
import { Database } from '@/integrations/supabase/types';

type DbOperation = Database['public']['Tables']['operations']['Row'];
type OperationInsert = Database['public']['Tables']['operations']['Insert'];
type OperationUpdate = Database['public']['Tables']['operations']['Update'];

export interface CreateOperationData extends Omit<OperationInsert, 'id' | 'created_at' | 'updated_at'> {
  company_name: string;
}

export interface OperationFilters extends FilterParams {
  sector?: string;
  operationType?: string;
  location?: string;
  amountRange?: [number, number];
  revenueRange?: [number, number];
  growthRate?: number;
  dateRange?: string;
  status?: string;
}

export class OperationService extends BaseService {
  static async getOperations(role?: string, filters?: OperationFilters & PaginationParams): Promise<ServiceResponse<DbOperation[]>> {
    try {
      let query = this.supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (role && role !== 'admin' && role !== 'superadmin') {
        const { data: user } = await this.supabase.auth.getUser();
        if (user.user?.id) {
          query = query.eq('created_by', user.user.id);
        }
      }

      // Apply filters
      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,sector.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters?.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      // Apply amount range filter
      if (filters?.amountRange) {
        const [min, max] = filters.amountRange;
        if (min > 0) query = query.gte('amount', min);
        if (max < 100) query = query.lte('amount', max * 1000000); // Assuming max is in millions
      }

      // Apply revenue range filter
      if (filters?.revenueRange) {
        const [min, max] = filters.revenueRange;
        if (min > 0) query = query.gte('revenue', min);
        if (max < 100) query = query.lte('revenue', max * 1000000);
      }

      // Apply pagination
      if (filters?.limit) {
        const from = ((filters.page || 1) - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async getOperationById(id: string): Promise<ServiceResponse<DbOperation>> {
    try {
      const { data, error } = await this.supabase
        .from('operations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async createOperation(operationData: CreateOperationData): Promise<ServiceResponse<DbOperation>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('operations')
        .insert({
          ...operationData,
          created_by: user.user?.id
        } as OperationInsert)
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async updateOperation(id: string, updates: Partial<CreateOperationData>): Promise<ServiceResponse<DbOperation>> {
    try {
      const { data, error } = await this.supabase
        .from('operations')
        .update(updates as OperationUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteOperation(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('operations')
        .delete()
        .eq('id', id);
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(null);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async getOperationStats(): Promise<ServiceResponse<{
    total: number;
    available: number;
    totalValue: number;
    avgValue: number;
  }>> {
    try {
      const { data: operations, error } = await this.supabase
        .from('operations')
        .select('amount, status');
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }

      const total = operations?.length || 0;
      const available = operations?.filter(op => op.status === 'available').length || 0;
      const totalValue = operations?.reduce((sum, op) => sum + (op.amount || 0), 0) || 0;
      const avgValue = total > 0 ? totalValue / total : 0;

      return this.createResponse({
        total,
        available,
        totalValue,
        avgValue
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}