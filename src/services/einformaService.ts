import { supabase } from "@/integrations/supabase/client";
import { 
  EInformaCompanyFull, 
  EInformaSearchResult, 
  EInformaApiResponse,
  EInformaEnrichmentResult
} from "@/types/EInforma";
import { logger } from '@/utils/productionLogger';

class EInformaService {
  private baseUrl = 'https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1';

  async searchCompanyByCIF(cif: string): Promise<EInformaCompanyFull | null> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-company-search', {
        body: { cif, search_type: 'cif' }
      });

      if (error) {
        logger.error('Failed to search company by CIF', { error, cif });
        return null;
      }

      return data?.company || null;
    } catch (error) {
      logger.error('EInforma CIF search failed', { error, cif });
      return null;
    }
  }

  async searchCompanyByName(name: string, limit: number = 10): Promise<EInformaSearchResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-company-search', {
        body: { name, search_type: 'name', limit }
      });

      if (error) {
        logger.error('Failed to search company by name', { error, name, limit });
        return [];
      }

      return data?.results || [];
    } catch (error) {
      logger.error('EInforma name search failed', { error, name, limit });
      return [];
    }
  }

  async enrichCompany(cif: string): Promise<EInformaEnrichmentResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('company-lookup-einforma', {
        body: { nif: cif }
      });

      if (error) {
        logger.error('Failed to enrich company', { error, cif });
        return null;
      }

      // Transform the simple company data into enrichment format
      if (data?.success && data?.data) {
        return {
          confidence_score: 0.8,
          enrichment_date: new Date().toISOString(),
          source: 'einforma',
          company_data: {
            cif: data.data.nif,
            razon_social: data.data.name,
            direccion: data.data.address_street,
            poblacion: data.data.address_city,
            codigo_postal: data.data.address_postal_code,
            provincia: data.data.address_city, // Using city as province for now
            actividad_principal: data.data.business_sector,
            situacion_juridica: data.data.status === 'activo' ? 'activa' : 'inactiva'
          }
        };
      }

      return null;
    } catch (error) {
      logger.error('EInforma enrichment failed', { error, cif });
      return null;
    }
  }

  async getFinancialData(cif: string, years?: number[]): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-financial-data', {
        body: { cif, years }
      });

      if (error) {
        logger.error('Failed to get financial data', { error, cif, years });
        return [];
      }

      return data?.financial_data || [];
    } catch (error) {
      logger.error('EInforma financial data failed', { error, cif, years });
      return [];
    }
  }

  async getBalanceSheet(cif: string, years?: number[]): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-balance-sheet', {
        body: { cif, years }
      });

      if (error) {
        logger.error('Failed to get balance sheet', { error, cif, years });
        return [];
      }

      return data?.balance_sheet || [];
    } catch (error) {
      logger.error('EInforma balance sheet failed', { error, cif, years });
      return [];
    }
  }

  async getIncomeStatement(cif: string, years?: number[]): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-income-statement', {
        body: { cif, years }
      });

      if (error) {
        logger.error('Failed to get income statement', { error, cif, years });
        return [];
      }

      return data?.income_statement || [];
    } catch (error) {
      logger.error('EInforma income statement failed', { error, cif, years });
      return [];
    }
  }

  async getCreditInfo(cif: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-credit-info', {
        body: { cif }
      });

      if (error) {
        logger.error('Failed to get credit info', { error, cif });
        return null;
      }

      return data?.credit_info || null;
    } catch (error) {
      logger.error('EInforma credit info failed', { error, cif });
      return null;
    }
  }

  async getDirectors(cif: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('einforma-directors', {
        body: { cif }
      });

      if (error) {
        logger.error('Failed to get directors', { error, cif });
        return [];
      }

      return data?.directors || [];
    } catch (error) {
      logger.error('EInforma directors failed', { error, cif });
      return [];
    }
  }

  async validateCIF(cif: string): Promise<boolean> {
    // Enhanced NIF/CIF validation for Spanish tax identifiers
    if (!cif || typeof cif !== 'string') return false;
    
    const cleanCif = cif.trim().toUpperCase();
    
    // Validate format: Letter + 7 digits + Letter/Digit for CIF
    const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
    // Standard Spanish NIF: 8 digits + letter
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    // NIE format: X/Y/Z + 7 digits + letter
    const nieRegex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    
    return cifRegex.test(cleanCif) || nifRegex.test(cleanCif) || nieRegex.test(cleanCif);
  }

  async saveEnrichmentResult(companyId: string, enrichmentData: EInformaEnrichmentResult): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('company_enrichments')
        .upsert({
          company_id: companyId,
          source: 'einforma',
          enrichment_data: enrichmentData as any,
          confidence_score: enrichmentData.confidence_score,
          enrichment_date: enrichmentData.enrichment_date,
          updated_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to save enrichment result', { error, companyId });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to save enrichment result', { error, companyId });
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
        logger.error('Failed to get enrichment history', { error, companyId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get enrichment history', { error, companyId });
      return [];
    }
  }

  async enrichCompanyWithEInforma(nif: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    try {
      // Validar formato del NIF/CIF
      if (!await this.validateCIF(nif)) {
        return {
          success: false,
          message: 'Formato de NIF/CIF inválido',
          error: 'INVALID_NIF_FORMAT'
        };
      }

      logger.debug('Enriching company with NIF', { nif });

      // Llamar a la API de eInforma
      const enrichmentResult = await this.enrichCompany(nif);
      
      if (!enrichmentResult) {
        return {
          success: false,
          message: 'No se pudo obtener información de eInforma para este NIF',
          error: 'EINFORMA_API_FAILED'
        };
      }

      const companyData = enrichmentResult.company_data;
      const financialData = enrichmentResult.financial_data?.[0];

      if (!companyData) {
        return {
          success: false,
          message: 'Empresa no encontrada en eInforma',
          error: 'COMPANY_NOT_FOUND'
        };
      }

      // Extraer datos específicos de eInforma
      const extractedData = {
        sector: companyData.actividad_principal || null,
        employees: financialData?.empleados || null,
        cnae: companyData.cnae || null,
        city: companyData.poblacion || null,
        province: companyData.provincia || null,
        revenue: financialData?.ingresos_explotacion || null,
        founded_year: companyData.fecha_constitucion ? 
          new Date(companyData.fecha_constitucion).getFullYear() : null,
        nif: nif.toUpperCase()
      };

      // Buscar si la empresa ya existe en nuestra base de datos
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', `%${companyData.razon_social}%`)
        .limit(1)
        .maybeSingle();

      let companyId: string;

      if (existingCompany) {
        // Actualizar empresa existente con datos de eInforma
        const { data: updatedCompany, error: updateError } = await supabase
          .from('companies')
          .update({
            industry: extractedData.sector,
            city: extractedData.city,
            state: extractedData.province,
            annual_revenue: extractedData.revenue,
            founded_year: extractedData.founded_year,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCompany.id)
          .select('id')
          .single();

        if (updateError) {
          logger.error('Failed to update company', { error: updateError, companyId: existingCompany.id });
          return {
            success: false,
            message: 'Error al actualizar los datos de la empresa',
            error: 'DATABASE_UPDATE_FAILED'
          };
        }

        companyId = updatedCompany.id;
      } else {
        // Crear nueva empresa con datos de eInforma
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            name: companyData.razon_social,
            industry: extractedData.sector,
            city: extractedData.city,
            state: extractedData.province,
            annual_revenue: extractedData.revenue,
            founded_year: extractedData.founded_year,
            company_size: this.estimateCompanySize(extractedData.employees),
            company_type: 'prospect',
            company_status: 'prospecto',
            lifecycle_stage: 'lead',
            country: 'España',
            created_by: user?.id,
            is_target_account: false,
            is_key_account: false,
            is_franquicia: false
          })
          .select('id')
          .single();

        if (createError) {
          logger.error('Failed to create company', { error: createError });
          return {
            success: false,
            message: 'Error al crear la empresa en la base de datos',
            error: 'DATABASE_CREATE_FAILED'
          };
        }

        companyId = newCompany.id;
      }

      // Guardar datos de enriquecimiento completos
      const saveResult = await this.saveEnrichmentResult(companyId, enrichmentResult);
      
      if (!saveResult) {
        return {
          success: false,
          message: 'Error al guardar los datos de enriquecimiento',
          error: 'ENRICHMENT_SAVE_FAILED'
        };
      }

      return {
        success: true,
        message: `Empresa ${companyData.razon_social} enriquecida exitosamente`,
        data: {
          companyId,
          companyName: companyData.razon_social,
          extractedData,
          confidenceScore: enrichmentResult.confidence_score
        }
      };

    } catch (error) {
      logger.error('Error in enrichCompanyWithEInforma', { error, nif });
      return {
        success: false,
        message: 'Error interno al procesar el enriquecimiento',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  private estimateCompanySize(employees?: number): '1-10' | '11-50' | '51-200' | '201-500' | '500+' {
    if (!employees) return '11-50';
    if (employees <= 10) return '1-10';
    if (employees <= 50) return '11-50';
    if (employees <= 200) return '51-200';
    if (employees <= 500) return '201-500';
    return '500+';
  }
}

export const einformaService = new EInformaService();