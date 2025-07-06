import { supabase } from "@/integrations/supabase/client";
import { 
  EInformaCompanyFull, 
  EInformaSearchResult, 
  EInformaApiResponse,
  EInformaEnrichmentResult
} from "@/types/EInforma";

class EInformaService {
  private baseUrl = 'https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1';

  async searchCompanyByCIF(cif: string): Promise<EInformaCompanyFull | null> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-company-search', {
        body: { cif, search_type: 'cif' }
      });

      if (error) {
        console.error('Error searching company by CIF:', error);
        return null;
      }

      return data?.company || null;
    } catch (error) {
      console.error('EInforma CIF search failed:', error);
      return null;
    }
  }

  async searchCompanyByName(name: string, limit: number = 10): Promise<EInformaSearchResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-company-search', {
        body: { name, search_type: 'name', limit }
      });

      if (error) {
        console.error('Error searching company by name:', error);
        return [];
      }

      return data?.results || [];
    } catch (error) {
      console.error('EInforma name search failed:', error);
      return [];
    }
  }

  async enrichCompany(cif: string): Promise<EInformaEnrichmentResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-enrich-company', {
        body: { cif }
      });

      if (error) {
        console.error('Error enriching company:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('EInforma enrichment failed:', error);
      return null;
    }
  }

  async getFinancialData(cif: string, years?: number[]): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-financial-data', {
        body: { cif, years }
      });

      if (error) {
        console.error('Error getting financial data:', error);
        return [];
      }

      return data?.financial_data || [];
    } catch (error) {
      console.error('EInforma financial data failed:', error);
      return [];
    }
  }

  async getDirectors(cif: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-directors', {
        body: { cif }
      });

      if (error) {
        console.error('Error getting directors:', error);
        return [];
      }

      return data?.directors || [];
    } catch (error) {
      console.error('EInforma directors failed:', error);
      return [];
    }
  }

  async validateCIF(cif: string): Promise<boolean> {
    // Validación básica de formato de CIF español
    const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
    return cifRegex.test(cif.toUpperCase());
  }

  async saveEnrichmentResult(companyId: string, enrichmentData: EInformaEnrichmentResult): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('company_enrichments')
        .upsert({
          company_id: companyId,
          source: 'einforma',
          enrichment_data: enrichmentData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving enrichment result:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save enrichment result:', error);
      return false;
    }
  }

  async getEnrichmentHistory(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('company_enrichments')
        .select('*')
        .eq('company_id', companyId)
        .eq('source', 'einforma')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting enrichment history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get enrichment history:', error);
      return [];
    }
  }
}

export const einformaService = new EInformaService();