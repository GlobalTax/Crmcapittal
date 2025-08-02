import { BaseService, ServiceResponse, PaginationParams, FilterParams } from '../base/BaseService';
import { Database } from '@/integrations/supabase/types';

export type Company = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export interface CreateCompanyData extends Omit<CompanyInsert, 'id' | 'created_at' | 'updated_at'> {
  name: string;
}

export type CompanyActivity = Database['public']['Tables']['company_activities']['Row'];
export type CompanyNote = Database['public']['Tables']['company_notes']['Row'];
export type CompanyFile = Database['public']['Tables']['company_files']['Row'];

export class CompanyService extends BaseService {
  static async getCompanies(filters?: FilterParams & PaginationParams): Promise<ServiceResponse<Company[]>> {
    try {
      let query = this.supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('company_status', filters.status as any);
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

  static async getCompanyById(id: string): Promise<ServiceResponse<Company>> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
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

  static async createCompany(companyData: CreateCompanyData): Promise<ServiceResponse<Company>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('companies')
        .insert({
          ...companyData,
          created_by: user.user?.id
        } as CompanyInsert)
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

  static async updateCompany(id: string, updates: Partial<CreateCompanyData>): Promise<ServiceResponse<Company>> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .update(updates as CompanyUpdate)
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

  static async deleteCompany(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('companies')
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

  // Activities
  static async getCompanyActivities(companyId: string): Promise<ServiceResponse<CompanyActivity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('company_activities')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  // Notes
  static async getCompanyNotes(companyId: string): Promise<ServiceResponse<CompanyNote[]>> {
    try {
      const { data, error } = await this.supabase
        .from('company_notes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async createCompanyNote(companyId: string, note: string, noteType?: string): Promise<ServiceResponse<CompanyNote>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('company_notes')
        .insert({
          company_id: companyId,
          note,
          note_type: noteType || 'general',
          created_by: user.user?.id
        })
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

  static async deleteCompanyNote(noteId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('company_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(null);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  // Files
  static async getCompanyFiles(companyId: string): Promise<ServiceResponse<CompanyFile[]>> {
    try {
      const { data, error } = await this.supabase
        .from('company_files')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteCompanyFile(fileId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('company_files')
        .delete()
        .eq('id', fileId);
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(null);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}