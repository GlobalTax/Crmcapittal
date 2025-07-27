
import { useState, useCallback, useEffect } from 'react';
import { Company, CreateCompanyData, UpdateCompanyData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const useOptimizedCompanies = () => {
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('Fetching companies...');
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        setError(error.message);
        setCompanies([]);
        logger.error('Error fetching companies', error);
        return;
      }
      
      setCompanies(data as Company[] || []);
      logger.debug('Companies fetched successfully', { count: data?.length || 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setCompanies([]);
      logger.error('Unexpected error fetching companies', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling every 5 minutes for production
  useEffect(() => {
    fetchCompanies();
    
    const interval = setInterval(() => {
      fetchCompanies();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [fetchCompanies]);

  const refetch = useCallback(() => {
    return fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = useCallback(async (companyData: CreateCompanyData) => {
    try {
      logger.info('Creating company', { companyData });
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const insertData = {
        ...companyData,
        created_by: user.user.id
      };
      
      const { data, error } = await supabase
        .from('companies')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Auto-enrich with eInforma if NIF is provided
      if (data.nif && data.nif.trim()) {
        try {
          logger.info('Starting auto-enrichment for company', { companyId: data.id, nif: data.nif });
          
          await supabase.functions.invoke('einforma-enrich-company', {
            body: { 
              nif: data.nif,
              companyId: data.id 
            }
          });
          
          logger.info('Auto-enrichment completed successfully');
        } catch (enrichError) {
          logger.warn('Auto-enrichment failed, but company was created successfully', enrichError);
        }
      }
      
      toast({
        title: "Empresa creada",
        description: `${companyData.name} ha sido creada correctamente.`,
      });
      
      refetch();
      
      return data as Company;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear empresa';
      logger.error('Error creating company', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refetch]);

  const updateCompany = useCallback(async (id: string, updates: UpdateCompanyData) => {
    try {
      logger.info('Updating company', { id, updates });
      
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Empresa actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
      
      // Refresh companies after update
      refetch();
      
      return data as Company;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar empresa';
      logger.error('Error updating company', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refetch]);

  const deleteCompany = useCallback(async (id: string) => {
    try {
      logger.info('Deleting company', { id });
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast({
        title: "Empresa eliminada",
        description: "La empresa ha sido eliminada correctamente.",
      });
      
      // Refresh companies after deletion
      refetch();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar empresa';
      logger.error('Error deleting company', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast, refetch]);

  const getCompanyById = useCallback((id: string) => {
    return companies.find(company => company.id === id) || null;
  }, [companies]);

  // Local search function for faster filtering
  const searchCompanies = useCallback((searchTerm: string, statusFilter?: string, typeFilter?: string) => {
    let filtered = companies;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name?.toLowerCase().includes(term) ||
        company.domain?.toLowerCase().includes(term) ||
        company.industry?.toLowerCase().includes(term) ||
        company.city?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(company => company.company_status === statusFilter);
    }
    
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(company => company.company_type === typeFilter);
    }
    
    return filtered;
  }, [companies]);

  return {
    companies,
    isLoading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    searchCompanies,
    refetch
  };
};
