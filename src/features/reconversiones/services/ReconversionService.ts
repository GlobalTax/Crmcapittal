/**
 * Reconversion Service
 * 
 * Centralized service for reconversion operations
 */

import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/productionLogger';
import type { Database } from '@/integrations/supabase/types';
import { 
  ReconversionStatus,
  ReconversionPriority,
  ReconversionFilters
} from '@/types/Reconversion';

type DatabaseReconversion = Database['public']['Tables']['reconversiones']['Row'];
type DatabaseReconversionInsert = Database['public']['Tables']['reconversiones']['Insert'];

export class ReconversionService {
  private static logger = createLogger('ReconversionService');

  // Fetch operations
  static async getReconversiones(): Promise<DatabaseReconversion[]> {
    try {
      this.logger.info('Fetching reconversiones');

      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.logger.info('Reconversiones fetched successfully', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      this.logger.error('Error fetching reconversiones', error);
      throw error;
    }
  }

  static async getReconversionById(id: string): Promise<DatabaseReconversion | null> {
    try {
      this.logger.info('Fetching reconversion by ID', { id });

      const { data, error } = await supabase
        .from('reconversiones')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      this.logger.info('Reconversion fetched successfully');
      return data;
    } catch (error) {
      this.logger.error('Error fetching reconversion by ID', error);
      throw error;
    }
  }

  static async getReconversionesWithFilters(filters: Record<string, any>): Promise<DatabaseReconversion[]> {
    try {
      this.logger.info('Fetching filtered reconversiones', { filters });

      // Use the simplest approach - fetch all and filter in memory for now
      // This avoids the deep type instantiation issue with Supabase query builder
      const { data: allData, error } = await supabase
        .from('reconversiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allData) return [];

      // Apply filters in memory to avoid type complexity
      let filteredData = allData;

      if (filters.status && filters.status !== 'all') {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }

      if (filters.assignedTo && filters.assignedTo !== 'all') {
        filteredData = filteredData.filter(item => item.assigned_to === filters.assignedTo);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.company_name?.toLowerCase().includes(searchLower) ||
          item.contact_name?.toLowerCase().includes(searchLower) ||
          item.contact_email?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.investmentRange?.min) {
        filteredData = filteredData.filter(item => 
          (item.investment_capacity_min || 0) >= filters.investmentRange.min
        );
      }

      if (filters.investmentRange?.max) {
        filteredData = filteredData.filter(item => 
          (item.investment_capacity_max || 0) <= filters.investmentRange.max
        );
      }

      if (filters.createdDateRange?.from) {
        const fromDate = new Date(filters.createdDateRange.from);
        filteredData = filteredData.filter(item => 
          new Date(item.created_at) >= fromDate
        );
      }

      if (filters.createdDateRange?.to) {
        const toDate = new Date(filters.createdDateRange.to);
        filteredData = filteredData.filter(item => 
          new Date(item.created_at) <= toDate
        );
      }

      return filteredData;
    } catch (error) {
      this.logger.error('Error fetching filtered reconversiones', error);
      throw error;
    }
  }

  // Create operations
  static async createReconversion(reconversionData: DatabaseReconversionInsert): Promise<DatabaseReconversion> {
    try {
      this.logger.info('Creating reconversion', { company: reconversionData.company_name });

      const { data, error } = await supabase
        .from('reconversiones')
        .insert(reconversionData)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Reconversion created successfully', { id: data.id });
      return data;
    } catch (error) {
      this.logger.error('Error creating reconversion', error);
      throw error;
    }
  }

  // Update operations
  static async updateReconversion(
    id: string, 
    updates: Partial<DatabaseReconversionInsert>
  ): Promise<DatabaseReconversion> {
    try {
      this.logger.info('Updating reconversion', { id, updates: Object.keys(updates) });

      const { data, error } = await supabase
        .from('reconversiones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Reconversion updated successfully', { id });
      return data;
    } catch (error) {
      this.logger.error('Error updating reconversion', error);
      throw error;
    }
  }

  static async assignReconversion(id: string, assignedTo: string): Promise<DatabaseReconversion> {
    try {
      this.logger.info('Assigning reconversion', { id, assignedTo });

      const { data, error } = await supabase
        .from('reconversiones')
        .update({ assigned_to: assignedTo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Reconversion assigned successfully', { id });
      return data;
    } catch (error) {
      this.logger.error('Error assigning reconversion', error);
      throw error;
    }
  }

  // Delete operations
  static async deleteReconversion(id: string): Promise<void> {
    try {
      this.logger.info('Deleting reconversion', { id });

      const { error } = await supabase
        .from('reconversiones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.logger.info('Reconversion deleted successfully', { id });
    } catch (error) {
      this.logger.error('Error deleting reconversion', error);
      throw error;
    }
  }

  // Stats operations
  static getReconversionStats(reconversiones: any[]) {
    const stats = {
      total: reconversiones.length,
      active: reconversiones.filter(r => r.status === 'active').length,
      matching: reconversiones.filter(r => r.status === 'matching').length,
      paused: reconversiones.filter(r => r.status === 'paused').length,
      closed: reconversiones.filter(r => r.status === 'closed').length,
      high_priority: reconversiones.filter(r => 
        r.priority === 'high' || 
        r.priority === 'urgent' || 
        r.priority === 'alta' || 
        r.priority === 'critica'
      ).length,
      average_investment: 0,
      total_investment_capacity: 0
    };

    // Calculate investment stats
    const reconversionesWithInvestment = reconversiones.filter(r => r.investment_capacity_min || r.investment_capacity_max);
    
    if (reconversionesWithInvestment.length > 0) {
      const totalInvestment = reconversionesWithInvestment.reduce((sum, r) => {
        const min = r.investment_capacity_min || 0;
        const max = r.investment_capacity_max || min;
        return sum + ((min + max) / 2);
      }, 0);
      
      stats.average_investment = totalInvestment / reconversionesWithInvestment.length;
      stats.total_investment_capacity = totalInvestment;
    }

    return stats;
  }
}