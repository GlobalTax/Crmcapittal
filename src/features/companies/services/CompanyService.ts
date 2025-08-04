import { BaseService } from '@/shared/services/BaseService';
import { ServiceResponse } from '@/shared/types/common';
import { FilterParams, PaginationParams } from '@/shared/types/common';
import { 
  Company, 
  CreateCompanyData, 
  CompanyActivity, 
  CompanyNote, 
  CompanyFile 
} from '../types/Company';

interface CompanyFilters extends FilterParams {
  sector?: string;
  location?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minEmployees?: number;
  maxEmployees?: number;
  companyType?: string;
  status?: string;
  isTargetAccount?: boolean;
}

export class CompanyService extends BaseService {
  static async getCompanies(filters?: CompanyFilters & PaginationParams): Promise<ServiceResponse<Company[]>> {
    try {
      let query = this.supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%,industry.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }
      
      if (filters?.sector) {
        query = query.eq('industry', filters.sector);
      }
      
      if (filters?.location) {
        query = query.eq('city', filters.location);
      }
      
      if (filters?.companyType) {
        query = query.eq('company_type', filters.companyType as any);
      }
      
      if (filters?.status) {
        query = query.eq('company_status', filters.status as any);
      }
      
      if (filters?.isTargetAccount !== undefined) {
        query = query.eq('is_target_account', filters.isTargetAccount);
      }
      
      if (filters?.minRevenue !== undefined) {
        query = query.gte('annual_revenue', filters.minRevenue);
      }
      
      if (filters?.maxRevenue !== undefined) {
        query = query.lte('annual_revenue', filters.maxRevenue);
      }
      
      if (filters?.minEmployees !== undefined) {
        query = query.gte('employee_count', filters.minEmployees);
      }
      
      if (filters?.maxEmployees !== undefined) {
        query = query.lte('employee_count', filters.maxEmployees);
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters?.page && filters?.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching companies:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: (data || []) as Company[],
        meta: { totalCount: count || 0 }
      };
    } catch (error) {
      console.error('Error in getCompanies:', error);
      return { success: false, error: 'Error al obtener empresas' };
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
        console.error('Error fetching company:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Empresa no encontrada' };
      }

      return { success: true, data: data as Company };
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      return { success: false, error: 'Error al obtener empresa' };
    }
  }

  static async createCompany(companyData: CreateCompanyData): Promise<ServiceResponse<Company>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      if (!user?.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await this.supabase
        .from('companies')
        .insert([
          {
            ...companyData,
            created_by: user.user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        return { success: false, error: error.message };
      }

      // Auto-enrich with eInforma if NIF is provided
      if (data.nif && data.nif.trim()) {
        try {
          await this.supabase.functions.invoke('einforma-enrich-company', {
            body: { 
              nif: data.nif,
              companyId: data.id 
            }
          });
        } catch (enrichError) {
          console.log('Auto-enrichment failed, but company was created successfully:', enrichError);
        }
      }

      return { success: true, data: data as Company };
    } catch (error) {
      console.error('Error in createCompany:', error);
      return { success: false, error: 'Error al crear empresa' };
    }
  }

  static async updateCompany(id: string, updates: Partial<CreateCompanyData>): Promise<ServiceResponse<Company>> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Company };
    } catch (error) {
      console.error('Error in updateCompany:', error);
      return { success: false, error: 'Error al actualizar empresa' };
    }
  }

  static async deleteCompany(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteCompany:', error);
      return { success: false, error: 'Error al eliminar empresa' };
    }
  }

  static async getCompanyActivities(companyId: string): Promise<ServiceResponse<CompanyActivity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('company_activities')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company activities:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: (data || []) as CompanyActivity[] };
    } catch (error) {
      console.error('Error in getCompanyActivities:', error);
      return { success: false, error: 'Error al obtener actividades' };
    }
  }

  static async getCompanyNotes(companyId: string): Promise<ServiceResponse<CompanyNote[]>> {
    try {
      const { data, error } = await this.supabase
        .from('company_notes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company notes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: (data || []) as CompanyNote[] };
    } catch (error) {
      console.error('Error in getCompanyNotes:', error);
      return { success: false, error: 'Error al obtener notas' };
    }
  }

  static async createCompanyNote(companyId: string, note: string, noteType?: string): Promise<ServiceResponse<CompanyNote>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      if (!user?.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data, error } = await this.supabase
        .from('company_notes')
        .insert([
          {
            company_id: companyId,
            note,
            note_type: noteType,
            created_by: user.user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating company note:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as CompanyNote };
    } catch (error) {
      console.error('Error in createCompanyNote:', error);
      return { success: false, error: 'Error al crear nota' };
    }
  }

  static async deleteCompanyNote(noteId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('company_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting company note:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteCompanyNote:', error);
      return { success: false, error: 'Error al eliminar nota' };
    }
  }

  static async getCompanyFiles(companyId: string): Promise<ServiceResponse<CompanyFile[]>> {
    try {
      const { data, error } = await this.supabase
        .from('company_files')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company files:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: (data || []).map(file => ({
        ...file,
        file_type: file.content_type
      })) as CompanyFile[] };
    } catch (error) {
      console.error('Error in getCompanyFiles:', error);
      return { success: false, error: 'Error al obtener archivos' };
    }
  }
}