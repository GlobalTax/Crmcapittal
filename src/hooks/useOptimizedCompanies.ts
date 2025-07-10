import { useState, useCallback, useEffect } from 'react';
import { Company, CreateCompanyData, UpdateCompanyData } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOptimizedCompanies = () => {
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        setError(fetchError.message);
        setCompanies([]);
        return;
      }
      
      setCompanies(data as Company[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCompanies([]);
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
          await supabase.functions.invoke('einforma-enrich-company', {
            body: { 
              nif: data.nif,
              companyId: data.id 
            }
          });
        } catch (enrichError) {
          console.log('Auto-enrichment failed, but company was created successfully:', enrichError);
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