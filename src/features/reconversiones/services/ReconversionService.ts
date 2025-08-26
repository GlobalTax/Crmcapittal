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

  static async getReconversionesWithFilters(filters: any): Promise<any[]> {
    try {
      this.logger.info('Fetching filtered reconversiones', { filters });

      let query = supabase
        .from('reconversiones')
        .select('*');

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority as string);
      }

      if (filters.assignedTo && filters.assignedTo !== 'all') {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
      }

      if (filters.investmentRange.min) {
        query = query.gte('investment_capacity_min', filters.investmentRange.min);
      }

      if (filters.investmentRange.max) {
        query = query.lte('investment_capacity_max', filters.investmentRange.max);
      }

      if (filters.createdDateRange.from) {
        query = query.gte('created_at', filters.createdDateRange.from.toISOString());
      }

      if (filters.createdDateRange.to) {
        query = query.lte('created_at', filters.createdDateRange.to.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
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