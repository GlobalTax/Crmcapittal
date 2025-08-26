import { supabase } from '@/integrations/supabase/client';
import { HubSpotData, ImportResults } from '../types';
import { createLogger } from '@/utils/productionLogger';

export class HubSpotService {
  private static logger = createLogger('HubSpotService');

  static async fetchAllData(): Promise<HubSpotData> {
    try {
      this.logger.info('Fetching HubSpot data');

      // Fetch companies with stats
      const { data: companiesData, error: companiesError } = await supabase
        .from('hubspot_companies_with_stats')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch contacts with company info
      const { data: contactsData, error: contactsError } = await supabase
        .from('hubspot_contacts_with_company')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch deals with details
      const { data: dealsData, error: dealsError } = await supabase
        .from('hubspot_deals_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;
      if (contactsError) throw contactsError;
      if (dealsError) throw dealsError;

      const result = {
        companies: companiesData || [],
        contacts: contactsData || [],
        deals: dealsData || []
      };

      this.logger.info('HubSpot data fetched successfully', {
        companies: result.companies.length,
        contacts: result.contacts.length,
        deals: result.deals.length
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch HubSpot data', error);
      throw error;
    }
  }

  static async importData(importType: 'all' | 'companies' | 'contacts' | 'deals'): Promise<ImportResults> {
    try {
      this.logger.info('Starting HubSpot import', { type: importType });

      const { data, error } = await supabase.functions.invoke('hubspot-import', {
        body: { importType }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown import error');
      }

      this.logger.info('HubSpot import completed', data.results);
      return data.results;
    } catch (error) {
      this.logger.error('HubSpot import failed', error);
      throw error;
    }
  }

  static formatCurrency(amount?: number): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  static formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  static getStats(data: HubSpotData) {
    return {
      totalCompanies: data.companies.length,
      totalContacts: data.contacts.length,
      totalDeals: data.deals.length,
      totalRevenue: data.deals.reduce((sum, deal) => sum + (deal.deal_value || 0), 0),
      activeContacts: data.contacts.filter(c => c.is_active).length,
      activeDeals: data.deals.filter(d => d.is_active).length
    };
  }
}